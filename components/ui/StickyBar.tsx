"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * A header that is flush with the page until the page moves under it, then
 * lifts one elevation step. Height signals "this is on top of the content",
 * so it should only appear once there is content underneath.
 */
export function StickyBar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-line bg-paper/85 shadow-[var(--elev-2)]"
          : "border-transparent bg-paper"
      } ${className}`}
    >
      {children}
    </header>
  );
}
