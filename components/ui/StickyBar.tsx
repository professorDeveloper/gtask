"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * A header that is flush with the page until the page moves under it, then
 * lifts one elevation step (the e1 hairline ring is the only edge).
 */
export function StickyBar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-paper/80 elev-1" : "bg-paper/0"
      } ${className}`}
    >
      {children}
    </header>
  );
}
