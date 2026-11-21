"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectAllVehicles } from "@/store/selectors";
import { generateVehiclePerformance } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { PriceEstimatorCard } from "@/components/dashboard/PriceEstimatorCard";

export default function AnalyticsPage() {
  const vehicles = useSayaraStore(selectAllVehicles);
  const currency = useSayaraStore((s) => s.preferences.currency);

  const performance = generateVehiclePerformance(vehicles);
  const priceVsMarket = performance.slice(0, 7).map((p) => ({
    name: p.title.split(" ").slice(1, 3).join(" "),
    Asking: p.price,
    "Market Avg": p.marketAvg,
  }));

  const totalViews = performance.reduce((a, b) => a + b.views, 0);
  const totalSaves = performance.reduce((a, b) => a + b.saves, 0);
  const totalInquiries = performance.reduce((a, b) => a + b.inquiries, 0);

  const funnel = [
    { stage: "Listing Views", count: totalViews, pct: 100 },
    {
      stage: "Saved Shortlists",
      count: totalSaves,
      pct: Math.round((totalSaves / Math.max(totalViews, 1)) * 100),
    },
    {
      stage: "Buyer Inquiries",
      count: totalInquiries,
      pct: Math.round((totalInquiries / Math.max(totalViews, 1)) * 100),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="border-b border-line pb-6">
        <p className="kicker">Deterministic Telemetry</p>
        <h1 className="mt-1.5 font-display text-display-md font-bold">Market Analytics</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-8">
          <p className="kicker">Pricing Benchmark</p>
          <h2 className="mt-1 font-display text-xl font-bold">Price vs. Body-Type Market Avg</h2>
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceVsMarket}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(146,152,164,0.16)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9298A4" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9298A4" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141A",
                    borderColor: "#262A36",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Asking" fill="#E13B2B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Market Avg" fill="#C9B99B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-4">
          <p className="kicker">Conversion Pipeline</p>
          <h2 className="mt-1 font-display text-xl font-bold">Listing Funnel</h2>
          <div className="mt-6 space-y-5">
            {funnel.map((step) => (
              <div key={step.stage}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{step.stage}</span>
                  <span className="font-mono text-champagne">
                    {step.count.toLocaleString()} ({step.pct}%)
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full bg-signal transition-all"
                    style={{ width: `${Math.max(4, step.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-line bg-surface p-6">
        <p className="kicker">Unit Breakdown</p>
        <h2 className="mt-1 font-display text-xl font-bold">Per-Vehicle Performance</h2>
        <table className="mt-5 w-full min-w-[680px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <th className="py-3">Vehicle</th>
              <th className="py-3">Asking</th>
              <th className="py-3">vs Market</th>
              <th className="py-3">Views</th>
              <th className="py-3">Saves</th>
              <th className="py-3">Inquiries</th>
              <th className="py-3">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono">
            {performance.map((row) => (
              <tr key={row.vehicleId} className="hover:bg-elevated/40">
                <td className="py-3 font-sans text-sm font-medium text-ink">{row.title}</td>
                <td className="py-3 text-ink">{formatPrice(row.price, currency)}</td>
                <td
                  className={`py-3 ${row.deltaPct > 0 ? "text-champagne" : "text-emerald-400"}`}
                >
                  {row.deltaPct > 0 ? `+${row.deltaPct}%` : `${row.deltaPct}%`}
                </td>
                <td className="py-3 text-muted">{row.views}</td>
                <td className="py-3 text-muted">{row.saves}</td>
                <td className="py-3 text-ink">{row.inquiries}</td>
                <td className="py-3 text-signal">{row.conversionPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PriceEstimatorCard />
    </div>
  );
}
