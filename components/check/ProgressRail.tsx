"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/ui/motion";

/**
 * Five segments. A segment fills (progress amber = earned) only once its
 * question is answered, popping with a sunny flash; the current question
 * wears a soft brand outline.
 */
export function ProgressRail({
  answers,
  index,
  current = true,
  className = "",
}: {
  answers: (string | null)[];
  index: number;
  /** Outline the current segment (off once the check is being scored). */
  current?: boolean;
  className?: string;
}) {
  const total = answers.length;
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
      aria-valuetext={`Question ${index + 1} of ${total}`}
      className={`flex items-center gap-1.5 ${className}`}
    >
      {answers.map((answer, i) => (
        <Segment key={i} filled={Boolean(answer)} current={current && i === index} />
      ))}
    </div>
  );
}

function Segment({ filled, current }: { filled: boolean; current: boolean }) {
  return (
    <motion.span
      key={filled ? "on" : "off"}
      initial={filled ? { scaleY: 1 } : false}
      animate={filled ? { scaleY: [1, 1.9, 1] } : { scaleY: 1 }}
      transition={{ duration: 0.42, times: [0, 0.35, 1], ease: "easeOut" }}
      className={`relative h-2 flex-1 overflow-hidden rounded-full bg-line ${current ? "check-rail-current" : ""}`}
    >
      {filled && (
        <>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={SPRING.soft}
            className="absolute inset-0 origin-left rounded-full bg-progress"
          />
          <motion.span
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="absolute inset-0 rounded-full bg-sunny"
          />
        </>
      )}
    </motion.span>
  );
}
