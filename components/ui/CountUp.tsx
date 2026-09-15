"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { usePrefersReducedMotion } from "./motion";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * An animated number. Server HTML and screen readers get the final value;
 * sighted users see it count from `from`. Under reduced motion it simply
 * shows the final value. Changing `value` animates from the current number.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1.2,
  delay = 0,
  format = (n) => String(Math.round(n)),
  startOnView = false,
  className = "",
  onDone,
}: {
  value: number;
  from?: number;
  /** seconds */
  duration?: number;
  /** seconds */
  delay?: number;
  format?: (n: number) => string;
  /** Wait until the number scrolls into view. */
  startOnView?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef<number | null>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const ready = !startOnView || inView;
  const formatRef = useRef(format);
  const doneRef = useRef(onDone);
  useIsoLayoutEffect(() => {
    formatRef.current = format;
    doneRef.current = onDone;
  });

  /* Before paint: show the starting number so there is no flash of the final one. */
  useIsoLayoutEffect(() => {
    if (reduce || current.current !== null || !ref.current) return;
    ref.current.textContent = formatRef.current(from);
    current.current = from;
  }, [reduce, from]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = formatRef.current(value);
      current.current = value;
      doneRef.current?.();
      return;
    }
    if (!ready) return;
    const controls = animate(current.current ?? from, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        current.current = n;
        el.textContent = formatRef.current(n);
      },
      onComplete: () => doneRef.current?.(),
    });
    return () => controls.stop();
  }, [value, ready, reduce, duration, delay, from]);

  return (
    <span className={`tnum ${className}`}>
      <span className="sr-only-text">{format(value)}</span>
      <span ref={ref} aria-hidden="true">{format(value)}</span>
    </span>
  );
}
