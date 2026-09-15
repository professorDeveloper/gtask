"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/components/ui/motion";

/** A number that springs to each new value (live re-scores). Server HTML holds the real value. */
export function SpringNumber({ value, className = "" }: { value: number; className?: string }) {
  const reduce = usePrefersReducedMotion();
  const mv = useSpring(value, { stiffness: 170, damping: 24 });
  const text = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    if (reduce) mv.jump(value);
    else mv.set(value);
  }, [value, reduce, mv]);

  return (
    <span className={`tnum ${className}`}>
      <span className="sr-only-text">{value}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}
