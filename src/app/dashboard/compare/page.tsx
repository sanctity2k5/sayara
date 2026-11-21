"use client";

import { useState } from "react";
import Link from "next/link";
import { GitCompareArrows, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles, selectCompareVehicles } from "@/store/selectors";
import { cn, formatMileage, formatPrice } from "@/lib/utils";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { Vehicle } from "@/lib/types";

export default function DashboardComparePage() {
  const compareVehicles = useSayaraStore(selectCompareVehicles);
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const prefs = useSayaraStore((s) => s.preferences);
  const toggleCompare = useSayaraStore((s) => s.toggleCompare);
  const clearCompare = useSayaraStore((s) => s.clearCompare);

  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const available = activeVehicles.filter(
    (v) => !compareVehicles.some((c) => c.id === v.id)
  );

  const rows: { label: string; get: (v: Vehicle) => string }[] = [
    { label: "Price", get: (v) => formatPrice(v.price, prefs.currency) },
    { label: "Year", get: (v) => String(v.year) },
    { label: "Mileage", get: (v) => formatMileage(v.mileage, prefs.distanceUnit) },
    { label: "Engine", get: (v) => v.specs.engine },
    { label: "Horsepower", get: (v) => `${v.specs.horsepower} hp` },
    { label: "0–60 mph", get: (v) => v.specs.zeroToSixty },
    { label: "Fuel", get: (v) => v.fuel },
    { label: "Transmission", get: (v) => v.transmission },
    { label: "Drivetrain", get: (v) => v.specs.drivetrain },
    { label: "Location", get: (v) => v.location },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Workspace Matrix</p>
          <h1 className="mt-1.5 font-display text-display-md font-bold">Compare Vehicles</h1>
        </div>
        <div className="flex items-center gap-3">
          {compareVehicles.length >= 2 && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={highlightDiffs}
                onChange={(e) => setHighlightDiffs(e.target.checked)}
                className="accent-signal"
              />
              <span>Highlight differences</span>
            </label>
          )}
          {compareVehicles.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs text-muted hover:text-signal"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </header>

      {compareVehicles.length < 3 && (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row">
          <CustomSelect
            value={selectedId}
            onChange={setSelectedId}
            ariaLabel="Add vehicle to comparison"
            placeholder={`Select vehicle (${compareVehicles.length}/3)...`}
            className="flex-1"
            options={available.map((v) => ({
              value: v.id,
              label: `${v.year} ${v.make} ${v.model} — ${formatPrice(v.price, prefs.currency)}`,
            }))}
          />
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              if (toggleCompare(selectedId)) {
                toast.success("Added to comparison");
                setSelectedId("");
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      )}

      {compareVehicles.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-14 text-center">
          <GitCompareArrows className="mx-auto h-9 w-9 text-muted" />
          <p className="mt-3 text-sm text-muted">
            Select up to 3 vehicles above to compare specifications side by side.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="w-40 p-4 font-mono text-[10px] uppercase text-muted">Spec</th>
                {compareVehicles.map((v) => (
                  <th key={v.id} className="p-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded border border-line bg-elevated">
                      <VehicleImage
                        src={v.images[0]}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        sizes="300px"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCompare(v.id)}
                        aria-label={`Remove ${v.make} ${v.model}`}
                        className="absolute right-1.5 top-1.5 rounded bg-black/70 p-1 text-white hover:bg-signal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Link
                      href={`/vehicle/${v.id}`}
                      className="mt-2 block font-display text-base font-bold text-ink hover:text-signal"
                    >
                      {v.year} {v.make} {v.model}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const vals = compareVehicles.map((v) => row.get(v));
                const diff = compareVehicles.length > 1 && new Set(vals).size > 1;
                return (
                  <tr key={row.label} className={cn(highlightDiffs && diff && "bg-signal/[0.06]")}>
                    <th className="p-4 font-mono text-[11px] uppercase text-muted">{row.label}</th>
                    {vals.map((val, idx) => (
                      <td key={idx} className="p-4 font-medium text-ink">
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
