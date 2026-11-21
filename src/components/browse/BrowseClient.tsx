"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookmarkPlus,
  GitCompareArrows,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useSayaraStore } from "@/store/useSayaraStore";
import {
  filterAndSortVehicles,
  selectActiveVehicles,
  selectCompareVehicles,
  selectUniqueBodyTypes,
  selectUniqueLocations,
  selectUniqueMakes,
} from "@/store/selectors";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { SortOption, VehicleFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
const TRANSMISSIONS = ["Automatic", "Manual", "Dual-Clutch"] as const;
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest Listed" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "mileage-asc", label: "Lowest Mileage" },
  { value: "year-desc", label: "Newest Model Year" },
];

function parseNumber(val: string | null): number | undefined {
  if (!val) return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function BrowseClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();

  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const compareVehicles = useSayaraStore(selectCompareVehicles);
  const makes = useSayaraStore(selectUniqueMakes);
  const locations = useSayaraStore(selectUniqueLocations);
  const bodyTypes = useSayaraStore(selectUniqueBodyTypes);
  const addSavedSearch = useSayaraStore((s) => s.addSavedSearch);
  const clearCompare = useSayaraStore((s) => s.clearCompare);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileFiltersOpen]);

  const filters: VehicleFilters = useMemo(
    () => ({
      query: searchParams.get("q") ?? "",
      make: searchParams.get("make") ?? "",
      model: searchParams.get("model") ?? "",
      minPrice: parseNumber(searchParams.get("minPrice")),
      maxPrice: parseNumber(searchParams.get("maxPrice")),
      minYear: parseNumber(searchParams.get("minYear")),
      maxYear: parseNumber(searchParams.get("maxYear")),
      bodyType: searchParams.get("bodyType") ?? "",
      fuel: searchParams.get("fuel") ?? "",
      transmission: searchParams.get("transmission") ?? "",
      location: searchParams.get("location") ?? "",
    }),
    [searchParams]
  );

  const sort = (searchParams.get("sort") as SortOption | null) ?? "newest";

  const updateParam = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const results = useMemo(
    () => filterAndSortVehicles(activeVehicles, filters, sort),
    [activeVehicles, filters, sort]
  );

  const activeFilterCount = [
    filters.query,
    filters.make,
    filters.model,
    filters.minPrice,
    filters.maxPrice,
    filters.minYear,
    filters.maxYear,
    filters.bodyType,
    filters.fuel,
    filters.transmission,
    filters.location,
  ].filter((v) => v !== undefined && v !== "").length;

  const handleSaveSearch = () => {
    if (!requireAuth()) return;
    const parts = [
      filters.make,
      filters.model,
      filters.bodyType,
      filters.fuel,
      filters.location,
      filters.query,
    ].filter(Boolean);
    const name = parts.length > 0 ? parts.join(" · ") : "All Active Inventory";
    addSavedSearch({ name, filters, lastMatchCount: results.length });
    toast.success(`Saved search "${name}" (${results.length} matches)`);
  };

  const filterForm = (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-signal hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Make</span>
        <CustomSelect
          value={filters.make}
          onChange={(v) => updateParam({ make: v || undefined })}
          ariaLabel="Filter by make"
          className="mt-1.5"
          options={[{ value: "", label: "All Makes" }, ...makes.map((m) => ({ value: m, label: m }))]}
        />
      </div>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Model</span>
        <input
          type="text"
          value={filters.model}
          onChange={(e) => updateParam({ model: e.target.value || undefined })}
          placeholder="e.g. 911, Taycan, R1S"
          className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
        />
      </label>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Price Range (USD)
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            step={5000}
            value={filters.minPrice ?? ""}
            onChange={(e) => updateParam({ minPrice: e.target.value || undefined })}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-ink focus:border-signal focus:outline-none"
          />
          <input
            type="number"
            min={0}
            step={5000}
            value={filters.maxPrice ?? ""}
            onChange={(e) => updateParam({ maxPrice: e.target.value || undefined })}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-ink focus:border-signal focus:outline-none"
          />
        </div>
      </div>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Model Year
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={1980}
            max={2027}
            value={filters.minYear ?? ""}
            onChange={(e) => updateParam({ minYear: e.target.value || undefined })}
            placeholder="From"
            aria-label="Minimum year"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-ink focus:border-signal focus:outline-none"
          />
          <input
            type="number"
            min={1980}
            max={2027}
            value={filters.maxYear ?? ""}
            onChange={(e) => updateParam({ maxYear: e.target.value || undefined })}
            placeholder="To"
            aria-label="Maximum year"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-ink focus:border-signal focus:outline-none"
          />
        </div>
      </div>

      <div className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Body Type
        </span>
        <CustomSelect
          value={filters.bodyType}
          onChange={(v) => updateParam({ bodyType: v || undefined })}
          ariaLabel="Filter by body type"
          className="mt-1.5"
          options={[
            { value: "", label: "All Body Types" },
            ...bodyTypes.map((b) => ({ value: b, label: b })),
          ]}
        />
      </div>

      <div className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Fuel</span>
        <CustomSelect
          value={filters.fuel}
          onChange={(v) => updateParam({ fuel: v || undefined })}
          ariaLabel="Filter by fuel"
          className="mt-1.5"
          options={[
            { value: "", label: "All Fuel Types" },
            ...FUELS.map((f) => ({ value: f, label: f })),
          ]}
        />
      </div>

      <div className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Transmission
        </span>
        <CustomSelect
          value={filters.transmission}
          onChange={(v) => updateParam({ transmission: v || undefined })}
          ariaLabel="Filter by transmission"
          className="mt-1.5"
          options={[
            { value: "", label: "All Transmissions" },
            ...TRANSMISSIONS.map((t) => ({ value: t, label: t })),
          ]}
        />
      </div>

      <div className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Location
        </span>
        <CustomSelect
          value={filters.location}
          onChange={(v) => updateParam({ location: v || undefined })}
          ariaLabel="Filter by location"
          className="mt-1.5"
          options={[
            { value: "", label: "All Locations" },
            ...locations.map((loc) => ({ value: loc, label: loc })),
          ]}
        />
      </div>

      <button
        type="button"
        onClick={handleSaveSearch}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-line bg-elevated px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-champagne hover:text-champagne"
      >
        <BookmarkPlus className="h-4 w-4" />
        <span>Save Search</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <header className="border-b border-line pb-6">
          <p className="kicker">Curated Global Inventory</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-display-md font-bold">Browse Vehicles</h1>
              <p className="mt-1 text-sm text-muted">
                Showing{" "}
                <span className="font-mono font-semibold text-ink">{results.length}</span> of{" "}
                <span className="font-mono">{activeVehicles.length}</span> verified vehicles
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={filters.query}
                  onChange={(e) => updateParam({ q: e.target.value || undefined })}
                  placeholder="Search make, model, city..."
                  aria-label="Search vehicles"
                  className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
                />
              </div>

              <CustomSelect
                value={sort}
                onChange={(v) => updateParam({ sort: v })}
                ariaLabel="Sort vehicles"
                size="sm"
                className="w-44"
                buttonClassName="bg-surface py-2"
                options={SORT_OPTIONS}
              />

              <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={cn(
                    "rounded p-1.5 transition",
                    viewMode === "grid" ? "bg-signal text-white" : "text-muted hover:text-ink"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={cn(
                    "rounded p-1.5 transition",
                    viewMode === "list" ? "bg-signal text-white" : "text-muted hover:text-ink"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-lg border border-line bg-surface p-5">
              {filterForm}
            </div>
          </aside>

          <section className="lg:col-span-9">
            {results.length === 0 ? (
              <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
                <p className="kicker">No Matches</p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  No vehicles match your current filters
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  Try widening your price range, clearing a body type, or resetting all filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-signal-hover"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} viewMode="list" />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle filters"
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="h-full w-full max-w-sm overflow-y-auto border-l border-line bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Filter Inventory</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterForm}
          </div>
        </div>
      )}

      {/* Floating Compare Bar */}
      {compareVehicles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center justify-between gap-4 rounded-lg border border-line bg-surface/95 px-4 py-3 shadow-elevated backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <GitCompareArrows className="h-4 w-4 text-signal" />
            <span className="font-mono font-semibold text-ink">
              {compareVehicles.length}/3 selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearCompare}
              className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink"
            >
              Clear
            </button>
            <Link
              href="/compare"
              className="rounded-md bg-signal px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-signal-hover"
            >
              Compare Now
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
