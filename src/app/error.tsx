"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SAYARA runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center text-ink">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-signal/40 bg-signal/10 text-signal">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="kicker mt-5">System Recovery</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Something went off track</h1>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred while rendering this view. Your local inventory and saved
          data remain intact.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="rounded-md border border-line bg-bg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink/40"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
