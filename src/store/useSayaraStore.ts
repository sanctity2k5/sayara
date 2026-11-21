"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { toast } from "sonner";
import seedVehiclesRaw from "@/data/vehicles.json";
import { APP_CONFIG } from "@/lib/config";
import { isQuotaExceededError } from "@/lib/image-storage";
import type {
  ActivityItem,
  Inquiry,
  InquiryStatus,
  SavedSearch,
  UserPreferences,
  Vehicle,
  VehicleStatus,
} from "@/lib/types";

const SEED_VEHICLES = seedVehiclesRaw as Vehicle[];

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: APP_CONFIG.defaultCurrency,
  distanceUnit: APP_CONFIG.defaultDistanceUnit,
  emailAlerts: true,
  reducedMotion: false,
};

interface UserBucketData {
  listings: Vehicle[];
  savedIds: string[];
  compareIds: string[];
  inquiries: Inquiry[];
  savedSearches: SavedSearch[];
  recentlyViewedIds: string[];
  preferences: UserPreferences;
  activity: ActivityItem[];
}

const EMPTY_USER_BUCKET: UserBucketData = {
  listings: [],
  savedIds: [],
  compareIds: [],
  inquiries: [],
  savedSearches: [],
  recentlyViewedIds: [],
  preferences: DEFAULT_PREFERENCES,
  activity: [],
};

function userKey(userId: string, key: string): string {
  return `sayara:${userId}:${key}`;
}

