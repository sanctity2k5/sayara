"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GitCompareArrows,
  Layers,
  RotateCcw,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { MagneticButton } from "@/components/home/MagneticButton";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles } from "@/store/selectors";
import { cn, formatMileage, formatPrice } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface StoryStage {
  key: "discover" | "compare" | "list" | "sell";
  index: string;
  kicker: string;
  title: string;
  body: string;
  vehicleId: string;
}

const STORY_STAGES: StoryStage[] = [
  {
    key: "discover",
    index: "01",
    kicker: "Stage 01 · Discover",
    title: "Curated global inventory, visually verified.",
    body: "Filter by make, generation, powertrain, mileage, and city across international markets. Every photograph is verified against its exact make and model.",
    vehicleId: "syr-003", // 2019 Audi R8 V10 Performance
  },
  {
    key: "compare",
    index: "02",
    kicker: "Stage 02 · Compare",
    title: "Side-by-side telemetry with zero guesswork.",
    body: "Line up three vehicles at once to highlight differences in horsepower, 0–60 acceleration, drivetrain, mileage, and asking price.",
    vehicleId: "syr-005", // 2019 Lamborghini Huracan Performante
  },
  {
    key: "list",
    index: "03",
    kicker: "Stage 03 · List",
    title: "Publish a dossier in minutes.",
    body: "Create rich listings with multi-step technical validation, compressed photography, and real-time status control from draft to active to sold.",
    vehicleId: "syr-008", // 2023 Porsche Taycan Cross Turismo
  },
  {
    key: "sell",
    index: "04",
    kicker: "Stage 04 · Sell",
    title: "Direct offers and market valuation.",
    body: "Review buyer inquiries, accept or counter offers, benchmark asking prices against segment averages, and track listing conversion in one workspace.",
    vehicleId: "syr-004", // 2018 Ferrari 488 GTB
  },
];

const MARQUEE_BRANDS = [
  "PORSCHE",
  "MERCEDES-BENZ",
  "FERRARI",
  "LAMBORGHINI",
  "MCLAREN",
  "ASTON MARTIN",
  "AUDI",
  "BMW",
  "LAND ROVER",
  "RIVIAN",
  "LUCID",
  "LEXUS",
  "NISSAN",
  "FORD",
  "TOYOTA",
  "VOLKSWAGEN",
  "MAZDA",
  "TESLA",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse & Filter",
    desc: "Search verified vehicles across global cities using URL-synced precision filters.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Compare Specs",
    desc: "Evaluate up to three vehicles side by side with automatic difference highlighting.",
    icon: GitCompareArrows,
  },
  {
    step: "03",
    title: "Submit an Offer",
    desc: "Send direct inquiries and offers straight to the seller inbox with full transparency.",
    icon: Send,
  },
  {
    step: "04",
    title: "Manage & Sell",
    desc: "Track views, saves, inquiries, and pricing benchmarks inside your private dashboard.",
    icon: Layers,
  },
];

interface StatItem {
  label: string;
  target: number;
  suffix: string;
}

