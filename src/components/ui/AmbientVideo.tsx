"use client";

import { useState } from "react";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { useSayaraStore } from "@/store/useSayaraStore";
import { cn } from "@/lib/utils";

interface AmbientVideoProps {
  src: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
  fallbackSizes?: string;
  preload?: "auto" | "metadata" | "none";
  className?: string;
  fallbackClassName?: string;
}

export function AmbientVideo({
  src,
  fallbackSrc,
  fallbackAlt = "SAYARA showcase vehicle",
  fallbackSizes = "100vw",
  preload = "metadata",
  className,
  fallbackClassName,
}: AmbientVideoProps) {
  const [failed, setFailed] = useState(false);
  const reducedMotion = useSayaraStore((s) => s.preferences.reducedMotion);

  if (reducedMotion || failed) {
    if (!fallbackSrc) return null;
    return (
      <VehicleImage
        src={fallbackSrc}
        alt={fallbackAlt}
        sizes={fallbackSizes}
        className={cn("object-cover object-center", fallbackClassName)}
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover object-center", className)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
