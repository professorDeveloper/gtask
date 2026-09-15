"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/ui/CountUp";
import { SPRING } from "@/components/ui/motion";
import { ACCURACY_BASE, ACCURACY_STEP } from "@/lib/readiness/refine";

const BASE_SEGMENTS = ACCURACY_BASE / ACCURACY_STEP;

/**
 * Accuracy as ten segments: seven earned by the five mandatory answers,
 * three more for the optional ones. Each new optional answer pops a segment.
 */
export function AccuracyMeter({ accuracy }: { accuracy: number }) {
  const filled = Math.round(accuracy / ACCURACY_STEP);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p id="accuracy-label" className="text-caption font-semibold text-ink-2">Report accuracy</p>
        <p className="font-display text-title font-bold tracking-[-0.03em] text-ink">
          <CountUp value={accuracy} from={ACCURACY_BASE} duration={0.6} />%
        </p>
      </div>
      <div
        role="meter"
        aria-labelledby="accuracy-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={accuracy}
        className="mt-2 grid grid-cols-10 gap-1"
      >
        {Array.from({ length: 10 }, (_, i) => {
          const on = i < filled;
          const optional = i >= BASE_SEGMENTS;
          return (
            <span key={i} className="well relative h-2.5 overflow-hidden rounded-full">
              <motion.span
                className={`absolute inset-0 rounded-full ${optional ? "bg-sunny" : "bg-brand"}`}
                initial={false}
                animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={SPRING.pop}
                style={{ originX: 0 }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
