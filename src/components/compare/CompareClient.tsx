"use client";

import { useState } from "react";
import Link from "next/link";
import { GitCompareArrows, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles, selectCompareVehicles } from "@/store/selectors";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { cn, formatMileage, formatPrice } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

interface CompareRow {
  label: string;
  getValue: (v: Vehicle) => string;
  getNumeric?: (v: Vehicle) => number;
  bestDirection?: "min" | "max";
}

export function CompareClient() {
  const { requireAuth } = useRequireAuth();
  const compareVehicles = useSayaraStore(selectCompareVehicles);
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const prefs = useSayaraStore((s) => s.preferences);
  const toggleCompare = useSayaraStore((s) => s.toggleCompare);
  const clearCompare = useSayaraStore((s) => s.clearCompare);

  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [selectedToAdd, setSelectedToAdd] = useState("");

  const availableToAdd = activeVehicles.filter(
    (v) => !compareVehicles.some((c) => c.id === v.id)
  );

  const handleAdd = () => {
    if (!selectedToAdd) return;
    if (!requireAuth()) return;
    const added = toggleCompare(selectedToAdd);
    if (added) {
      toast.success("Vehicle added to comparison");
      setSelectedToAdd("");
    }
  };

  const rows: CompareRow[] = [
    {
      label: "Price",
      getValue: (v) => formatPrice(v.price, prefs.currency),
      getNumeric: (v) => v.price,
      bestDirection: "min",
    },
    {
      label: "Model Year",
      getValue: (v) => String(v.year),
      getNumeric: (v) => v.year,
      bestDirection: "max",
    },
    {
      label: "Mileage",
      getValue: (v) => formatMileage(v.mileage, prefs.distanceUnit),
      getNumeric: (v) => v.mileage,
      bestDirection: "min",
    },
    {
      label: "Horsepower",
      getValue: (v) => `${v.specs.horsepower} hp`,
      getNumeric: (v) => v.specs.horsepower,
      bestDirection: "max",
    },
    { label: "Engine", getValue: (v) => v.specs.engine },
    { label: "Torque", getValue: (v) => v.specs.torque },
    { label: "0–60 mph", getValue: (v) => v.specs.zeroToSixty },
    { label: "Body Type", getValue: (v) => v.bodyType },
    { label: "Fuel", getValue: (v) => v.fuel },
    { label: "Transmission", getValue: (v) => v.transmission },
    { label: "Drivetrain", getValue: (v) => v.specs.drivetrain },
    { label: "Exterior Color", getValue: (v) => v.color },
    { label: "Seats / Doors", getValue: (v) => `${v.specs.seats} / ${v.specs.doors}` },
    { label: "Location", getValue: (v) => v.location },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-end">
          <div>
            <p className="kicker">Side-By-Side Matrix</p>
            <h1 className="mt-1.5 font-display text-display-md font-bold">Compare Vehicles</h1>
            <p className="mt-1 text-sm text-muted">
              Evaluate up to 3 vehicles across performance, pricing, and technical specs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {compareVehicles.length >= 2 && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink">
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
                <span>Clear all</span>
              </button>
            )}
          </div>
        </header>

        {/* Add Vehicle Bar */}
        {compareVehicles.length < 3 && (
          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center">
            <CustomSelect
              value={selectedToAdd}
              onChange={setSelectedToAdd}
              ariaLabel="Select a vehicle to compare"
              placeholder={`Select a vehicle to add (${compareVehicles.length}/3)...`}
              className="flex-1"
              options={availableToAdd.map((v) => ({
                value: v.id,
                label: `${v.year} ${v.make} ${v.model} — ${formatPrice(v.price, prefs.currency)} (${v.location})`,
              }))}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedToAdd}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        )}

        {compareVehicles.length === 0 ? (
          <div className="mt-10 rounded-lg border border-line bg-surface px-6 py-16 text-center">
            <GitCompareArrows className="mx-auto h-10 w-10 text-muted" />
            <h2 className="mt-4 font-display text-2xl font-bold">No vehicles selected yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Choose up to three vehicles from the selector above or click Compare on any listing in
              the showroom.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-block rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-signal-hover"
            >
              Browse Inventory
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="w-44 p-4 align-bottom font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Specification
                  </th>
                  {compareVehicles.map((v) => (
                    <th key={v.id} className="p-4 align-top">
                      <div className="relative overflow-hidden rounded-md border border-line bg-bg">
                        <div className="relative aspect-[16/10]">
                          <VehicleImage
                            src={v.images[0]}
                            alt={`${v.year} ${v.make} ${v.model}`}
                            sizes="320px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCompare(v.id)}
                          aria-label={`Remove ${v.make} ${v.model}`}
                          className="absolute right-2 top-2 rounded-md bg-black/70 p-1 text-white hover:bg-signal"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link
                        href={`/vehicle/${v.id}`}
                        className="mt-3 block font-display text-base font-bold text-ink hover:text-signal"
                      >
                        {v.year} {v.make} {v.model}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-champagne">
                        {formatPrice(v.price, prefs.currency)}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {rows.map((row) => {
                  const values = compareVehicles.map((v) => row.getValue(v));
                  const hasDiff = compareVehicles.length > 1 && new Set(values).size > 1;

                  let bestNum: number | undefined;
                  if (row.getNumeric && row.bestDirection && compareVehicles.length > 1) {
                    const nums = compareVehicles.map((v) => row.getNumeric!(v));
                    bestNum =
                      row.bestDirection === "min" ? Math.min(...nums) : Math.max(...nums);
                  }

                  return (
                    <tr
                      key={row.label}
                      className={cn(highlightDiffs && hasDiff && "bg-signal/[0.06]")}
                    >
                      <th className="p-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                        {row.label}
                      </th>
                      {compareVehicles.map((v, idx) => {
                        const isBest =
                          bestNum !== undefined &&
                          row.getNumeric &&
                          row.getNumeric(v) === bestNum &&
                          hasDiff;
                        return (
                          <td key={v.id} className="p-4 font-medium text-ink">
                            <span>{values[idx]}</span>
                            {isBest && (
                              <span className="ml-2 rounded-sm bg-champagne/20 px-1.5 py-0.5 font-mono text-[10px] uppercase text-champagne">
                                Best
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
