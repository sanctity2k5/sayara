"use client";

import Link from "next/link";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSayaraStore } from "@/store/useSayaraStore";
import {
  filterAndSortVehicles,
  selectActiveVehicles,
  selectRecentlyViewedVehicles,
  selectSavedVehicles,
} from "@/store/selectors";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export default function DashboardSavedPage() {
  const savedVehicles = useSayaraStore(selectSavedVehicles);
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const recentlyViewed = useSayaraStore(selectRecentlyViewedVehicles);
  const savedSearches = useSayaraStore((s) => s.savedSearches);
  const deleteSavedSearch = useSayaraStore((s) => s.deleteSavedSearch);

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header className="border-b border-line pb-6">
        <p className="kicker">Shortlist & Watchlist</p>
        <h1 className="mt-1.5 font-display text-display-md font-bold">Saved & Searches</h1>
      </header>

      {/* Saved Vehicles */}
      <section>
        <h2 className="font-display text-xl font-bold">
          Saved Vehicles ({savedVehicles.length})
        </h2>
        {savedVehicles.length === 0 ? (
          <div className="mt-4 rounded-lg border border-line bg-surface p-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">
              No saved vehicles yet. Click the bookmark icon on any listing in{" "}
              <Link href="/browse" className="text-signal underline">
                /browse
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      {/* Saved Searches */}
      <section>
        <h2 className="font-display text-xl font-bold">
          Saved Searches ({savedSearches.length})
        </h2>
        {savedSearches.length === 0 ? (
          <div className="mt-4 rounded-lg border border-line bg-surface p-8 text-center">
            <Search className="mx-auto h-7 w-7 text-muted" />
            <p className="mt-3 text-sm text-muted">
              Save any filter combination on{" "}
              <Link href="/browse" className="text-signal underline">
                /browse
              </Link>{" "}
              to receive match count badges here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {savedSearches.map((srch) => {
              const currentMatches = filterAndSortVehicles(activeVehicles, srch.filters).length;
              const newCount = Math.max(0, currentMatches - srch.lastMatchCount);
              const params = new URLSearchParams();
              if (srch.filters.query) params.set("q", srch.filters.query);
              if (srch.filters.make) params.set("make", srch.filters.make);
              if (srch.filters.model) params.set("model", srch.filters.model);
              if (srch.filters.bodyType) params.set("bodyType", srch.filters.bodyType);
              if (srch.filters.fuel) params.set("fuel", srch.filters.fuel);
              if (srch.filters.location) params.set("location", srch.filters.location);

              return (
                <div
                  key={srch.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface p-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/browse?${params.toString()}`}
                      className="block truncate font-semibold text-ink hover:text-signal"
                    >
                      {srch.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {currentMatches} active matches
                      {newCount > 0 && (
                        <span className="ml-2 rounded-full bg-signal px-2 py-0.5 text-[10px] font-semibold text-white">
                          +{newCount} new match
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteSavedSearch(srch.id);
                      toast("Removed saved search");
                    }}
                    aria-label="Delete saved search"
                    className="rounded p-1.5 text-muted hover:bg-elevated hover:text-signal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold">Recently Viewed</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recentlyViewed.slice(0, 6).map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
