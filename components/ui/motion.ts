import { useSyncExternalStore } from "react";

/**
 * Shared motion vocabulary. Import springs from here instead of inventing
 * per-component numbers, so taps, pops and reveals feel like one product.
 * (No "use client": constants must stay importable from server components;
 * the hook is only callable from client components anyway.)
 */
export const SPRING = {
  /** Button / chip press feedback. */
  tap: { type: "spring", stiffness: 500, damping: 30 },
  /** Playful pop for stickers, badges, progress segments (slight overshoot). */
  pop: { type: "spring", stiffness: 420, damping: 18 },
  /** Layout moves, cards settling, re-score transitions. */
  soft: { type: "spring", stiffness: 260, damping: 30 },
  /** Slow, premium settle for landing reveals and parallax. */
  gentle: { type: "spring", stiffness: 120, damping: 24 },
} as const;

/** whileTap scale for tappable things. */
export const TAP_SCALE = 0.96;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True when the user asked the OS for reduced motion. It is false during SSR
 * *and* hydration, then the real value, so markup that depends on it never
 * causes a hydration mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

/** Imperative check for non-React code (confetti, Lenis). False on the server. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}
