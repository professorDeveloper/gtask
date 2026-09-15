"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/components/ui/motion";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress (0–1) through `target`, for scroll-linked stories. One
 * stable MotionValue, so transforms built on it keep working when the
 * reduced-motion preference resolves after hydration: under reduced motion
 * it simply holds 1 (every story shows its finished state).
 */
export function useScrollStory(target: RefObject<HTMLElement | null>, offset: Offset) {
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce) progress.set(v);
  });
  useEffect(() => {
    progress.set(reduce ? 1 : scrollYProgress.get());
  }, [reduce, progress, scrollYProgress]);

  return { progress, reduce };
}
