"use client";

import Link from "next/link";
import { Bookmark, Fuel, Gauge, GitCompareArrows, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Vehicle } from "@/lib/types";
import { cn, formatMileage, formatPrice } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { VehicleImage } from "@/components/ui/VehicleImage";

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: "grid" | "list";
}

export function VehicleCard({ vehicle, viewMode = "grid" }: VehicleCardProps) {
  const { requireAuth } = useRequireAuth();
  const savedIds = useSayaraStore((s) => s.savedIds);
  const compareIds = useSayaraStore((s) => s.compareIds);
  const prefs = useSayaraStore((s) => s.preferences);
  const toggleSaved = useSayaraStore((s) => s.toggleSaved);
  const toggleCompare = useSayaraStore((s) => s.toggleCompare);

  const isSaved = savedIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    toggleSaved(vehicle.id);
    toast.success(isSaved ? `Removed ${title} from saved` : `Saved ${title}`);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    const added = toggleCompare(vehicle.id);
    if (added) {
      toast.success(`Added ${vehicle.make} ${vehicle.model} to comparison`);
    } else if (isCompared) {
      toast("Removed from comparison");
    }
  };

  if (viewMode === "list") {
    return (
      <article className="group grid overflow-hidden rounded-lg border border-line bg-surface transition hover:border-ink/35 sm:grid-cols-12">
        <Link
          href={`/vehicle/${vehicle.id}`}
          className="relative aspect-[16/10] overflow-hidden bg-elevated sm:col-span-4 sm:aspect-auto sm:min-h-[190px]"
        >
          <VehicleImage
            src={vehicle.images[0]}
            alt={title}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-sm bg-bg/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-champagne backdrop-blur-sm">
            {vehicle.bodyType}
          </span>
        </Link>

        <div className="flex flex-col justify-between p-5 sm:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {vehicle.year} · {vehicle.color}
              </p>
              <Link
                href={`/vehicle/${vehicle.id}`}
                className="mt-1 block font-display text-xl font-bold text-ink transition hover:text-signal"
              >
                {vehicle.make} {vehicle.model}
              </Link>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5 text-champagne" />
                <span>{vehicle.location}</span>
              </p>
            </div>
            <p className="font-mono text-lg font-semibold text-champagne">
              {formatPrice(vehicle.price, prefs.currency)}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap gap-4 font-mono text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                {formatMileage(vehicle.mileage, prefs.distanceUnit)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5" />
                {vehicle.fuel}
              </span>
              <span>{vehicle.transmission}</span>
              <span>{vehicle.specs.horsepower} hp</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCompare}
                aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition",
                  isCompared
                    ? "border-signal bg-signal text-white"
                    : "border-line bg-bg text-ink hover:border-ink/40"
                )}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span>{isCompared ? "Comparing" : "Compare"}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                aria-label={isSaved ? "Remove from saved" : "Save vehicle"}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md border transition",
                  isSaved
                    ? "border-champagne bg-champagne/15 text-champagne"
                    : "border-line bg-bg text-ink hover:border-ink/40"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition hover:border-ink/35">
      <Link
        href={`/vehicle/${vehicle.id}`}
        className="relative aspect-[16/10] overflow-hidden bg-elevated"
      >
        <VehicleImage
          src={vehicle.images[0]}
          alt={title}
          className="transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-bg/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-champagne backdrop-blur-sm">
          {vehicle.bodyType}
        </span>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={handleCompare}
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-sm transition",
              isCompared
                ? "border-signal bg-signal text-white"
                : "border-white/15 bg-black/55 text-white hover:bg-black/80"
            )}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved" : "Save vehicle"}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-sm transition",
              isSaved
                ? "border-champagne bg-champagne text-black"
                : "border-white/15 bg-black/55 text-white hover:bg-black/80"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {vehicle.location}
          </p>
          <Link
            href={`/vehicle/${vehicle.id}`}
            className="mt-1 block font-display text-lg font-bold text-ink transition hover:text-signal"
          >
            {title}
          </Link>
          <p className="mt-2 font-mono text-base font-semibold text-champagne">
            {formatPrice(vehicle.price, prefs.currency)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-muted">
          <span>{formatMileage(vehicle.mileage, prefs.distanceUnit)}</span>
          <span>{vehicle.fuel}</span>
          <span>{vehicle.specs.horsepower} hp</span>
        </div>
      </div>
    </article>
  );
}
