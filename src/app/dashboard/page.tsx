"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Bookmark, Car, Eye, Inbox, Plus } from "lucide-react";
import { useSayaraStore } from "@/store/useSayaraStore";
import {
  filterAndSortVehicles,
  selectActiveVehicles,
  selectRecentlyViewedVehicles,
} from "@/store/selectors";
import { generateLeadsBySource, generateViewsOverTime } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { PriceEstimatorCard } from "@/components/dashboard/PriceEstimatorCard";
import { VehicleImage } from "@/components/ui/VehicleImage";

export default function DashboardOverviewPage() {
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const recentlyViewed = useSayaraStore(selectRecentlyViewedVehicles);
  const savedIds = useSayaraStore((s) => s.savedIds);
  const inquiries = useSayaraStore((s) => s.inquiries);
  const savedSearches = useSayaraStore((s) => s.savedSearches);
  const activity = useSayaraStore((s) => s.activity);
  const prefs = useSayaraStore((s) => s.preferences);

  const viewsSeries = generateViewsOverTime(activeVehicles);
  const leadsBySource = generateLeadsBySource(inquiries, activeVehicles.length);
  const totalViews = viewsSeries.reduce((acc, p) => acc + p.views, 0);

  const kpis = [
    {
      label: "Active Listings",
      value: activeVehicles.length,
      icon: Car,
      href: "/dashboard/listings",
      data: viewsSeries.map((_, i) => ({ v: Math.max(8, activeVehicles.length - 6 + i) })),
      stroke: "#E13B2B",
    },
    {
      label: "Total Views (14d)",
      value: totalViews.toLocaleString(),
      icon: Eye,
      href: "/dashboard/analytics",
      data: viewsSeries.map((p) => ({ v: p.views })),
      stroke: "#C9B99B",
    },
    {
      label: "Inquiries",
      value: inquiries.length,
      icon: Inbox,
      href: "/dashboard/inquiries",
      data: viewsSeries.map((p) => ({ v: p.inquiries })),
      stroke: "#E13B2B",
    },
    {
      label: "Saved Vehicles",
      value: savedIds.length,
      icon: Bookmark,
      href: "/dashboard/saved",
      data: viewsSeries.map((p) => ({ v: p.saves })),
      stroke: "#C9B99B",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Seller & Collector Telemetry</p>
          <h1 className="mt-1.5 font-display text-display-md font-bold">Overview</h1>
        </div>
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Manage Listings</span>
        </Link>
      </header>

      {/* 4 KPI Cards with Sparklines */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group rounded-lg border border-line bg-surface p-5 transition hover:border-ink/35"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 text-champagne" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-display text-3xl font-bold text-ink">{kpi.value}</p>
                <div className="h-10 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.data}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={kpi.stroke}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Views Over Time + Leads by Source */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="kicker">Traffic Telemetry</p>
              <h2 className="mt-1 font-display text-xl font-bold">Views Over Time</h2>
            </div>
            <Link
              href="/dashboard/analytics"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:underline"
            >
              Full Analytics →
            </Link>
          </div>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsSeries}>
                <defs>
                  <linearGradient id="sayaraViewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E13B2B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E13B2B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(146,152,164,0.16)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9298A4" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9298A4" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141A",
                    borderColor: "#262A36",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#E13B2B"
                  strokeWidth={2}
                  fill="url(#sayaraViewsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-4">
          <p className="kicker">Acquisition Channels</p>
          <h2 className="mt-1 font-display text-xl font-bold">Leads by Source</h2>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(146,152,164,0.16)" />
                <XAxis dataKey="source" tick={{ fontSize: 11, fill: "#9298A4" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9298A4" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141A",
                    borderColor: "#262A36",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="leads" fill="#C9B99B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Price Estimator + Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PriceEstimatorCard />
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-5">
          <p className="kicker">Activity Log</p>
          <h2 className="mt-1 font-display text-xl font-bold">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Saves, inquiries, searches, and new listings will appear here in real time.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activity.slice(0, 6).map((act) => (
                <li
                  key={act.id}
                  className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{act.title}</p>
                    <p className="text-xs text-muted">{act.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-champagne">
                    {act.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Saved Searches + Recently Viewed */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="kicker">Watchlist Alerts</p>
              <h2 className="mt-1 font-display text-xl font-bold">Saved Searches</h2>
            </div>
            <Link
              href="/dashboard/saved"
              className="font-mono text-[11px] uppercase text-signal hover:underline"
            >
              Manage →
            </Link>
          </div>
          {savedSearches.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Save a filtered search from <Link href="/browse" className="text-signal underline">/browse</Link> to track new matches.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {savedSearches.slice(0, 4).map((srch) => {
                const currentCount = filterAndSortVehicles(activeVehicles, srch.filters).length;
                const newMatches = Math.max(0, currentCount - srch.lastMatchCount);
                return (
                  <li
                    key={srch.id}
                    className="flex items-center justify-between rounded-md border border-line bg-bg px-3.5 py-2.5 text-xs"
                  >
                    <span className="truncate font-medium text-ink">{srch.name}</span>
                    <div className="ml-2 flex shrink-0 items-center gap-2">
                      <span className="font-mono text-muted">{currentCount} matches</span>
                      {newMatches > 0 && (
                        <span className="rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                          +{newMatches} new
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="kicker">History</p>
              <h2 className="mt-1 font-display text-xl font-bold">Recently Viewed</h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-signal hover:underline"
            >
              <span>Browse</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentlyViewed.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Vehicles you inspect while signed in will appear here for quick access.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recentlyViewed.slice(0, 4).map((v) => (
                <Link
                  key={v.id}
                  href={`/vehicle/${v.id}`}
                  className="flex items-center gap-3 rounded-md border border-line bg-bg p-2.5 transition hover:border-ink/35"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-elevated">
                    <VehicleImage
                      src={v.images[0]}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="font-mono text-xs text-champagne">
                      {formatPrice(v.price, prefs.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
