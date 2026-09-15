"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { prefersReducedMotion } from "@/components/ui/motion";
import type { Band } from "@/lib/readiness/types";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const toneVar: Record<Band["tone"], string> = {
  gap: "var(--gap)",
  progress: "var(--progress)",
  brand: "var(--brand)",
  ready: "var(--ready)",
};

/** Below this share of the sweep a low score reads as a stray dot, not an arc. */
const MIN_ARC = 0.04;

/**
 * Readiness out of 100 as a 270° arc.
 *
 * The server renders the final score, so screenshots, slow devices and
 * no-JS visitors see the real number. With `intro`, the client resets to 0
 * before paint and counts up; later `score` changes animate from the number
 * on screen (live re-scores). `onSettled` fires after every animation.
 */
export function ScoreDial({
  score, band, size = 220, intro = false, onSettled, label = "Readiness",
}: {
  score: number;
  band: Band;
  size?: number;
  intro?: boolean;
  onSettled?: (score: number) => void;
  label?: string;
}) {
  const value = useMotionValue(score);
  const settledRef = useRef(onSettled);
  const first = useRef(true);
  useIsoLayoutEffect(() => {
    settledRef.current = onSettled;
  });

  const stroke = Math.round(size / 13);
  const r = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.75;

  const dash = useTransform(value, (v) => {
    const share = v <= 0 ? 0 : Math.max(MIN_ARC, v / 100);
    return `${arc * share} ${circumference}`;
  });
  const shown = useTransform(value, (v) => String(Math.round(v)));

  useIsoLayoutEffect(() => {
    const reduce = prefersReducedMotion();
    if (first.current) {
      first.current = false;
      if (!intro || reduce) {
        settledRef.current?.(score);
        return;
      }
      value.set(0);
      const controls = animate(value, score, {
        duration: 1.5,
        delay: 0.25,
        ease: [0.16, 1, 0.3, 1],
        onComplete: () => settledRef.current?.(score),
      });
      return () => controls.stop();
    }
    if (reduce) {
      value.set(score);
      settledRef.current?.(score);
      return;
    }
    const controls = animate(value, score, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => settledRef.current?.(score),
    });
    return () => controls.stop();
  }, [score, intro, value]);

  return (
    <div
      role="img"
      aria-label={`${label} ${score} out of 100, ${band.name}`}
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]" aria-hidden>
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--well)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={toneVar[band.tone]} strokeWidth={stroke} strokeLinecap="round"
          style={{ strokeDasharray: dash, transition: "stroke .5s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" aria-hidden>
        <motion.span
          className="tnum font-display leading-none font-bold tracking-[-0.055em] text-ink"
          style={{ fontSize: Math.round(size * 0.33) }}
        >
          {shown}
        </motion.span>
        <span className="mt-1.5 text-micro font-semibold tracking-[0.08em] text-ink-3 uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
