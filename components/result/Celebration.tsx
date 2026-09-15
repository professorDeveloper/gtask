"use client";

import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SPRING } from "@/components/ui/motion";
import type { BandKey } from "@/lib/readiness/types";

/**
 * The reveal moment for bands that do not get confetti. Rather than a
 * consolation prize it is a warm push: a sunny halo breathes behind the dial
 * and a sticker names the next step. Confetti bands render nothing here —
 * `celebrate()` from ui/confetti handles those.
 */

const WARM: Record<Extract<BandKey, "foundation" | "building">, { icon: IconName; text: string }> = {
  foundation: { icon: "fire", text: "Day one starts now" },
  building: { icon: "trendUp", text: "Momentum is on your side" },
};

export function WarmHalo({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          aria-hidden
          className="result-halo pointer-events-none absolute inset-[-14%] rounded-full"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 0.55, 0.9, 0], scale: [0.7, 1.05, 1, 1.08, 1.15] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.6, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

export function WarmSticker({ band, show }: { band: BandKey; show: boolean }) {
  const warm = band === "foundation" || band === "building" ? WARM[band] : null;
  return (
    <AnimatePresence>
      {show && warm && (
        <motion.span
          className="absolute -top-1 -right-3 z-10 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sunny px-3 text-micro font-bold text-ink elev-2 sm:-right-8"
          initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: 6 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ ...SPRING.pop, delay: 0.15 }}
        >
          <Icon name={warm.icon} size={15} weight="fill" />
          {warm.text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
