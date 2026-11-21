"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BarChart3,
  Bookmark,
  Car,
  Compass,
  GitCompareArrows,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles } from "@/store/selectors";
import { formatPrice } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROUTES = [
  { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { label: "Listings Manager", href: "/dashboard/listings", icon: Car, shortcut: "G L" },
  { label: "Saved Vehicles & Searches", href: "/dashboard/saved", icon: Bookmark, shortcut: "G S" },
  { label: "Compare Matrix", href: "/dashboard/compare", icon: GitCompareArrows, shortcut: "G C" },
  { label: "Inquiries Inbox", href: "/dashboard/inquiries", icon: Inbox, shortcut: "G I" },
  { label: "Market Analytics", href: "/dashboard/analytics", icon: BarChart3, shortcut: "G A" },
  { label: "Settings & Data", href: "/dashboard/settings", icon: Settings, shortcut: "" },
  { label: "Public Showroom (/browse)", href: "/browse", icon: Compass, shortcut: "" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const vehicles = useSayaraStore(selectActiveVehicles);
  const currency = useSayaraStore((s) => s.preferences.currency);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 pt-[14vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-surface shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Search className="h-4 w-4 text-muted" />
            <Command.Input
              autoFocus
              placeholder="Jump to a dashboard page or search vehicles..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <kbd className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-xs text-muted">
              No matching routes or vehicles.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
            >
              {ROUTES.map((route) => {
                const Icon = route.icon;
                return (
                  <Command.Item
                    key={route.href}
                    value={route.label}
                    onSelect={() => navigate(route.href)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm text-ink aria-selected:bg-elevated aria-selected:text-signal"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{route.label}</span>
                    </span>
                    {route.shortcut && (
                      <span className="font-mono text-[10px] text-muted">{route.shortcut}</span>
                    )}
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group
              heading="Inventory Quick Jump"
              className="mt-2 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
            >
              {vehicles.slice(0, 18).map((v) => (
                <Command.Item
                  key={v.id}
                  value={`${v.year} ${v.make} ${v.model} ${v.location} ${v.bodyType}`}
                  onSelect={() => navigate(`/vehicle/${v.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-ink aria-selected:bg-elevated"
                >
                  <span className="truncate">
                    {v.year} {v.make} {v.model}
                    <span className="ml-2 text-xs text-muted">{v.location}</span>
                  </span>
                  <span className="ml-3 shrink-0 font-mono text-xs text-champagne">
                    {formatPrice(v.price, currency)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
