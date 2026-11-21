"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { estimateVehiclePrice } from "@/lib/analytics";
import { formatMileage, formatPrice } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

const SEGMENTS = [
  { label: "Sports / Supercar", base: 245000 },
  { label: "Luxury SUV", base: 145000 },
  { label: "Executive Sedan", base: 110000 },
  { label: "Performance Coupe", base: 98000 },
  { label: "Electric Flagship", base: 128000 },
  { label: "Everyday Hatchback / Roadster", base: 42000 },
];

const CONDITIONS = ["Concours", "Excellent", "Good", "Fair"] as const;

export function PriceEstimatorCard() {
  const prefs = useSayaraStore((s) => s.preferences);
  const [segmentIdx, setSegmentIdx] = useState(1);
  const [year, setYear] = useState(2023);
  const [mileageKm, setMileageKm] = useState(14000);
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("Excellent");

  const estimate = estimateVehiclePrice({
    basePrice: SEGMENTS[segmentIdx].base,
    year,
    mileageKm,
    condition,
  });

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-signal" />
        <p className="kicker">Smart Valuation</p>
      </div>
      <h2 className="mt-1.5 font-display text-xl font-bold">Market Price Estimator</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Segment
          </span>
          <CustomSelect
            value={String(segmentIdx)}
            onChange={(v) => setSegmentIdx(Number(v))}
            ariaLabel="Vehicle segment"
            size="sm"
            className="mt-1"
            options={SEGMENTS.map((s, i) => ({ value: String(i), label: s.label }))}
          />
        </div>

        <div className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Condition
          </span>
          <CustomSelect
            value={condition}
            onChange={(v) => setCondition(v as (typeof CONDITIONS)[number])}
            ariaLabel="Vehicle condition"
            size="sm"
            className="mt-1"
            options={CONDITIONS.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Model Year ({year})
          </span>
          <input
            type="range"
            min={2015}
            max={2026}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-2 w-full accent-signal"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Mileage ({formatMileage(mileageKm, prefs.distanceUnit)})
          </span>
          <input
            type="range"
            min={0}
            max={180000}
            step={2000}
            value={mileageKm}
            onChange={(e) => setMileageKm(Number(e.target.value))}
            className="mt-2 w-full accent-signal"
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-md border border-line bg-bg p-4 text-center">
        <div>
          <p className="font-mono text-[10px] uppercase text-muted">Trade-In</p>
          <p className="mt-1 font-mono text-sm font-semibold text-ink">
            {formatPrice(estimate.low, prefs.currency)}
          </p>
        </div>
        <div className="border-x border-line">
          <p className="font-mono text-[10px] uppercase text-champagne">Market Mid</p>
          <p className="mt-1 font-mono text-base font-bold text-signal">
            {formatPrice(estimate.mid, prefs.currency)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase text-muted">Retail Top</p>
          <p className="mt-1 font-mono text-sm font-semibold text-ink">
            {formatPrice(estimate.high, prefs.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
