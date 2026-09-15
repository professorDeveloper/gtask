"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { evaluate, FOCUS_ADJUSTMENT, NEUTRAL_MODIFIERS } from "@/lib/readiness/engine";
import { QUESTIONS } from "@/lib/readiness/questions";
import type { Answers, Report, ScoreComponent } from "@/lib/readiness/types";
import { Segmented } from "@/components/ui/Segmented";
import { StepSlider } from "@/components/ui/StepSlider";
import { Badge, Card } from "@/components/ui/Surface";
import { SPRING } from "@/components/ui/motion";
import { GapLine } from "./GapLine";
import { SpringNumber } from "./SpringNumber";

const SHORT: Record<string, string> = {
  t_4w: "< 4 weeks", t_2m: "1–2 months", t_6m: "3–6 months", t_none: "Not booked",
  b_none: "Not measured", b_low: "< 1000", b_mid: "1000–1190", b_high: "1200–1340", b_top: "1350+",
  h_low: "< 2 h", h_mid: "2–5 h", h_high: "6–10 h", h_max: "10 h +",
  f_rw: "Reading & Writing", f_math: "Math", f_both: "Both", f_pace: "Pacing",
  g_1200: "1200+", g_1300: "1300+", g_1400: "1400+", g_1500: "1500+",
};

/** Question indexes whose options are ordered: timeline, hours, target. Baseline opens with "Not measured". */
const ORDERED = new Set([0, 2, 4]);

const BAR: Record<string, string> = { proximity: "bg-brand", capacity: "bg-progress", habit: "bg-ready" };

/** The scoring engine itself, wired to controls. Change an input, watch the score move. */
export function MethodLab() {
  const [answers, setAnswers] = useState<Answers>(["t_6m", "b_mid", "h_high", "f_math", "g_1400"]);
  const report = useMemo(() => evaluate(answers), [answers]);

  const set = (i: number) => (id: string) =>
    setAnswers((prev) => prev.map((a, j) => (j === i ? id : a)) as Answers);

  return (
    <Card elevation={2}>
      <div className="grid lg:grid-cols-[1fr_0.95fr]">
        <div className="lg:border-r lg:border-line">
          {/* phones: the score stays in sight while the controls scroll under it,
              and lets go when the full result below takes over */}
          <div className="sticky top-16 z-10 rounded-t-card border-b border-line bg-surface/[0.97] px-4 py-3 lg:hidden">
            <CompactResult report={report} />
          </div>

          <div className="flex flex-col gap-5 p-5 sm:p-7">
            {QUESTIONS.map((q, i) => {
              const options = q.options.map((o) => ({ id: o.id, label: SHORT[o.id] ?? o.label }));
              /* ordered answers slide; the weak point is a category, so it stays a choice */
              return !ORDERED.has(i) ? (
                <Segmented key={q.id} label={q.label} value={answers[i]} options={options} onChange={set(i)} />
              ) : (
                <StepSlider key={q.id} label={q.label} value={answers[i]} options={options} onChange={set(i)} />
              );
            })}
          </div>
        </div>

        <div className="well rounded-b-card p-5 sm:p-7 lg:rounded-r-card lg:rounded-bl-none">
          <div className="lg:sticky lg:top-24">
            <FullResult report={report} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function BandBadge({ report }: { report: Report }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={report.band.key}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={SPRING.pop}
        className="inline-flex"
      >
        <Badge tone={report.band.tone}>{report.band.name}</Badge>
      </motion.span>
    </AnimatePresence>
  );
}

function CompactResult({ report }: { report: Report }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <p className="text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">Score</p>
        <SpringNumber value={report.readiness} className="block font-display text-h2 leading-none font-bold" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-end">
          <BandBadge report={report} />
        </div>
        <GapLine
          className="mt-1.5"
          legend={false}
          baseline={report.baseline}
          projected={report.projected}
          target={report.target}
          assumed={!report.measured}
        />
      </div>
    </div>
  );
}

function FullResult({ report }: { report: Report }) {
  return (
    <div aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">Readiness</p>
          <SpringNumber value={report.readiness} className="numeral-lg block font-display font-bold tracking-[-0.055em]" />
        </div>
        <BandBadge report={report} />
      </div>

      <GapLine
        className="mt-5"
        baseline={report.baseline}
        projected={report.projected}
        target={report.target}
        assumed={!report.measured}
      />

      <ul className="mt-6 flex flex-col gap-4">
        {report.components.map((c) => (
          <li key={c.key}>
            <div className="flex items-baseline justify-between gap-3 text-caption">
              <span className="font-semibold">{c.label}</span>
              <span className="tnum shrink-0 font-mono text-ink-2">
                {c.points} / {c.weight}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
              <motion.div
                className={`h-full rounded-full ${BAR[c.key]}`}
                initial={false}
                animate={{ width: `${Math.min(100, c.value * 100)}%` }}
                transition={SPRING.soft}
              />
            </div>
            <p className="mt-1 text-micro text-ink-3">{prose(c, report)}</p>
          </li>
        ))}
      </ul>

      <Formula report={report} />
    </div>
  );
}

/** The explain line in words, not expressions. */
function prose(c: ScoreComponent, r: Report): string {
  if (c.key === "proximity") return r.gap === 0 ? "Already at the target score" : `${r.gap} of 400 points still to climb`;
  if (c.key === "capacity") return `${r.budgetHours} h available for ${r.requiredHours} h of work`;
  return `${r.hoursPerWeek} h a week, counted up to 10`;
}

/** The whole sum, including the adjustments, so the numbers on screen add up. */
function Formula({ report }: { report: Report }) {
  const adjust = FOCUS_ADJUSTMENT[report.focus.section];
  const discount = NEUTRAL_MODIFIERS.unmeasuredDiscount;
  /* rule points as shown on the bars above, so the sum is checkable by eye */
  const points = report.components.map((c) => c.points);
  const terms = points.join(" + ");
  const sum = adjust ? `${terms} ${adjust > 0 ? "+" : "−"} ${Math.abs(adjust)}` : terms;
  const expr = report.measured ? sum : `(${sum}) × ${discount}`;
  const exact = points.reduce((a, b) => a + b, 0) + adjust;
  const equals = (report.measured ? exact : exact * discount) === report.readiness ? "=" : "≈";
  return (
    <div className="mt-6 border-t border-line pt-4">
      <p className="tnum font-mono text-caption leading-relaxed text-ink-2">
        {expr} {equals} <b className="text-ink">{report.readiness}</b>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {adjust < 0 && <Badge tone="gap">Weak in both sections −{Math.abs(adjust)}</Badge>}
        {adjust > 0 && <Badge tone="brand">Pacing only +{adjust}</Badge>}
        {!report.measured && <Badge tone="progress">No test yet ×{discount}</Badge>}
      </div>
    </div>
  );
}
