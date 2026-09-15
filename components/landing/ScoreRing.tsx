"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CountUp } from "@/components/ui/CountUp";
import type { Band } from "@/lib/readiness/types";
import { usePrefersReducedMotion } from "@/components/ui/motion";

const SWEEP = 0.75; // 270°

/** Readiness out of 100 as a 270° arc that fills (and counts up) when it scrolls into view. */
export function ScoreRing({
  score, band, size = 128,
}: { score: number; band: Band; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = usePrefersReducedMotion();
  const stroke = size / 13;
  const r = (size - stroke) / 2 - 1;
  const c = size / 2;
  const fill = (score / 100) * SWEEP;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Readiness ${score} of 100, ${band.name}`}
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]" aria-hidden>
        <circle
          cx={c} cy={c} r={r} fill="none" pathLength={1}
          stroke="var(--surface-2)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${SWEEP} 1`}
        />
        <motion.circle
          cx={c} cy={c} r={r} fill="none"
          style={{ stroke: `var(--${band.tone})` }}
          strokeWidth={stroke} strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={inView || reduce ? { pathLength: fill, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" aria-hidden>
        <span className="font-display leading-none font-bold tracking-[-0.055em]" style={{ fontSize: size * 0.33 }}>
          <CountUp value={score} startOnView duration={1.3} />
        </span>
        <span className="mt-1 text-micro font-semibold tracking-[0.08em] text-ink-3 uppercase">of 100</span>
      </div>
    </div>
  );
}
