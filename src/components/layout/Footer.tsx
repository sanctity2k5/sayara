"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="border-t border-line bg-surface text-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-signal font-display text-xs font-bold text-white">
                S
              </span>
              <span className="font-display text-base font-bold tracking-[0.22em] text-ink">
                SAYARA
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Automotive discovery and curated vehicle marketplace connecting enthusiasts,
              collectors, and sellers across international markets.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">
              Marketplace
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/browse" className="transition hover:text-ink">
                  Browse Inventory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="transition hover:text-ink">
                  Compare Vehicles
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="transition hover:text-ink">
                  List a Vehicle
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">
              Global Markets
            </h3>
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
              London · Berlin · Zurich · Dubai · Singapore · Tokyo · Toronto · New York · Sydney ·
              Paris
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-line pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SAYARA. Automotive Discovery & Vehicle Marketplace.</p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-2 self-start rounded-md border border-line bg-bg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink transition hover:border-signal hover:text-signal sm:self-auto"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
