"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./motion";
import { jumpTo, registerLenis } from "./jumpTo";

/* Lenis only helps a mouse wheel. Touch screens keep native momentum scrolling
   (iOS Safari fights JS-driven scroll, and a rAF loop costs battery for nothing). */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
function subscribeFine(cb: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useFinePointer() {
  return useSyncExternalStore(subscribeFine, () => window.matchMedia(FINE_POINTER).matches, () => false);
}

/**
 * Smooth wheel scrolling for the landing page. Not mounted globally — render
 * `<SmoothScroll />` once in the page that wants it. Scroll still happens on
 * the window, so motion's useScroll/useTransform work unchanged. In-page
 * `#anchor` links are NOT smoothed: they use `jumpTo`, which places the page
 * at the section instantly behind a short fade, so scroll stories are never
 * dragged through their timelines. Disabled under reduced motion and on
 * touch / coarse-pointer devices.
 */
export function SmoothScroll({ children }: { children?: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    if (reduce || !fine) {
      registerLenis(null);
      return;
    }
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    registerLenis(lenis);
    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, [reduce, fine]);

  /* deep links (/#faq): land on the section without animating through the page */
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || !document.getElementById(id)) return;
    const land = () => {
      void jumpTo(id, { animate: false, focus: false, updateHash: false });
      return window.scrollY;
    };
    let cancelled = false;
    let placedY = -1;
    const raf = requestAnimationFrame(() => {
      placedY = land();
    });
    /* re-place once web fonts settle the layout, unless the reader has already moved */
    void document.fonts?.ready.then(() => {
      if (!cancelled && (placedY === -1 || Math.abs(window.scrollY - placedY) < 2)) land();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <>{children}</>;
}
