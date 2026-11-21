import type { CurrencyCode, DistanceUnit } from "./config";

export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
export type TransmissionType = "Automatic" | "Manual" | "Dual-Clutch";
export type BodyType =
  | "Sedan"
  | "SUV"
  | "Coupe"
  | "Sports"
  | "Convertible"
  | "Truck"
  | "Hatchback";
export type VehicleStatus = "draft" | "active" | "sold";

export interface VehicleSpecs {
  engine: string;
  horsepower: number;
  torque: string;
  zeroToSixty: string;
  drivetrain: "AWD" | "RWD" | "FWD" | "4WD";
  seats: number;
  doors: number;
  vin: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  bodyType: BodyType;
  color: string;
  location: string;
  images: string[];
  specs: VehicleSpecs;
  sellerId: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface ImageManifestEntry {
  file: string;
  make: string;
  model: string;
  yearOrGeneration: string;
  bodyStyle: BodyType;
  view?: "exterior" | "interior";
  source: string;
  sourceUrl: string;
  license: string;
  verifiedBy: "agent-visual" | "owner";
}

export type InquiryStatus = "pending" | "accepted" | "countered" | "declined";

export interface Inquiry {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  buyerName: string;
  buyerEmail: string;
  offerPrice: number;
  counterPrice?: number;
  message: string;
  source: "Direct" | "Search" | "Comparison" | "Featured";
  status: InquiryStatus;
  read: boolean;
  createdAt: string;
}

export interface VehicleFilters {
  query: string;
  make: string;
  model: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType: string;
  fuel: string;
  transmission: string;
  location: string;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "mileage-asc"
  | "year-desc";

export interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<VehicleFilters>;
  lastMatchCount: number;
  createdAt: string;
}

export interface UserPreferences {
  currency: CurrencyCode;
  distanceUnit: DistanceUnit;
  emailAlerts: boolean;
  reducedMotion: boolean;
}

export interface ActivityItem {
  id: string;
  type: "listing" | "save" | "inquiry" | "compare" | "search";
  title: string;
  detail: string;
  timestamp: string;
}
