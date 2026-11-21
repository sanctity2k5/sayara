"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Expand,
  GitCompareArrows,
  MapPin,
  MessageSquare,
  MoveHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import manifestRaw from "@/data/image-manifest.json";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { InquiryModal } from "@/components/vehicles/InquiryModal";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles, selectVehicleById } from "@/store/selectors";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { cn, formatDate, formatMileage, formatPrice } from "@/lib/utils";
import type { ImageManifestEntry } from "@/lib/types";

const MANIFEST_VIEW_MAP = new Map<string, "exterior" | "interior">(
  (manifestRaw as ImageManifestEntry[]).map((m) => [m.file, m.view ?? "exterior"])
);

function isInteriorPhoto(src: string): boolean {
  const mapped = MANIFEST_VIEW_MAP.get(src);
  if (mapped) return mapped === "interior";
  return src.toLowerCase().includes("interior");
}

interface VehicleDetailClientProps {
  id: string;
}

export function VehicleDetailClient({ id }: VehicleDetailClientProps) {
  const { isSignedIn, requireAuth } = useRequireAuth();
  const vehicle = useSayaraStore((s) => selectVehicleById(s, id));
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const savedIds = useSayaraStore((s) => s.savedIds);
  const compareIds = useSayaraStore((s) => s.compareIds);
  const prefs = useSayaraStore((s) => s.preferences);
  const toggleSaved = useSayaraStore((s) => s.toggleSaved);
  const toggleCompare = useSayaraStore((s) => s.toggleCompare);
  const recordView = useSayaraStore((s) => s.recordView);

  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Drag-to-scrub angle state
  const dragStartXRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (vehicle && isSignedIn) {
      recordView(vehicle.id);
    }
  }, [vehicle, isSignedIn, recordView]);

  const { exteriorImages, interiorImages } = useMemo(() => {
    const all = vehicle?.images ?? [];
    const ext = all.filter((img) => !isInteriorPhoto(img));
    const intr = all.filter((img) => isInteriorPhoto(img));
    return {
      exteriorImages: ext.length > 0 ? ext : all.length > 0 ? all : [""],
      interiorImages: intr,
    };
  }, [vehicle]);

  const images =
    activeTab === "interior" && interiorImages.length > 0 ? interiorImages : exteriorImages;

  const safeIdx = Math.min(activeImgIdx, Math.max(0, images.length - 1));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImgIdx((i) => (i - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        setActiveImgIdx((i) => (i + 1) % images.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length]);

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return activeVehicles
      .filter(
        (v) => v.id !== vehicle.id && (v.bodyType === vehicle.bodyType || v.make === vehicle.make)
      )
      .slice(0, 3);
  }, [activeVehicles, vehicle]);

  if (!vehicle) {
    return (
      <div className="flex min-h-screen flex-col bg-bg text-ink">
        <Navbar />
        <main
          id="main-content"
          className="mx-auto flex flex-1 max-w-2xl flex-col items-center justify-center px-4 py-24 text-center"
        >
          <p className="kicker">Vehicle Unavailable</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Vehicle not found</h1>
          <p className="mt-2 text-sm text-muted">
            This listing may have been removed or sold.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-signal px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Inventory</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const isSaved = savedIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);
  const currentImg = images[safeIdx] ?? images[0];

  const prevImage = () => setActiveImgIdx((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImgIdx((i) => (i + 1) % images.length);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null || images.length <= 1) return;
    const dx = e.clientX - dragStartXRef.current;
    const threshold = 70;
    if (Math.abs(dx) >= threshold) {
      if (dx > 0) {
        prevImage();
      } else {
        nextImage();
      }
      dragStartXRef.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    dragStartXRef.current = null;
    setIsDragging(false);
  };

  const specRows: { label: string; value: string }[] = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Model Year", value: String(vehicle.year) },
    { label: "Body Type", value: vehicle.bodyType },
    { label: "Exterior Color", value: vehicle.color },
    { label: "Mileage", value: formatMileage(vehicle.mileage, prefs.distanceUnit) },
    { label: "Engine", value: vehicle.specs.engine },
    { label: "Horsepower", value: `${vehicle.specs.horsepower} hp` },
    { label: "Torque", value: vehicle.specs.torque },
    { label: "0–60 mph", value: vehicle.specs.zeroToSixty },
    { label: "Fuel Type", value: vehicle.fuel },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Drivetrain", value: vehicle.specs.drivetrain },
    { label: "Seating / Doors", value: `${vehicle.specs.seats} seats · ${vehicle.specs.doors} doors` },
    { label: "VIN", value: vehicle.specs.vin },
    { label: "Listed Date", value: formatDate(vehicle.createdAt) },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Browse</span>
          </Link>
          <span className="rounded-sm border border-line bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-champagne">
            Status: {vehicle.status}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Multi-Angle Exterior / Interior Gallery & Specs */}
          <div className="space-y-8 lg:col-span-8">
            <div className="space-y-3">
              {/* Exterior / Interior Switcher + Angle Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  role="tablist"
                  aria-label="Vehicle photo views"
                  className="inline-flex rounded-md border border-line bg-surface p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "exterior"}
                    onClick={() => {
                      setActiveTab("exterior");
                      setActiveImgIdx(0);
                    }}
                    className={cn(
                      "rounded px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition",
                      activeTab === "exterior"
                        ? "bg-signal text-white"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    Exterior ({exteriorImages.length})
                  </button>
                  {interiorImages.length > 0 && (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "interior"}
                      onClick={() => {
                        setActiveTab("interior");
                        setActiveImgIdx(0);
                      }}
                      className={cn(
                        "rounded px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition",
                        activeTab === "interior"
                          ? "bg-signal text-white"
                          : "text-muted hover:text-ink"
                      )}
                    >
                      Interior ({interiorImages.length})
                    </button>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    <MoveHorizontal className="h-3.5 w-3.5 text-champagne" />
                    <span>Drag photo to scrub angles</span>
                    <span className="rounded bg-surface px-2 py-0.5 text-ink">
                      {safeIdx + 1} / {images.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Interactive Stage */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={() => setLightboxOpen(true)}
                className={cn(
                  "group relative aspect-[16/10] select-none overflow-hidden rounded-lg border border-line bg-surface",
                  images.length > 1 && (isDragging ? "cursor-grabbing" : "cursor-grab")
                )}
              >
                <VehicleImage
                  src={currentImg}
                  alt={`${title} — ${activeTab} view ${safeIdx + 1}`}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="pointer-events-none"
                />

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open full-screen photo lightbox"
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/65 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-black/85"
                >
                  <Expand className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={prevImage}
                      aria-label="Previous angle"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2 text-white backdrop-blur-sm transition hover:bg-black/85"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={nextImage}
                      aria-label="Next angle"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2 text-white backdrop-blur-sm transition hover:bg-black/85"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Angle Progress Dots */}
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => setActiveImgIdx(idx)}
                          aria-label={`Jump to angle ${idx + 1}`}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === safeIdx ? "w-5 bg-signal" : "w-1.5 bg-white/50 hover:bg-white"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Filmstrip */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveImgIdx(idx)}
                      aria-label={`View ${activeTab} photo ${idx + 1}`}
                      className={cn(
                        "relative aspect-[16/10] overflow-hidden rounded-md border transition",
                        idx === safeIdx
                          ? "border-signal ring-1 ring-signal"
                          : "border-line opacity-75 hover:opacity-100"
                      )}
                    >
                      <VehicleImage
                        src={img}
                        alt={`${title} ${activeTab} thumbnail ${idx + 1}`}
                        sizes="160px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Specifications Table */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <p className="kicker">Technical Dossier</p>
              <h2 className="mt-1.5 font-display text-2xl font-bold">Full Specifications</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5 text-sm"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {row.label}
                    </dt>
                    <dd className="text-right font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Right: Sticky Price & Action Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5 rounded-lg border border-line bg-surface p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
                  {vehicle.bodyType} · {vehicle.color}
                </p>
                <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight text-ink">
                  {title}
                </h1>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5 text-champagne" />
                  <span>{vehicle.location}</span>
                </p>
              </div>

              <div className="border-y border-line py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Asking Price
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-champagne">
                  {formatPrice(vehicle.price, prefs.currency)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-elevated p-3">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {vehicle.specs.horsepower}
                  </p>
                  <p className="font-mono text-[10px] uppercase text-muted">HP</p>
                </div>
                <div className="rounded-md bg-elevated p-3">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {vehicle.specs.zeroToSixty}
                  </p>
                  <p className="font-mono text-[10px] uppercase text-muted">0–60</p>
                </div>
                <div className="rounded-md bg-elevated p-3">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {vehicle.specs.drivetrain}
                  </p>
                  <p className="font-mono text-[10px] uppercase text-muted">Drive</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth()) return;
                    setInquiryOpen(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-signal py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-signal-hover"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Inquiry / Make Offer</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth()) return;
                      toggleSaved(vehicle.id);
                      toast.success(isSaved ? "Removed from saved" : "Vehicle saved");
                    }}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-semibold uppercase tracking-[0.13em] transition",
                      isSaved
                        ? "border-champagne bg-champagne/15 text-champagne"
                        : "border-line bg-bg text-ink hover:border-ink/40"
                    )}
                  >
                    <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth()) return;
                      const added = toggleCompare(vehicle.id);
                      if (added) toast.success("Added to comparison");
                    }}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-semibold uppercase tracking-[0.13em] transition",
                      isCompared
                        ? "border-signal bg-signal text-white"
                        : "border-line bg-bg text-ink hover:border-ink/40"
                    )}
                  >
                    <GitCompareArrows className="h-3.5 w-3.5" />
                    <span>{isCompared ? "Comparing" : "Compare"}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Vehicles */}
        {similarVehicles.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <p className="kicker">Curated Alternatives</p>
            <h2 className="mt-1.5 font-display text-display-md font-bold">Similar Vehicles</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similarVehicles.map((sim) => (
                <VehicleCard key={sim.id} vehicle={sim} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Zoomable Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
          onClick={() => {
            setLightboxOpen(false);
            setZoomed(false);
          }}
        >
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              className="rounded-md border border-white/20 bg-black/70 p-2 text-white hover:bg-black"
            >
              {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setLightboxOpen(false);
                setZoomed(false);
              }}
              aria-label="Close lightbox"
              className="rounded-md border border-white/20 bg-black/70 p-2 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-lg border border-white/15 bg-black"
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
          >
            <VehicleImage
              src={currentImg}
              alt={`${title} — ${activeTab} view ${safeIdx + 1}`}
              sizes="95vw"
              priority
              className={cn(
                "transition-transform duration-300",
                zoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
              )}
            />
          </div>
        </div>
      )}

      <InquiryModal vehicle={vehicle} open={inquiryOpen} onClose={() => setInquiryOpen(false)} />

      <Footer />
    </div>
  );
}
