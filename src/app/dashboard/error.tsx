"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SAYARA dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <div className="w-full rounded-lg border border-line bg-surface p-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border border-signal/40 bg-signal/10 text-signal">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="kicker mt-4">Dashboard Error Boundary</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">
          Unable to load this workspace view
        </h2>
        <p className="mt-2 text-sm text-muted">
          You can retry rendering this panel or return to the main dashboard overview.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry View</span>
          </button>
          <Link
            href="/dashboard"
            className="rounded-md border border-line bg-bg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink/40"
          >
            Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
