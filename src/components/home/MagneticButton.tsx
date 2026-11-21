"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * 0.26);
      yTo(relY * 0.26);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors will-change-transform",
        variant === "primary"
          ? "bg-signal text-white hover:bg-signal-hover"
          : "border border-white/25 bg-black/40 text-white backdrop-blur-md hover:border-white/60 hover:bg-black/65",
        className
      )}
    >
      {children}
    </Link>
  );
}
