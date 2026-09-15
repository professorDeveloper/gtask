import type { BandKey } from "@/lib/readiness/types";
import { prefersReducedMotion } from "./motion";

/**
 * Celebration helpers around canvas-confetti. The library is loaded on first
 * use, so it never lands in a page bundle that does not celebrate. Every
 * function is a no-op on the server and under reduced motion.
 */

/** Brand palette for particles (hex, because the canvas cannot read CSS vars). */
export const CONFETTI_COLORS = ["#1552F0", "#7C5CFF", "#FFD23F", "#F59E0B", "#10B981"];

export type Celebration = "big" | "confetti" | "warm";

/**
 * What the reveal should do for a band:
 *   ready      → "big"      (several bursts from both sides)
 *   sharpening → "confetti" (one burst)
 *   building / foundation → "warm" (no confetti; show a warm motivational animation instead)
 */
export function celebrationFor(band: BandKey): Celebration {
  if (band === "ready") return "big";
  if (band === "sharpening") return "confetti";
  return "warm";
}

async function load() {
  return (await import("canvas-confetti")).default;
}

/**
 * Fires the celebration for a band. Resolves to true when confetti was shown,
 * false when the caller should run its warm animation (lower bands) or when
 * motion is reduced.
 */
export async function celebrate(band: BandKey): Promise<boolean> {
  const kind = celebrationFor(band);
  if (kind === "warm" || typeof window === "undefined" || prefersReducedMotion()) return false;
  const confetti = await load();
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 90 };
  if (kind === "confetti") {
    confetti({ ...base, particleCount: 110, spread: 75, startVelocity: 42, origin: { y: 0.6 } });
    return true;
  }
  const side = (x: number, angle: number) =>
    confetti({ ...base, particleCount: 70, angle, spread: 60, startVelocity: 55, origin: { x, y: 0.7 } });
  side(0, 60);
  side(1, 120);
  window.setTimeout(() => confetti({ ...base, particleCount: 140, spread: 100, startVelocity: 38, origin: { y: 0.55 } }), 280);
  window.setTimeout(() => { side(0.1, 70); side(0.9, 110); }, 620);
  return true;
}

/** Clears any particles still falling, e.g. before the screen underneath them changes. */
export async function clearConfetti(): Promise<void> {
  if (typeof window === "undefined") return;
  (await load()).reset();
}

/**
 * A small burst for micro-wins (answering a refinement, finishing a step).
 * `origin` is in viewport fractions; pass an element to burst from its centre.
 */
export async function burst(from?: HTMLElement | { x: number; y: number }): Promise<void> {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  let origin = { x: 0.5, y: 0.5 };
  if (from instanceof HTMLElement) {
    const r = from.getBoundingClientRect();
    origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  } else if (from) origin = from;
  const confetti = await load();
  confetti({
    colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 90,
    particleCount: 28, spread: 55, startVelocity: 22, scalar: 0.8, ticks: 120, origin,
  });
}
