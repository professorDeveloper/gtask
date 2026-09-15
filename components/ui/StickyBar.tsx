"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * A header that is flush with the page until the page moves under it, then
 * lifts one elevation step (the e1 hairline ring is the only edge).
 * The frosted blur is for pointer devices only: on phones a sticky
 * backdrop-filter re-samples the page every scroll frame, so touch gets a
 * near-solid paper instead.
 */
export function StickyBar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 [@media(hover:hover)]:backdrop-blur-xl ${
        scrolled ? "bg-paper/95 elev-1 [@media(hover:hover)]:bg-paper/80" : "bg-paper/0"
      } ${className}`}
    >
      {children}
    </header>
  );
}
