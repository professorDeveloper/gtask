"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./motion";

/**
 * Smooth wheel scrolling for the landing page. Not mounted globally — render
 * `<SmoothScroll />` once in the page that wants it. Scroll still happens on
 * the window, so motion's useScroll/useTransform work unchanged. In-page
 * `#anchor` links are smoothed too. Disabled entirely under reduced motion.
 */
export function SmoothScroll({ children }: { children?: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -72 }, lerp: 0.12 });
    return () => lenis.destroy();
  }, [reduce]);

  return <>{children}</>;
}
