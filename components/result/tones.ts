import type { IconName } from "@/components/ui/Icon";
import type { Band, BandKey } from "@/lib/readiness/types";

/** Literal class names per band tone, so Tailwind can see every one of them. */
export const TONE: Record<Band["tone"], { fill: string; soft: string; ink: string; ring: string }> = {
  gap: { fill: "bg-gap", soft: "bg-gap-soft", ink: "text-gap-ink", ring: "ring-gap/30" },
  progress: { fill: "bg-progress", soft: "bg-progress-soft", ink: "text-progress-ink", ring: "ring-progress/35" },
  brand: { fill: "bg-brand", soft: "bg-brand-soft", ink: "text-brand", ring: "ring-brand/30" },
  ready: { fill: "bg-ready", soft: "bg-ready-soft", ink: "text-ready-ink", ring: "ring-ready/35" },
};

export const BAND_ICON: Record<BandKey, IconName> = {
  foundation: "flag",
  building: "trendUp",
  sharpening: "crosshair",
  ready: "trophy",
};
