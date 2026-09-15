"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SPRING } from "@/components/ui/motion";

const STEPS = ["Reading your 5 answers", "Running the readiness rules", "Saving your report"];
/** Ring fill per stage; the last stretch waits for the server. */
const STAGE_FILL = [0.3, 0.62, 0.86];
export const STAGE_MS = 480;
const SLOW_MS = 8000;

/**
 * The bridge between the last answer and the result: answer chips tick in,
 * three short steps run, and a ring fills to 100% when the report is saved.
 */
export function ScoringScreen({
  labels,
  done,
  onRetry,
}: {
  /** Chosen option labels, in question order. */
  labels: string[];
  done: boolean;
  onRetry: () => void;
}) {
  const [stage, setStage] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), STAGE_MS),
      window.setTimeout(() => setStage(2), STAGE_MS * 2),
      window.setTimeout(() => setSlow(true), SLOW_MS),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const fill = done ? 1 : STAGE_FILL[stage];

  return (
    <div role="status" className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-10 pb-16 text-center sm:pt-20">
      <div className="relative grid size-28 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={done ? "var(--ready)" : "var(--brand)"}
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0.04 }}
            animate={{ pathLength: fill }}
            transition={SPRING.gentle}
          />
        </svg>
        <motion.span
          key={done ? "done" : "busy"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.pop}
          className={`grid size-16 place-items-center rounded-full ${done ? "bg-ready-soft text-ready-ink" : "bg-brand-soft text-brand"}`}
        >
          <Icon name={done ? "sealCheck" : "gauge"} size={32} />
        </motion.span>
      </div>

      <h1 className="mt-7 font-display text-h2 font-bold text-balance text-ink">
        {done ? "Your report is ready" : "Scoring your check"}
      </h1>
      <p className="mt-2 text-body text-ink-3">Same answers, same result. No AI, just rules.</p>

      <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Your answers">
        {labels.map((label, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.pop, delay: 0.1 + i * 0.07 }}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface pr-3 pl-2 text-caption font-semibold text-ink-2 elev-1"
          >
            <Icon name="checkCircle" size={16} weight="fill" className="text-ready-ink" />
            {label}
          </motion.li>
        ))}
      </ul>

      <ol className="mt-8 w-full max-w-xs space-y-1 text-left">
        {STEPS.map((step, i) => {
          const state = done || stage > i ? "done" : stage === i ? "active" : "pending";
          return (
            <li key={step} className="flex min-h-10 items-center gap-3">
              <StepMark state={state} />
              <span className={`text-body ${state === "pending" ? "text-ink-3" : "font-semibold text-ink"}`}>{step}</span>
            </li>
          );
        })}
      </ol>

      {slow && !done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING.soft}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <p className="text-caption text-ink-2">Still saving — this is taking longer than usual.</p>
          <Button variant="outline" size="sm" icon="refresh" iconPosition="start" onClick={onRetry}>
            Try again
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function StepMark({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done")
    return (
      <motion.span
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={SPRING.pop}
        className="grid size-6 shrink-0 place-items-center rounded-full bg-ready text-ink"
      >
        <Icon name="check" size={14} weight="bold" />
      </motion.span>
    );
  if (state === "active")
    return (
      <span className="grid size-6 shrink-0 place-items-center">
        <span className="check-spinner anim-spin size-5 rounded-full" />
      </span>
    );
  return (
    <span className="grid size-6 shrink-0 place-items-center">
      <span className="size-2.5 rounded-full bg-line-strong" />
    </span>
  );
}

/** Saving failed: say so plainly and keep both ways forward one tap away. */
export function SaveError({ onRetry, onReview }: { onRetry: () => void; onReview: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-10 pb-16 text-center sm:pt-20">
      <motion.span
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={SPRING.pop}
        className="grid size-20 place-items-center rounded-full bg-gap-soft text-gap-ink"
      >
        <Icon name="warning" size={36} />
      </motion.span>
      <div role="alert">
        <h1 className="mt-6 font-display text-h2 font-bold text-balance text-ink">We couldn’t save your answers</h1>
        <p className="mt-3 text-body text-ink-2">
          Check your connection and try again. Your answers are still here on this device.
        </p>
      </div>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row-reverse">
        <Button size="lg" icon="refresh" iconPosition="start" onClick={onRetry}>
          Try again
        </Button>
        <Button size="lg" variant="ghost" icon="arrowLeft" iconPosition="start" onClick={onReview}>
          Review answers
        </Button>
      </div>
    </div>
  );
}
