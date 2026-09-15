"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { SPRING, TAP_SCALE, usePrefersReducedMotion } from "@/components/ui/motion";
import { BLOCK_LABELS, summarizePlan, weeklyPlan, type BlockKind } from "@/lib/readiness/calendar";
import type { Refinements, Report } from "@/lib/readiness/types";
import { formatMinutes, KIND_FILL, shortMinutes } from "./palette";

const BAR_HEIGHT = 104;
const noop = () => () => {};
/** Monday = 0. -1 on the server so the first render never guesses a weekday. */
const todayIndex = () => (new Date().getDay() + 6) % 7;

/**
 * A typical week of the plan as a Mon–Sun strip. Each day is a stacked
 * column (minutes by kind), today is marked, and tapping a day opens its
 * sessions below.
 */
export function WeekCalendar({ report, refinements }: { report: Report; refinements: Refinements }) {
  const plan = useMemo(() => weeklyPlan(report, refinements), [report, refinements]);
  const summary = summarizePlan(plan);
  const today = useSyncExternalStore(noop, todayIndex, () => -1);
  const [picked, setPicked] = useState<number | null>(null);
  const fallback = today >= 0 && !plan[today].rest ? today : plan.findIndex((d) => !d.rest);
  const selected = picked ?? fallback;
  const day = plan[selected];

  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const on = reduce || inView;
  const maxDay = Math.max(...plan.map((d) => d.totalMinutes), 60);
  const kinds = (Object.keys(summary.byKind) as BlockKind[]).filter((k) => k !== "rest" && summary.byKind[k] > 0);

  return (
    <div ref={ref} className="rounded-card border border-line bg-surface elev-2">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-caption font-semibold text-brand">
          <Icon name="clock" size={15} />
          <span><span className="tnum">{formatMinutes(summary.totalMinutes)}</span> a week</span>
        </span>
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-caption font-semibold text-ink-2">
          <Icon name="fire" size={15} className="text-progress-ink" />
          {summary.studyDays} study days
        </span>
      </div>

      <div
        className="mt-4 grid grid-cols-7 gap-1 px-2.5 sm:gap-2 sm:px-5"
        role="group"
        aria-label="Pick a day to see its sessions"
      >
        {plan.map((d, i) => {
          const isSel = i === selected;
          const isToday = i === today;
          return (
            <motion.button
              key={d.day}
              type="button"
              aria-pressed={isSel}
              aria-label={`${d.label}${isToday ? " (today)" : ""}: ${d.rest ? "rest" : formatMinutes(d.totalMinutes)}`}
              onClick={() => setPicked(i)}
              whileTap={{ scale: TAP_SCALE }}
              transition={SPRING.tap}
              className={`relative flex min-w-0 flex-col items-center rounded-control px-0.5 pt-2 pb-2 transition-colors ${
                isSel ? "bg-brand-soft ring-2 ring-brand" : "hover:bg-surface-2"
              }`}
            >
              <span className={`text-micro font-bold ${isSel ? "text-brand" : "text-ink-2"}`}>{d.short}</span>
              <span className="flex h-4 items-center">
                {isToday && <span className="h-1.5 w-1.5 rounded-full bg-progress" aria-hidden />}
              </span>
              <span
                className="well relative flex w-full max-w-9 flex-col-reverse gap-0.5 overflow-hidden rounded-[10px] p-0.5"
                style={{ height: BAR_HEIGHT }}
                aria-hidden
              >
                {d.rest ? (
                  <span className="grid flex-1 place-items-center text-ink-3">
                    <Icon name="coffee" size={18} />
                  </span>
                ) : (
                  d.blocks.map((b, j) => (
                    <motion.span
                      key={j}
                      className={`w-full shrink-0 origin-bottom rounded-[7px] ${KIND_FILL[b.kind]}`}
                      style={{ height: Math.max(6, ((BAR_HEIGHT - 4) * b.minutes) / maxDay - 2) }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={on ? { scaleY: 1, opacity: 1 } : undefined}
                      transition={{ ...SPRING.pop, delay: 0.08 * i + 0.06 * j }}
                    />
                  ))
                )}
              </span>
              <span className={`tnum mt-1.5 font-mono text-[11px] leading-4 font-semibold ${d.rest ? "text-ink-3" : "text-ink"}`}>
                {d.rest ? "off" : shortMinutes(d.totalMinutes)}
              </span>
            </motion.button>
          );
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 px-4 text-micro text-ink-2 sm:px-6">
        {kinds.map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${KIND_FILL[k]}`} />
            {BLOCK_LABELS[k]}
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-line px-4 py-4 sm:px-6" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${day.day}-${day.totalMinutes}-${day.blocks.length}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-title font-bold">
                {day.label}
                {selected === today && <span className="ml-2 align-middle text-micro font-semibold text-progress-ink">Today</span>}
              </h3>
              <span className="tnum font-mono text-caption font-semibold text-ink-2">
                {day.rest ? "Rest day" : formatMinutes(day.totalMinutes)}
              </span>
            </div>
            {day.rest ? (
              <p className="mt-2 flex items-center gap-2 text-body text-ink-2">
                <Icon name="coffee" size={18} className="text-ink-3" />
                Nothing scheduled. Rest is part of the plan.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {day.blocks.map((b, j) => (
                  <li key={j} className="flex items-center gap-3 rounded-control bg-surface-2/70 px-3 py-2.5">
                    <span className={`h-8 w-1.5 shrink-0 rounded-full ${KIND_FILL[b.kind]}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body leading-tight font-semibold text-ink">{BLOCK_LABELS[b.kind]}</span>
                      {b.topic && <span className="block truncate text-caption text-ink-3">{b.topic}</span>}
                    </span>
                    <span className="tnum shrink-0 font-mono text-caption font-semibold text-ink">{formatMinutes(b.minutes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
