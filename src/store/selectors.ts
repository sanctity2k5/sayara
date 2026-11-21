import type { SortOption, Vehicle, VehicleFilters } from "@/lib/types";
import type { SayaraState } from "./useSayaraStore";

function createMemoizedSelector<const Deps extends readonly unknown[], Result>(
  getDeps: (state: SayaraState) => Deps,
  compute: (deps: Deps) => Result
): (state: SayaraState) => Result {
  let prevDeps: Deps | null = null;
  let prevResult: Result;

  return (state: SayaraState): Result => {
    const nextDeps = getDeps(state);
    if (
      prevDeps !== null &&
      prevDeps.length === nextDeps.length &&
      prevDeps.every((d, i) => Object.is(d, nextDeps[i]))
    ) {
      return prevResult;
    }
    prevDeps = nextDeps;
    prevResult = compute(nextDeps);
    return prevResult;
  };
}

export const selectAllVehicles = createMemoizedSelector(
  (state) => [state.listings, state.seedVehicles] as const,
  ([listings, seedVehicles]): Vehicle[] => [...listings, ...seedVehicles]
);

export const selectActiveVehicles = createMemoizedSelector(
  (state) => [selectAllVehicles(state)] as const,
  ([all]): Vehicle[] => all.filter((v) => v.status === "active")
);

export function selectVehicleById(state: SayaraState, id: string): Vehicle | undefined {
  return selectAllVehicles(state).find((v) => v.id === id);
}

export const selectSavedVehicles = createMemoizedSelector(
  (state) => [selectAllVehicles(state), state.savedIds] as const,
  ([all, savedIds]): Vehicle[] => {
    const idSet = new Set(savedIds);
    return all.filter((v) => idSet.has(v.id));
  }
);

export const selectCompareVehicles = createMemoizedSelector(
  (state) => [selectAllVehicles(state), state.compareIds] as const,
  ([all, compareIds]): Vehicle[] =>
    compareIds
      .map((id) => all.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v))
);

export const selectRecentlyViewedVehicles = createMemoizedSelector(
  (state) => [selectAllVehicles(state), state.recentlyViewedIds] as const,
  ([all, recentlyViewedIds]): Vehicle[] =>
    recentlyViewedIds
      .map((id) => all.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v))
);

export function selectUnreadInquiriesCount(state: SayaraState): number {
  return state.inquiries.filter((i) => !i.read).length;
}

export const selectUniqueMakes = createMemoizedSelector(
  (state) => [selectAllVehicles(state)] as const,
  ([all]): string[] => Array.from(new Set(all.map((v) => v.make))).sort()
);

export const selectUniqueLocations = createMemoizedSelector(
  (state) => [selectAllVehicles(state)] as const,
  ([all]): string[] => Array.from(new Set(all.map((v) => v.location))).sort()
);

export const selectUniqueBodyTypes = createMemoizedSelector(
  (state) => [selectAllVehicles(state)] as const,
  ([all]): string[] => Array.from(new Set(all.map((v) => v.bodyType))).sort()
);

export function filterAndSortVehicles(
  vehicles: Vehicle[],
  filters: Partial<VehicleFilters>,
  sort: SortOption = "newest"
): Vehicle[] {
  const q = (filters.query ?? "").trim().toLowerCase();

  const filtered = vehicles.filter((v) => {
    if (q) {
      const hay = `${v.year} ${v.make} ${v.model} ${v.location} ${v.bodyType} ${v.color} ${v.fuel}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.make && v.make !== filters.make) return false;
    if (filters.model && !v.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
    }
    if (filters.minPrice !== undefined && v.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && v.price > filters.maxPrice) return false;
    if (filters.minYear !== undefined && v.year < filters.minYear) return false;
    if (filters.maxYear !== undefined && v.year > filters.maxYear) return false;
    if (filters.bodyType && v.bodyType !== filters.bodyType) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.location && v.location !== filters.location) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "mileage-asc":
      sorted.sort((a, b) => a.mileage - b.mileage);
      break;
    case "year-desc":
      sorted.sort((a, b) => b.year - a.year || b.price - a.price);
      break;
    case "newest":
    default:
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
  }
  return sorted;
}