export function LandingShowpiece() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const pinnedSectionRef = useRef<HTMLElement>(null);
  const horizontalSectionRef = useRef<HTMLElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const prefs = useSayaraStore((s) => s.preferences);

  const vehicleMap = useMemo(
    () => new Map<string, Vehicle>(activeVehicles.map((v) => [v.id, v])),
    [activeVehicles]
  );

  const heroVehicle = vehicleMap.get("syr-002") ?? activeVehicles[0]; // 2024 Mercedes-Benz AMG GT
  const featuredStrip = useMemo(() => activeVehicles.slice(0, 8), [activeVehicles]);

  const uniqueCitiesCount = useMemo(
    () => new Set(activeVehicles.map((v) => v.location)).size,
    [activeVehicles]
  );

  const stats: StatItem[] = useMemo(
    () => [
      { label: "Verified Vehicles", target: activeVehicles.length, suffix: "" },
      { label: "Global Cities", target: uniqueCitiesCount, suffix: "" },
      { label: "Photo Accuracy", target: 100, suffix: "%" },
      { label: "Side-by-Side Slots", target: 3, suffix: "×" },
    ],
    [activeVehicles.length, uniqueCitiesCount]
  );

  // Wire Lenis smooth scroll to GSAP ScrollTrigger + all motion effects
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      prefs.reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let rafCallback: ((time: number) => void) | null = null;

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);
      rafCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        return;
      }

      // 1. Brand marquee infinite scroll
      gsap.to(".marquee-track", {
        xPercent: -50,
        duration: 32,
        repeat: -1,
        ease: "none",
      });

      // 3. Pinned ScrollTrigger Story (desktop >= 1024px)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const pinnedEl = pinnedSectionRef.current;
        if (!pinnedEl) return;

        const imgLayers = gsap.utils.toArray<HTMLElement>(".story-img-layer");
        imgLayers.forEach((el, idx) => {
          gsap.set(el, { opacity: idx === 0 ? 1 : 0, scale: idx === 0 ? 1.0 : 1.08 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinnedEl,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.7,
            onUpdate: (self) => {
              const nextIdx = Math.min(
                STORY_STAGES.length - 1,
                Math.floor(self.progress * STORY_STAGES.length)
              );
              setActiveStage(nextIdx);
            },
          },
        });

        STORY_STAGES.forEach((_, idx) => {
          if (idx === 0) return;
          const prevImg = imgLayers[idx - 1];
          const currImg = imgLayers[idx];
          if (prevImg && currImg) {
            tl.to(prevImg, { opacity: 0, scale: 0.96, duration: 1, ease: "power2.inOut" }, idx)
              .fromTo(
                currImg,
                { opacity: 0, scale: 1.09 },
                { opacity: 1, scale: 1.0, duration: 1, ease: "power2.out" },
                idx
              );
          }
        });

        // 4. Horizontal-scroll Featured Listings strip
        const hSection = horizontalSectionRef.current;
        const hTrack = horizontalTrackRef.current;
        if (hSection && hTrack) {
          const getScrollDistance = () => Math.max(0, hTrack.scrollWidth - window.innerWidth + 96);
          gsap.to(hTrack, {
            x: () => -getScrollDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: hSection,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              pin: true,
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      // 5. Animated Stat Counters
      const counterEls = gsap.utils.toArray<HTMLElement>(".stat-counter");
      counterEls.forEach((el) => {
        const target = Number(el.dataset.target ?? 0);
        const suffix = el.dataset.suffix ?? "";
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.value)}${suffix}`;
          },
        });
      });

      // 6. How It Works step cards stagger reveal
      gsap.from(".step-card", {
        y: 32,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steps-grid",
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      if (rafCallback) {
        gsap.ticker.remove(rafCallback);
      }
      lenis?.destroy();
    };
  }, [prefs.reducedMotion]);

  // Auto-reveal hero copy if reduced motion, video failure, autoplay block, scroll, or safety timeout
  useEffect(() => {
    const prefersReduced =
      prefs.reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || videoFailed) {
      setHeroRevealed(true);
      return;
    }

    if (heroRevealed) return;

    const video = heroVideoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          setHeroRevealed(true);
        });
      }
    }

    const onScroll = () => {
      if (window.scrollY > 40) {
        setHeroRevealed(true);
      }
    };

    const fallbackTimer = window.setTimeout(() => {
      setHeroRevealed(true);
    }, 10500);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroRevealed, prefs.reducedMotion, videoFailed]);

  // Slide-in hero typography once the intro video completes
  useEffect(() => {
    if (!heroRevealed || !rootRef.current) return;

    const prefersReduced =
      prefs.reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.fromTo(
          ".hero-reveal",
          { opacity: 0 },
          { opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" }
        );
        return;
      }

      gsap.fromTo(
        ".hero-word",
        { x: -32, yPercent: 105, opacity: 0 },
        {
          x: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.08,
          ease: "power4.out",
          delay: 0.08,
        }
      );

      gsap.fromTo(
        ".hero-fade",
        { x: -28, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.25,
        }
      );
    }, rootRef.current);

    return () => ctx.revert();
  }, [heroRevealed, prefs.reducedMotion]);

  const handleReplayIntro = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    setHeroRevealed(false);
    video.currentTime = 0;
    video.play().catch(() => setHeroRevealed(true));
  };

  // Subtle mouse parallax on full-bleed hero photograph
  useEffect(() => {
    const el = heroBgRef.current;
    if (!el) return;
    if (
      prefs.reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      xTo(-nx * 16);
      yTo(-ny * 10);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.killTweensOf(el);
    };
  }, [prefs.reducedMotion]);

  return (
    <div ref={rootRef} className="min-h-screen bg-bg text-ink">
      <Navbar />

      <main id="main-content">
        {/* 1. FULL-BLEED CINEMATIC HERO */}
        <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between overflow-hidden border-b border-line bg-[#090A0D]">
          {/* Full-bleed hero video (falls back to verified static photography on reduced motion or error) */}
          <div
            ref={heroBgRef}
            className="pointer-events-none absolute -inset-6 will-change-transform"
          >
            {!prefs.reducedMotion && !videoFailed ? (
              <video
                ref={heroVideoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={() => setHeroRevealed(true)}
                onError={() => {
                  setVideoFailed(true);
                  setHeroRevealed(true);
                }}
                className={cn(
                  "h-full w-full scale-[1.04] object-cover object-center transition-[filter] duration-1000 ease-out",
                  heroRevealed ? "brightness-[0.72]" : "brightness-[0.96]"
                )}
              >
                <source src="/hero/hero-two.mp4" type="video/mp4" />
              </video>
            ) : (
              heroVehicle && (
                <VehicleImage
                  src={heroVehicle.images[0]}
                  alt={`${heroVehicle.year} ${heroVehicle.make} ${heroVehicle.model}`}
                  sizes="100vw"
                  priority
                  className="scale-[1.04] object-cover object-center brightness-[0.72]"
                />
              )
            )}
          </div>

          {/* Editorial dark vignette gradients — soften during intro playback, deepen on text reveal */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/50 to-black/35 transition-opacity duration-1000",
              heroRevealed ? "opacity-100" : "opacity-30"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090A0D]/90 via-[#090A0D]/40 to-transparent transition-opacity duration-1000",
              heroRevealed ? "opacity-100" : "opacity-15"
            )}
          />

          <div
            className={cn(
              "relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-12 lg:pt-20",
              !heroRevealed && "pointer-events-none invisible"
            )}
          >
            <div className="my-auto max-w-3xl pb-8">
              <p className="hero-fade hero-reveal font-mono text-[11px] uppercase tracking-[0.24em] text-champagne">
                Automotive Discovery · Global Marketplace
              </p>

              {/* Split-text masked headline reveal */}
              <h1 className="mt-4 font-display text-display-xl font-bold tracking-tight text-white">
                {["Machines", "Built", "For", "Drivers."].map((word) => (
                  <span key={word} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
                    <span className="hero-word hero-reveal inline-block">{word}</span>
                  </span>
                ))}
              </h1>

              <p className="hero-fade hero-reveal mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Discover, compare, and acquire curated performance cars, luxury SUVs, and electric
                flagships across international markets — every photograph visually verified.
              </p>

              <div className="hero-fade hero-reveal mt-8 flex flex-wrap items-center gap-4">
                <MagneticButton href="/browse" variant="primary">
                  <span>Explore Inventory</span>
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="/sign-up" variant="secondary">
                  <span>List a Vehicle</span>
                </MagneticButton>
              </div>
            </div>

            {/* Hero Showroom Telemetry Bar */}
            <div className="hero-fade hero-reveal mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/75">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-signal" />
                <span className="font-mono uppercase tracking-[0.16em]">
                  {!prefs.reducedMotion && !videoFailed
                    ? "Showreel: Track Supercar · 360° Studio"
                    : heroVehicle
                      ? `Featured: ${heroVehicle.year} ${heroVehicle.make} ${heroVehicle.model}`
                      : "SAYARA Global Showroom"}
                </span>
                {!prefs.reducedMotion && !videoFailed && heroRevealed && (
                  <button
                    type="button"
                    onClick={handleReplayIntro}
                    className="inline-flex items-center gap-1 rounded-sm border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 transition hover:border-white/35 hover:text-white"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Replay</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 font-mono">
                <span className="text-champagne">{activeVehicles.length} Verified Vehicles</span>
                <span>{uniqueCitiesCount} Global Cities</span>
                <Link
                  href="/browse"
                  className="text-white underline-offset-4 hover:underline"
                >
                  Browse All →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. BRAND MARQUEE */}
        <section
          aria-label="Featured automotive marques"
          className="overflow-hidden border-b border-line bg-surface py-5"
        >
          <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
            {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, idx) => (
              <span
                key={`${brand}-${idx}`}
                className="font-display text-sm font-bold tracking-[0.26em] text-muted/80"
              >
                {brand}
              </span>
            ))}
          </div>
        </section>

        {/* 3. PINNED SCROLLTRIGGER STORY: DISCOVER / COMPARE / LIST / SELL */}
        <section
          ref={pinnedSectionRef}
          className="relative border-b border-line bg-bg lg:h-screen lg:overflow-hidden"
        >
          <div className="mx-auto grid h-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-0">
            {/* Left Copy & Stage Selector */}
            <div className="space-y-6 lg:col-span-5">
              <div className="flex items-center gap-2">
                {STORY_STAGES.map((stage, idx) => (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={cn(
                      "rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition",
                      activeStage === idx
                        ? "bg-signal text-white"
                        : "border border-line bg-surface text-muted hover:text-ink"
                    )}
                  >
                    {stage.index} {stage.key}
                  </button>
                ))}
              </div>

              <div>
                <p className="kicker">{STORY_STAGES[activeStage].kicker}</p>
                <h2 className="mt-3 font-display text-display-lg font-bold text-ink">
                  {STORY_STAGES[activeStage].title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  {STORY_STAGES[activeStage].body}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={activeStage === 1 ? "/compare" : activeStage >= 2 ? "/sign-up" : "/browse"}
                  className="inline-flex items-center gap-2 rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-signal-hover"
                >
                  <span>
                    {activeStage === 0
                      ? "Browse Inventory"
                      : activeStage === 1
                        ? "Open Comparison"
                        : "Create Seller Account"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Crossfading & Scaling Verified Vehicle Photography */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-surface shadow-elevated">
                {STORY_STAGES.map((stage, idx) => {
                  const car = vehicleMap.get(stage.vehicleId);
                  if (!car) return null;
                  return (
                    <div
                      key={stage.key}
                      className={cn(
                        "story-img-layer absolute inset-0 transition-opacity duration-500 lg:transition-none",
                        activeStage === idx ? "opacity-100" : "opacity-0 lg:opacity-100"
                      )}
                    >
                      <VehicleImage
                        src={car.images[0]}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 text-white">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">
                          {car.location} · {car.specs.horsepower} hp
                        </p>
                        <div className="mt-1 flex items-baseline justify-between gap-4">
                          <p className="font-display text-lg font-bold sm:text-xl">
                            {car.year} {car.make} {car.model}
                          </p>
                          <span className="font-mono text-sm text-champagne">
                            {formatPrice(car.price, prefs.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. ANIMATED STAT COUNTERS */}
        <section className="border-b border-line bg-surface py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((st) => (
              <div
                key={st.label}
                className="rounded-lg border border-line bg-bg p-6 text-center"
              >
                <p
                  className="stat-counter font-display text-4xl font-bold text-ink sm:text-5xl"
                  data-target={st.target}
                  data-suffix={st.suffix}
                >
                  {st.target}
                  {st.suffix}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. HORIZONTAL-SCROLL FEATURED LISTINGS STRIP */}
        <section
          ref={horizontalSectionRef}
          className="relative overflow-hidden border-b border-line bg-bg py-16 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0"
        >
          <div className="mx-auto mb-8 flex w-full max-w-7xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8">
            <div>
              <p className="kicker">Featured Arrivals</p>
              <h2 className="mt-1.5 font-display text-display-md font-bold">
                Curated Showroom Strip
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-signal hover:underline"
            >
              <span>View all {activeVehicles.length} vehicles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div
            ref={horizontalTrackRef}
            className="flex gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:overflow-visible lg:px-8 lg:pb-0"
          >
            {featuredStrip.map((v) => (
              <Link
                key={v.id}
                href={`/vehicle/${v.id}`}
                className="group w-[300px] shrink-0 overflow-hidden rounded-lg border border-line bg-surface transition hover:border-ink/40 sm:w-[360px]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
                  <VehicleImage
                    src={v.images[0]}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    sizes="360px"
                    className="transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-sm bg-bg/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-champagne backdrop-blur-sm">
                    {v.bodyType}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {v.location}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-signal">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-xs">
                    <span className="font-semibold text-champagne">
                      {formatPrice(v.price, prefs.currency)}
                    </span>
                    <span className="text-muted">
                      {formatMileage(v.mileage, prefs.distanceUnit)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. HOW IT WORKS STEPPER */}
        <section className="border-b border-line bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="kicker">How SAYARA Works</p>
              <h2 className="mt-2 font-display text-display-md font-bold">
                From discovery to handover in four clear steps.
              </h2>
            </div>

            <div className="steps-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="step-card rounded-lg border border-line bg-bg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-signal">
                        {item.step}
                      </span>
                      <Icon className="h-4 w-4 text-champagne" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CLOSING CTA */}
        <section className="relative overflow-hidden border-t border-line bg-[#090A0D] py-28">
          {/* Ambient rolling-motion video backdrop */}
          <div className="pointer-events-none absolute inset-0">
            <AmbientVideo
              src="/hero/hero-three.mp4"
              fallbackSrc={heroVehicle?.images[0]}
              fallbackAlt="SAYARA rolling showcase"
              preload="metadata"
              className="scale-[1.03] brightness-[0.45]"
              fallbackClassName="brightness-[0.35]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/55 to-[#090A0D]/80" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090A0D]/75 via-transparent to-[#090A0D]/75" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-champagne backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-signal" />
              <span>100% Verified Local Vehicle Photography</span>
            </div>
            <h2 className="mt-5 font-display text-display-lg font-bold text-white">
              Ready to find or list your next machine?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Create your SAYARA account to save vehicles, manage listings, respond to buyer
              inquiries, and track pricing analytics across global markets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <MagneticButton href="/sign-up" variant="primary">
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/15"
              >
                Browse Inventory
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
