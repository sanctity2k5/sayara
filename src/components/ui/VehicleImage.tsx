"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageProps {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Renders a verified vehicle photo via next/image.
 * If the image is missing or fails to load, shows a neutral "Photo unavailable"
 * placeholder — never substitutes another car's photo.
 */
export function VehicleImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} — Photo unavailable`}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-elevated text-muted",
          className
        )}
      >
        <ImageOff className="h-6 w-6 opacity-60" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
          Photo unavailable
        </span>
      </div>
    );
  }

  // Data URLs (user-uploaded compressed WebP images in localStorage) render cleanly with unoptimized
  const isDataUrl = src.startsWith("data:");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isDataUrl}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
