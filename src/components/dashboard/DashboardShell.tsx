"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Car,
  ChevronRight,
  GitCompareArrows,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  X,
} from "lucide-react";
import { cn, isClerkConfigured } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectUnreadInquiriesCount } from "@/store/selectors";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { CommandPalette } from "./CommandPalette";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Listings", icon: Car },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  listings: "Listings Manager",
  saved: "Saved & Searches",
  compare: "Compare Matrix",
  inquiries: "Inquiries Inbox",
  analytics: "Analytics",
  settings: "Settings",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const unreadCount = useSayaraStore(selectUnreadInquiriesCount);
  const clerkReady = isClerkConfigured();

  // Keyboard shortcuts: '[' toggles sidebar collapse, 'g + d/l/s/c/i/a' navigates
  useEffect(() => {
    let chord = "";
    let timer: number | null = null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "[") {
        setCollapsed((v) => !v);
        return;
      }
      if (e.key.toLowerCase() === "g") {
        chord = "g";
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          chord = "";
        }, 700);
        return;
      }
      if (chord === "g") {
        chord = "";
        const map: Record<string, string> = {
          d: "/dashboard",
          l: "/dashboard/listings",
          s: "/dashboard/saved",
          c: "/dashboard/compare",
          i: "/dashboard/inquiries",
          a: "/dashboard/analytics",
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) router.push(dest);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timer) window.clearTimeout(timer);
    };
  }, [router, mobileOpen]);

  const segments = pathname.split("/").filter(Boolean);
  const currentLeaf = segments[segments.length - 1] ?? "dashboard";
  const currentTitle = ROUTE_LABELS[currentLeaf] ?? "Overview";

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col justify-between border-r border-line bg-surface transition-all duration-200 lg:flex",
          collapsed ? "w-[74px]" : "w-60"
        )}
      >
        <div>
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <Link href="/" className="inline-flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-signal font-display text-sm font-bold text-white">
                S
              </span>
              {!collapsed && (
                <span className="font-display text-base font-bold tracking-[0.22em] text-ink">
                  SAYARA
                </span>
              )}
            </Link>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar ([)"
                className="rounded p-1.5 text-muted hover:bg-elevated hover:text-ink"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav aria-label="Dashboard navigation" className="mt-4 space-y-1 px-2.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-medium transition",
                    active
                      ? "bg-signal text-white"
                      : "text-muted hover:bg-elevated hover:text-ink",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                  {!collapsed && item.href === "/dashboard/inquiries" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                        active ? "bg-white/20 text-white" : "bg-signal text-white"
                      )}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-line p-3">
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar ([)"
              className="flex w-full items-center justify-center rounded-md p-2 text-muted hover:bg-elevated hover:text-ink"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/browse"
            title="Public Marketplace"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-muted transition hover:bg-elevated hover:text-ink",
              collapsed && "justify-center px-0"
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Marketplace</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-200",
          collapsed ? "lg:pl-[74px]" : "lg:pl-60"
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle dashboard menu"
              aria-expanded={mobileOpen}
              aria-controls="dashboard-mobile-nav"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
              <Link href="/dashboard" className="font-mono text-muted hover:text-ink">
                Dashboard
              </Link>
              {currentLeaf !== "dashboard" && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  <span className="font-medium text-ink">{currentTitle}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-ink/40 hover:text-ink"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />
            {clerkReady && <UserMenu />}
          </div>
        </header>

        {mobileOpen && (
          <div
            id="dashboard-mobile-nav"
            className="border-b border-line bg-surface p-4 lg:hidden"
          >
            <nav aria-label="Mobile dashboard navigation" className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                      active ? "bg-signal text-white" : "bg-elevated text-ink"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main id="main-content" className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
