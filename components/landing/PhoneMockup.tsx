"use client";

import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { SPRING, usePrefersReducedMotion } from "@/components/ui/motion";
import { QUESTIONS } from "@/lib/readiness/questions";
import type { Answers, Report } from "@/lib/readiness/types";

const LETTERS = "ABCDE";

/**
 * A drawn phone showing the check at step `step` (0–4), or the report at 5.
 * Purely illustrative: it is aria-hidden and nothing inside is tappable.
 */
export function PhoneMockup({ step, answers, sample }: { step: number; answers: Answers; sample: Report }) {
  return (
    <div className="phone relative mx-auto shrink-0 rounded-[44px] bg-ink p-2 elev-4" aria-hidden>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-paper">
        <div className="absolute top-2 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
        <div className="flex items-center justify-between px-6 pt-2.5 text-micro font-semibold text-ink">
          <span className="tnum">9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3.5 rounded-[3px] bg-ink" />
          </span>
        </div>

        <div className="flex items-center justify-between px-4 pt-4">
          <LogoMark size={22} />
          <span className="tnum rounded-full bg-surface px-2.5 py-0.5 text-micro font-semibold text-ink-2 elev-1">
            {step < 5 ? `Q${step + 1}/5` : "Report"}
          </span>
        </div>

        <Rail step={step} />

        <div className="relative flex-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              className="absolute inset-0 px-4 pt-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={SPRING.soft}
            >
              {step < 5 ? <QuestionScreen index={step} picked={answers[step]} /> : <ReportScreen sample={sample} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-4 pb-5">
          <span
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full text-caption font-bold transition-colors duration-300 ${
              step < 5 ? "bg-brand text-brand-ink" : "bg-sunny text-ink"
            }`}
          >
            {step < 4 ? "Next question" : step === 4 ? "See my report" : "Share my card"}
            <Icon name={step < 5 ? "arrowRight" : "share"} size={16} weight="bold" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Rail({ step }: { step: number }) {
  return (
    <div className="mt-3 flex gap-1 px-4">
      {QUESTIONS.map((q, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <span key={q.id} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <motion.span
              className={`absolute inset-0 origin-left rounded-full ${step >= 5 ? "bg-ready" : "bg-brand"}`}
              initial={false}
              animate={{ scaleX: done || step >= 5 ? 1 : current ? 0.12 : 0 }}
              transition={SPRING.pop}
            />
            {done && i === step - 1 && (
              <motion.span
                className="absolute inset-0 rounded-full bg-sunny"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function QuestionScreen({ index, picked }: { index: number; picked: string }) {
  const q = QUESTIONS[index];
  /* the tap ripple is pure decoration; a frozen one reads as a smudge */
  const reduce = usePrefersReducedMotion();
  /* five options must still clear the pinned Next button on a small phone */
  const dense = q.options.length > 4;
  return (
    <div>
      <p className="text-micro font-semibold tracking-[0.08em] text-brand uppercase">{q.label}</p>
      <p className="mt-1.5 font-display text-title leading-tight font-bold tracking-[-0.02em] text-balance">{q.prompt}</p>
      <ul className={`flex flex-col gap-1.5 ${dense ? "mt-3" : "mt-3.5"}`}>
        {q.options.map((o, i) => {
          const isPick = o.id === picked;
          return (
            <li key={o.id} className={`relative flex items-center ${dense ? "min-h-9 lg:min-h-10" : "min-h-10"} gap-2.5 rounded-control border border-line bg-surface px-2.5 text-caption font-semibold`}>
              {isPick && (
                <motion.span
                  className="absolute -inset-px rounded-control border-2 border-brand bg-brand-soft"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING.pop, delay: 0.45 }}
                />
              )}
              <span
                className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-md text-micro font-bold ${
                  isPick ? "bg-brand text-brand-ink" : "bg-well text-ink-2"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="relative line-clamp-2 min-w-0 flex-1 py-1 leading-tight">{o.label}</span>
              {isPick && (
                <motion.span
                  className="relative text-brand"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...SPRING.pop, delay: 0.6 }}
                >
                  <Icon name="checkCircle" size={18} weight="fill" />
                </motion.span>
              )}
              {isPick && !reduce && (
                <motion.span
                  className="pointer-events-none absolute top-1/2 right-10 h-8 w-8 -translate-y-1/2 rounded-full bg-sunny/70"
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReportScreen({ sample }: { sample: Report }) {
  const rows = [
    { icon: "calendarDots", label: "Mon–Sun study plan" },
    { icon: "timer", label: "Session & focus stats" },
    { icon: "sparkle", label: "3 optional questions" },
  ] as const;
  return (
    <div>
      <div className="mesh-strong grain rounded-card p-4 elev-2">
        <p className="text-micro font-semibold tracking-[0.08em] text-white/80 uppercase">Readiness</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <motion.p
            className="tnum font-display leading-none font-bold tracking-[-0.05em]"
            style={{ fontSize: 56 }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING.pop, delay: 0.2 }}
          >
            {sample.readiness}
          </motion.p>
          <span className="mb-1 rounded-full bg-white/15 px-2.5 py-0.5 text-micro font-bold">{sample.band.name}</span>
        </div>
        <p className="mt-2 font-display text-body font-bold">{sample.archetype}</p>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <motion.li
            key={r.label}
            className="flex min-h-10 items-center gap-2.5 rounded-control border border-line bg-surface px-3 text-caption font-semibold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.soft, delay: 0.35 + i * 0.08 }}
          >
            <Icon name={r.icon} size={18} className="text-brand" />
            {r.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
