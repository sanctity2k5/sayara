"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bookmark,
  Car,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectUnreadInquiriesCount } from "@/store/selectors";

export function UserMenu() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const unreadCount = useSayaraStore(selectUnreadInquiriesCount);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Member";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 text-ink transition hover:border-ink/40",
          open && "border-signal"
        )}
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={fullName}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal font-mono text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted transition-transform duration-200",
            open && "rotate-180 text-signal"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-elevated"
        >
          {/* User Identity Header */}
          <div className="border-b border-line px-4 py-3.5">
            <p className="truncate font-display text-sm font-bold text-ink">{fullName}</p>
            {email && <p className="mt-0.5 truncate font-mono text-[11px] text-muted">{email}</p>}
          </div>

          {/* Workspace Links */}
          <div className="p-1.5">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-ink transition hover:bg-elevated hover:text-signal"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-champagne" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/listings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-ink transition hover:bg-elevated hover:text-signal"
            >
              <Car className="h-3.5 w-3.5 text-muted" />
              <span>My Listings</span>
            </Link>
            <Link
              href="/dashboard/saved"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-ink transition hover:bg-elevated hover:text-signal"
            >
              <Bookmark className="h-3.5 w-3.5 text-muted" />
              <span>Saved & Searches</span>
            </Link>
            <Link
              href="/dashboard/inquiries"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-ink transition hover:bg-elevated hover:text-signal"
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="h-3.5 w-3.5 text-muted" />
                <span>Inquiries</span>
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-ink transition hover:bg-elevated hover:text-signal"
            >
              <Settings className="h-3.5 w-3.5 text-muted" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Account & Sign Out */}
          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                openUserProfile();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-muted transition hover:bg-elevated hover:text-ink"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Manage Account</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut({ redirectUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-signal transition hover:bg-signal/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