function readUserKey<T>(userId: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(userKey(userId, key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeUserKey<T>(userId: string | null, key: string, value: T): boolean {
  if (!userId) return false;
  if (typeof window === "undefined") return true;
  try {
    window.localStorage.setItem(userKey(userId, key), JSON.stringify(value));
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      toast.error(
        "Browser storage is full (~5 MB limit). Remove unused photos or listings to save more data."
      );
    }
    return false;
  }
}

function loadUserBucket(userId: string): UserBucketData {
  return {
    listings: readUserKey<Vehicle[]>(userId, "listings", []),
    savedIds: readUserKey<string[]>(userId, "saved", []),
    compareIds: readUserKey<string[]>(userId, "comparisons", []),
    inquiries: readUserKey<Inquiry[]>(userId, "inquiries", []),
    savedSearches: readUserKey<SavedSearch[]>(userId, "savedSearches", []),
    recentlyViewedIds: readUserKey<string[]>(userId, "recentlyViewed", []),
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...readUserKey<Partial<UserPreferences>>(userId, "preferences", {}),
    },
    activity: readUserKey<ActivityItem[]>(userId, "activity", []),
  };
}

function persistUserBucket(userId: string | null, data: UserBucketData): boolean {
  if (!userId) return false;
  const results = [
    writeUserKey(userId, "listings", data.listings),
    writeUserKey(userId, "saved", data.savedIds),
    writeUserKey(userId, "comparisons", data.compareIds),
    writeUserKey(userId, "inquiries", data.inquiries),
    writeUserKey(userId, "savedSearches", data.savedSearches),
    writeUserKey(userId, "recentlyViewed", data.recentlyViewedIds),
    writeUserKey(userId, "preferences", data.preferences),
    writeUserKey(userId, "activity", data.activity),
  ];
  return results.every(Boolean);
}

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      if (isQuotaExceededError(err)) {
        toast.error("Browser storage quota exceeded (~5 MB).");
      }
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export interface SayaraState extends UserBucketData {
  activeUserId: string | null;
  seedVehicles: Vehicle[];
  hydrated: boolean;

  setHydrated: (value: boolean) => void;
  setActiveUser: (userId: string | null) => void;
  clearUserData: () => void;

  // Listings CRUD
  addVehicle: (vehicle: Omit<Vehicle, "id" | "createdAt" | "sellerId">) => Vehicle | null;
  updateVehicle: (id: string, partial: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setVehicleStatus: (id: string, status: VehicleStatus) => void;
  bulkUpdateStatus: (ids: string[], status: VehicleStatus) => void;
  bulkDeleteVehicles: (ids: string[]) => void;

  // Saved & Compare
  toggleSaved: (vehicleId: string) => void;
  toggleCompare: (vehicleId: string) => boolean;
  clearCompare: () => void;

  // Inquiries
  addInquiry: (inquiry: Omit<Inquiry, "id" | "createdAt" | "read" | "status">) => Inquiry;
  updateInquiryStatus: (id: string, status: InquiryStatus, counterPrice?: number) => void;
  markInquiryRead: (id: string) => void;

  // Saved searches & Recently viewed
  addSavedSearch: (search: Omit<SavedSearch, "id" | "createdAt">) => void;
  deleteSavedSearch: (id: string) => void;
  recordView: (vehicleId: string) => void;

  // Preferences & Data portability
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  exportStateJson: () => string;
  importStateJson: (jsonText: string) => { ok: boolean; error?: string };
  resetToSeed: () => void;
}

function pushActivity(
  prev: ActivityItem[],
  type: ActivityItem["type"],
  title: string,
  detail: string
): ActivityItem[] {
  return [
    {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      detail,
      timestamp: new Date().toISOString(),
    },
    ...prev.slice(0, 29),
  ];
}

export const useSayaraStore = create<SayaraState>()(
  persist(
    (set, get) => ({
      activeUserId: null,
      seedVehicles: SEED_VEHICLES,
      hydrated: false,
      ...EMPTY_USER_BUCKET,

      setHydrated: (value) => set({ hydrated: value }),

      clearUserData: () => {
        set({
          activeUserId: null,
          ...EMPTY_USER_BUCKET,
        });
      },

      setActiveUser: (userId) => {
        if (!userId) {
          set({
            activeUserId: null,
            ...EMPTY_USER_BUCKET,
          });
          return;
        }
        if (get().activeUserId === userId && get().hydrated) return;
        const bucket = loadUserBucket(userId);
        set({
          activeUserId: userId,
          ...bucket,
        });
      },

      addVehicle: (input) => {
        const state = get();
        if (!state.activeUserId) return null;
        const created: Vehicle = {
          ...input,
          id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sellerId: state.activeUserId,
          createdAt: new Date().toISOString(),
        };
        const listings = [created, ...state.listings];
        const activity = pushActivity(
          state.activity,
          "listing",
          "Listing published",
          `${created.year} ${created.make} ${created.model}`
        );
        const ok = writeUserKey(state.activeUserId, "listings", listings);
        if (!ok) return null;
        writeUserKey(state.activeUserId, "activity", activity);
        set({ listings, activity });
        return created;
      },

      updateVehicle: (id, partial) => {
        const state = get();
        if (!state.activeUserId) return;
        const listings = state.listings.map((v) =>
          v.id === id ? { ...v, ...partial } : v
        );
        const seedVehicles = state.seedVehicles.map((v) =>
          v.id === id ? { ...v, ...partial } : v
        );
        writeUserKey(state.activeUserId, "listings", listings);
        set({ listings, seedVehicles });
      },

      deleteVehicle: (id) => {
        const state = get();
        if (!state.activeUserId) return;
        const listings = state.listings.filter((v) => v.id !== id);
        const savedIds = state.savedIds.filter((s) => s !== id);
        const compareIds = state.compareIds.filter((c) => c !== id);
        writeUserKey(state.activeUserId, "listings", listings);
        writeUserKey(state.activeUserId, "saved", savedIds);
        writeUserKey(state.activeUserId, "comparisons", compareIds);
        set({ listings, savedIds, compareIds });
      },

      setVehicleStatus: (id, status) => {
        get().updateVehicle(id, { status });
      },

      bulkUpdateStatus: (ids, status) => {
        const state = get();
        if (!state.activeUserId) return;
        const idSet = new Set(ids);
        const listings = state.listings.map((v) =>
          idSet.has(v.id) ? { ...v, status } : v
        );
        const seedVehicles = state.seedVehicles.map((v) =>
          idSet.has(v.id) ? { ...v, status } : v
        );
        writeUserKey(state.activeUserId, "listings", listings);
        set({ listings, seedVehicles });
      },

      bulkDeleteVehicles: (ids) => {
        const state = get();
        if (!state.activeUserId) return;
        const idSet = new Set(ids);
        const listings = state.listings.filter((v) => !idSet.has(v.id));
        const savedIds = state.savedIds.filter((s) => !idSet.has(s));
        const compareIds = state.compareIds.filter((c) => !idSet.has(c));
        writeUserKey(state.activeUserId, "listings", listings);
        writeUserKey(state.activeUserId, "saved", savedIds);
        writeUserKey(state.activeUserId, "comparisons", compareIds);
        set({ listings, savedIds, compareIds });
      },

      toggleSaved: (vehicleId) => {
        const state = get();
        if (!state.activeUserId) return;
        const exists = state.savedIds.includes(vehicleId);
        const savedIds = exists
          ? state.savedIds.filter((id) => id !== vehicleId)
          : [vehicleId, ...state.savedIds];
        const vehicle = [...state.listings, ...state.seedVehicles].find(
          (v) => v.id === vehicleId
        );
        const activity = vehicle
          ? pushActivity(
              state.activity,
              "save",
              exists ? "Removed saved vehicle" : "Saved vehicle",
              `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            )
          : state.activity;
        writeUserKey(state.activeUserId, "saved", savedIds);
        writeUserKey(state.activeUserId, "activity", activity);
        set({ savedIds, activity });
      },

      toggleCompare: (vehicleId) => {
        const state = get();
        if (!state.activeUserId) return false;
        const exists = state.compareIds.includes(vehicleId);
        if (exists) {
          const compareIds = state.compareIds.filter((id) => id !== vehicleId);
          writeUserKey(state.activeUserId, "comparisons", compareIds);
          set({ compareIds });
          return false;
        }
        if (state.compareIds.length >= 3) {
          toast.error("You can compare up to 3 vehicles at a time.");
          return false;
        }
        const compareIds = [...state.compareIds, vehicleId];
        writeUserKey(state.activeUserId, "comparisons", compareIds);
        set({ compareIds });
        return true;
      },

      clearCompare: () => {
        const state = get();
        if (!state.activeUserId) return;
        writeUserKey(state.activeUserId, "comparisons", []);
        set({ compareIds: [] });
      },

      addInquiry: (input) => {
        const state = get();
        const created: Inquiry = {
          ...input,
          id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          status: "pending",
          read: false,
          createdAt: new Date().toISOString(),
        };
        const inquiries = [created, ...state.inquiries];
        const activity = pushActivity(
          state.activity,
          "inquiry",
          "New inquiry logged",
          `${created.buyerName} · ${created.vehicleTitle}`
        );
        writeUserKey(state.activeUserId, "inquiries", inquiries);
        writeUserKey(state.activeUserId, "activity", activity);
        set({ inquiries, activity });
        return created;
      },

      updateInquiryStatus: (id, status, counterPrice) => {
        const state = get();
        if (!state.activeUserId) return;
        const inquiries = state.inquiries.map((inq) =>
          inq.id === id
            ? {
                ...inq,
                status,
                read: true,
                counterPrice: counterPrice ?? inq.counterPrice,
              }
            : inq
        );
        writeUserKey(state.activeUserId, "inquiries", inquiries);
        set({ inquiries });
      },

      markInquiryRead: (id) => {
        const state = get();
        if (!state.activeUserId) return;
        const inquiries = state.inquiries.map((inq) =>
          inq.id === id ? { ...inq, read: true } : inq
        );
        writeUserKey(state.activeUserId, "inquiries", inquiries);
        set({ inquiries });
      },

      addSavedSearch: (input) => {
        const state = get();
        if (!state.activeUserId) return;
        const created: SavedSearch = {
          ...input,
          id: `srch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        const savedSearches = [created, ...state.savedSearches];
        const activity = pushActivity(
          state.activity,
          "search",
          "Saved search alert",
          created.name
        );
        writeUserKey(state.activeUserId, "savedSearches", savedSearches);
        writeUserKey(state.activeUserId, "activity", activity);
        set({ savedSearches, activity });
      },

      deleteSavedSearch: (id) => {
        const state = get();
        if (!state.activeUserId) return;
        const savedSearches = state.savedSearches.filter((s) => s.id !== id);
        writeUserKey(state.activeUserId, "savedSearches", savedSearches);
        set({ savedSearches });
      },

      recordView: (vehicleId) => {
        const state = get();
        if (!state.activeUserId) return;
        const recentlyViewedIds = [
          vehicleId,
          ...state.recentlyViewedIds.filter((id) => id !== vehicleId),
        ].slice(0, 12);
        writeUserKey(state.activeUserId, "recentlyViewed", recentlyViewedIds);
        set({ recentlyViewedIds });
      },

      updatePreferences: (partial) => {
        const state = get();
        if (!state.activeUserId) return;
        const preferences = { ...state.preferences, ...partial };
        writeUserKey(state.activeUserId, "preferences", preferences);
        set({ preferences });
      },

      exportStateJson: () => {
        const state = get();
        const payload: UserBucketData = {
          listings: state.listings,
          savedIds: state.savedIds,
          compareIds: state.compareIds,
          inquiries: state.inquiries,
          savedSearches: state.savedSearches,
          recentlyViewedIds: state.recentlyViewedIds,
          preferences: state.preferences,
          activity: state.activity,
        };
        return JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), data: payload },
          null,
          2
        );
      },

      importStateJson: (jsonText) => {
        try {
          const parsed = JSON.parse(jsonText) as { data?: Partial<UserBucketData> };
          if (!parsed || typeof parsed !== "object" || !parsed.data) {
            return { ok: false, error: "Invalid SAYARA backup format." };
          }
          const state = get();
          if (!state.activeUserId) {
            return { ok: false, error: "You must be signed in to import data." };
          }
          const merged: UserBucketData = {
            ...EMPTY_USER_BUCKET,
            ...parsed.data,
            preferences: {
              ...DEFAULT_PREFERENCES,
              ...(parsed.data.preferences ?? {}),
            },
          };
          const ok = persistUserBucket(state.activeUserId, merged);
          if (!ok) {
            return { ok: false, error: "Browser storage quota exceeded." };
          }
          set({ ...merged });
          return { ok: true };
        } catch {
          return { ok: false, error: "Malformed JSON file." };
        }
      },

      resetToSeed: () => {
        const state = get();
        persistUserBucket(state.activeUserId, EMPTY_USER_BUCKET);
        set({
          seedVehicles: SEED_VEHICLES,
          ...EMPTY_USER_BUCKET,
        });
      },
    }),
    {
      name: "sayara:catalog:v4",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        seedVehicles: state.seedVehicles,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
