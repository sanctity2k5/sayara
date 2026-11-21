"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { GitCompareArrows, LayoutDashboard, Menu, X } from "lucide-react";
import { cn, isClerkConfigured } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const PUBLIC_NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/compare", label: "Compare" },
];

function DesktopClerkAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="text-xs font-medium uppercase tracking-[0.15em] text-muted transition hover:text-ink"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-md bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-signal-hover"
      >
        Get started
      </Link>
    </div>
  );
}

function MobileClerkAuth({ onNavigate }: { onNavigate: () => void }) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-signal py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className="mt-4 flex gap-3">
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="flex-1 rounded-md border border-line py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        onClick={onNavigate}
        className="flex-1 rounded-md bg-signal py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white"
      >
        Get started
      </Link>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const compareCount = useSayaraStore((s) => s.compareIds.length);
  const clerkReady = isClerkConfigured();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-signal font-display text-sm font-bold text-white transition group-hover:scale-105">
            S
          </span>
          <span className="font-display text-lg font-bold tracking-[0.22em] text-ink">
            SAYARA
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {PUBLIC_NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] transition",
                  active ? "text-signal" : "text-muted hover:text-ink"
                )}
              >
                {link.href === "/compare" && <GitCompareArrows className="h-3.5 w-3.5" />}
                <span>{link.label}</span>
                {link.href === "/compare" && compareCount > 0 && (
                  <span className="ml-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-semibold text-white">
                    {compareCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {clerkReady ? (
            <DesktopClerkAuth />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-xs font-medium uppercase tracking-[0.15em] text-muted transition hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-signal-hover"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-line bg-surface px-4 pb-6 pt-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line pb-2.5 text-sm font-medium uppercase tracking-[0.15em] text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {clerkReady ? (
            <MobileClerkAuth onNavigate={() => setMobileOpen(false)} />
          ) : (
            <div className="mt-4 flex gap-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md border border-line py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md bg-signal py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
