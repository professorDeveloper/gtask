"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import type { Report } from "@/lib/readiness/types";
import { scalePct } from "./GapLine";
import { useScrollStory } from "./useScrollStory";

const MIN = 800;
const MAX = 1600;
const TICKS = [800, 1000, 1200, 1400, 1600];

/**
 * Scroll story: the sample student's gap drawn segment by segment — where
 * they are, what their pace buys, and the stretch that is left over.
 */
export function GapStory({ sample }: { sample: Report }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress: p, reduce } = useScrollStory(ref, ["start start", "end end"]);

  const b = scalePct(sample.baseline, MIN, MAX);
  const pr = scalePct(sample.projected, MIN, MAX);
  const t = scalePct(sample.target, MIN, MAX);

  const baseW = useTransform(p, [0.04, 0.26], ["0%", `${b}%`]);
  const paceW = useTransform(p, [0.3, 0.5], ["0%", `${pr - b}%`]);
  const gapW = useTransform(p, [0.54, 0.74], ["0%", `${t - pr}%`]);
  const todayOpacity = useTransform(p, [0.14, 0.24], [0, 1]);
  /* before the plan the whole gap is missing; the pace eats into it as it draws */
  const short = useTransform(p, [0.3, 0.5], [sample.gap, sample.shortfall]);
  const shortText = useTransform(short, (v) => String(Math.round(v)));
  const fixOpacity = useTransform(p, [0.78, 0.9], [0, 1]);
  const fixY = useTransform(p, [0.78, 0.9], [16, 0]);

  const rows = [
    { at: [0.08, 0.24], swatch: "bg-brand/45", label: "Today", value: `${sample.baseline}`, note: "your last full practice test" },
    {
      at: [0.32, 0.48], swatch: "bg-progress", label: "On this pace", value: `${sample.projected}`,
      note: `${sample.weeks} weeks × ${sample.hoursPerWeek} h = ${sample.budgetHours} h of study`,
    },
    {
      at: [0.56, 0.72], swatch: "gap-stripes", label: "Left over", value: `${sample.shortfall} pts`,
      note: `the gap costs ${sample.requiredHours} h; the plan has ${sample.budgetHours} h`,
    },
  ] as const;

  return (
    <section aria-labelledby="gap-title" className="relative">
      <div ref={ref} className={reduce ? "" : "h-[300svh]"}>
        <div className={reduce ? "py-16" : "sticky top-16 flex h-[calc(100svh-4rem)] items-center"}>
          <div className="mx-auto w-full max-w-6xl px-5">
            <p className="text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">The gap, drawn</p>
            <h2 id="gap-title" className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display font-bold">
              <span className="numeral-lg text-gap-ink">
                <span className="mr-[-0.12em] inline-block">−</span>
                <motion.span className="tnum">{shortText}</motion.span>
                <span className="sr-only-text">{sample.shortfall}</span>
              </span>
              <span className="text-h2">points short.</span>
            </h2>
            <p className="mt-3 max-w-[52ch] text-body text-ink-2 sm:text-lede">
              The sample student: {sample.baseline} today, aiming for {sample.target}, {sample.weeks} weeks
              and {sample.hoursPerWeek} hours a week. Effort is not the problem. Arithmetic is.
            </p>

            <div className="mt-6 rounded-card border border-line bg-surface p-5 elev-2 sm:p-8" aria-hidden>
              <div className="relative h-14">
                <div className="well absolute inset-x-0 top-6 h-5 rounded-full" />
                <motion.div className="absolute top-6 left-0 h-5 rounded-l-full bg-brand/25" style={{ width: baseW }} />
                <motion.div className="absolute top-6 h-5 bg-progress" style={{ left: `${b}%`, width: paceW }} />
                <motion.div className="gap-stripes absolute top-6 h-5 rounded-r-full" style={{ left: `${pr}%`, width: gapW }} />
                <div className="absolute top-0 -translate-x-1/2" style={{ left: `${t}%` }}>
                  <span className="flex items-center gap-1 text-micro font-bold whitespace-nowrap">
                    <Icon name="flag" size={14} weight="fill" /> {sample.target}
                  </span>
                  <span className="mx-auto mt-0.5 block h-9 w-0.5 rounded-full bg-ink" />
                </div>
                <motion.div
                  className="absolute top-[18px] h-7 w-7 -translate-x-1/2 rounded-full border-4 border-brand bg-surface elev-1"
                  style={{ left: `${b}%`, opacity: todayOpacity }}
                />
              </div>
              <div className="relative mt-2 h-4 font-mono text-micro text-ink-3">
                {TICKS.map((tick) => (
                  <span key={tick} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${scalePct(tick, MIN, MAX)}%` }}>
                    {tick}
                  </span>
                ))}
              </div>

              <ul className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
                {rows.map((r) => (
                  <FactRow key={r.label} progress={p} at={r.at} swatch={r.swatch} label={r.label} value={r.value} note={r.note} />
                ))}
              </ul>
            </div>

            <motion.p
              className="mt-4 flex items-start gap-2 text-body font-semibold sm:items-center"
              style={{ opacity: fixOpacity, y: fixY }}
            >
              <Icon name="lightning" size={20} className="mt-0.5 shrink-0 text-brand sm:mt-0" />
              Close it with {sample.weeklyNeed} h a week, a later test date, or a lower target. Those are the only levers.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({
  progress, at, swatch, label, value, note,
}: {
  progress: MotionValue<number>; at: readonly [number, number]; swatch: string; label: string; value: string; note: string;
}) {
  const opacity = useTransform(progress, [...at], [0.3, 1]);
  return (
    <motion.li style={{ opacity }} className="flex items-center gap-3 rounded-control px-1 py-1 sm:block sm:px-0">
      <p className="flex w-28 shrink-0 items-center gap-2 text-caption text-ink-2 sm:w-auto">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${swatch}`} />
        {label}
      </p>
      <div className="min-w-0 sm:mt-1">
        <p className="tnum font-display text-title font-bold tracking-[-0.03em]">{value}</p>
        <p className="text-micro text-ink-3">{note}</p>
      </div>
    </motion.li>
  );
}
