import type { BodyType, Inquiry, Vehicle } from "./types";

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface ViewsPoint {
  day: string;
  views: number;
  saves: number;
  inquiries: number;
}

export function generateViewsOverTime(vehicles: Vehicle[]): ViewsPoint[] {
  const seed = vehicles.reduce((acc, v) => acc ^ hashString(v.id), 42);
  const countFactor = Math.max(1, Math.min(3.5, vehicles.length / 12));
  const points: ViewsPoint[] = [];

  for (let i = 13; i >= 0; i--) {
    const h = hashString(`${seed}-day-${i}`);
    const wave = Math.sin(((14 - i) / 14) * Math.PI * 1.4) * 0.25 + 1;
    const views = Math.round(((110 + (h % 130)) * countFactor * wave) / 1.2);
    const saves = Math.max(4, Math.round(views * (0.08 + ((h >> 4) % 5) * 0.01)));
    const inquiries = Math.max(1, Math.round(saves * (0.18 + ((h >> 8) % 4) * 0.03)));
    const label = i === 0 ? "Today" : `D-${i}`;
    points.push({ day: label, views, saves, inquiries });
  }

  return points;
}

export interface LeadSourcePoint {
  source: Inquiry["source"];
  leads: number;
}

export function generateLeadsBySource(
  inquiries: Inquiry[],
  vehicleCount: number
): LeadSourcePoint[] {
  const baseFactor = Math.max(1, Math.round(vehicleCount / 12));
  const counts: Record<Inquiry["source"], number> = {
    Search: 14 * baseFactor,
    Direct: 9 * baseFactor,
    Featured: 11 * baseFactor,
    Comparison: 6 * baseFactor,
  };

  for (const inq of inquiries) {
    counts[inq.source] = (counts[inq.source] ?? 0) + 1;
  }

  return (Object.keys(counts) as Inquiry["source"][]).map((source) => ({
    source,
    leads: counts[source],
  }));
}

export interface VehiclePerformanceRow {
  vehicleId: string;
  title: string;
  price: number;
  marketAvg: number;
  deltaPct: number;
  views: number;
  saves: number;
  inquiries: number;
  conversionPct: number;
}

export function generateVehiclePerformance(vehicles: Vehicle[]): VehiclePerformanceRow[] {
  const byBody = new Map<BodyType, { total: number; count: number }>();
  for (const v of vehicles) {
    const entry = byBody.get(v.bodyType) ?? { total: 0, count: 0 };
    entry.total += v.price;
    entry.count += 1;
    byBody.set(v.bodyType, entry);
  }

  return vehicles
    .slice(0, 14)
    .map((v) => {
      const h = hashString(v.id);
      const bucket = byBody.get(v.bodyType);
      const marketAvg = bucket
        ? Math.round(bucket.total / Math.max(1, bucket.count))
        : v.price;
      const deltaPct = Math.round(((v.price - marketAvg) / Math.max(1, marketAvg)) * 100);
      const views = 180 + (h % 620);
      const saves = Math.max(6, Math.round(views * (0.07 + ((h >> 5) % 8) * 0.01)));
      const inquiries = Math.max(1, Math.round(saves * (0.14 + ((h >> 9) % 6) * 0.02)));
      const conversionPct = Number(((inquiries / Math.max(1, views)) * 100).toFixed(1));

      return {
        vehicleId: v.id,
        title: `${v.year} ${v.make} ${v.model}`,
        price: v.price,
        marketAvg,
        deltaPct,
        views,
        saves,
        inquiries,
        conversionPct,
      };
    })
    .sort((a, b) => b.views - a.views);
}

export type VehicleCondition = "Concours" | "Excellent" | "Good" | "Fair";

export interface PriceEstimateInput {
  basePrice: number;
  year: number;
  mileageKm: number;
  condition: VehicleCondition;
}

export interface PriceEstimateResult {
  low: number;
  mid: number;
  high: number;
}

const CONDITION_MULTIPLIER: Record<VehicleCondition, number> = {
  Concours: 1.12,
  Excellent: 1.0,
  Good: 0.9,
  Fair: 0.78,
};

export function estimateVehiclePrice(input: PriceEstimateInput): PriceEstimateResult {
  const currentYear = 2026;
  const age = Math.max(0, currentYear - input.year);
  const ageFactor = Math.max(0.42, Math.pow(0.92, age));
  const mileageFactor = Math.max(0.55, 1 - (input.mileageKm / 200000) * 0.35);
  const conditionFactor = CONDITION_MULTIPLIER[input.condition];

  const mid = Math.round((input.basePrice * ageFactor * mileageFactor * conditionFactor) / 500) * 500;
  const low = Math.round((mid * 0.89) / 500) * 500;
  const high = Math.round((mid * 1.09) / 500) * 500;

  return { low, mid, high };
}

export interface SimulatedBuyerTemplate {
  buyerName: string;
  buyerEmail: string;
  discountPct: number;
  message: string;
  source: Inquiry["source"];
}

export const SIMULATED_BUYER_TEMPLATES: SimulatedBuyerTemplate[] = [
  {
    buyerName: "Claire Beaumont",
    buyerEmail: "c.beaumont@atelier-geneva.example",
    discountPct: 0.95,
    message:
      "Does this vehicle include full factory service history and both keys? Ready to arrange enclosed transport once PPI clears.",
    source: "Search",
  },
  {
    buyerName: "Daniel Lindholm",
    buyerEmail: "dlindholm@nordicmotors.example",
    discountPct: 0.97,
    message:
      "Interested in scheduling a pre-purchase inspection this week. Can proceed promptly if paint readings are original.",
    source: "Direct",
  },
  {
    buyerName: "Kenji Takahashi",
    buyerEmail: "k.takahashi@tokyoimports.example",
    discountPct: 0.96,
    message:
      "Compared this listing against two similar specifications on SAYARA. Happy to close at my offer if export paperwork is ready.",
    source: "Comparison",
  },
  {
    buyerName: "Hannah Gallagher",
    buyerEmail: "hgallagher@mayfaircollect.example",
    discountPct: 0.98,
    message:
      "Saw this featured on the showroom feed. Could you confirm recent brake service and tire tread depth?",
    source: "Featured",
  },
  {
    buyerName: "Marcus Vance",
    buyerEmail: "mvance@pacificauto.example",
    discountPct: 0.94,
    message:
      "Looking to add this model to my collection. Open to discussing terms if we can align close to my offer.",
    source: "Direct",
  },
];
