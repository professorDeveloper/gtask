"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CountUp } from "@/components/ui/CountUp";
import { usePrefersReducedMotion } from "@/components/ui/motion";
import { GapScale } from "@/components/viz/GapScale";
import type { Report } from "@/lib/readiness/types";
import { KIND_FILL } from "./palette";

/** Where the pace lands, the three numbers behind it, and the study split. */
export function GapCard({ report }: { report: Report }) {
  const surplus = Math.max(0, report.baseline - report.target);
  const met = report.shortfall === 0;
  const earned = Math.max(0, report.projected - report.baseline);
  const extra = Math.max(0, report.weeklyNeed - report.hoursPerWeek);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-line bg-surface p-5 elev-2 sm:p-6">
        <GapScale
          baseline={report.baseline}
          projected={report.projected}
          target={report.target}
          assumed={!report.measured}
        />
        <p className="mt-5 border-t border-line pt-4 text-body text-pretty text-ink-2">
          {surplus > 0 ? (
            <>
              <span className="mr-1.5 inline-flex min-h-6 items-center rounded-full bg-ready-soft px-2 align-[1px] text-micro font-bold text-ready-ink">
                Target met +{surplus}
              </span>
              You are already past {report.target}. About {report.weeklyNeed} hours a week of timed practice keeps the
              number steady until test day.
            </>
          ) : met ? (
            <>
              <span className="mr-1.5 inline-flex min-h-6 items-center rounded-full bg-ready-soft px-2 align-[1px] text-micro font-bold text-ready-ink">
                On track
              </span>
              {report.hoursPerWeek} hours a week for {report.weeks} weeks covers the {report.gap}-point gap. The work
              now is keeping the habit intact.
            </>
          ) : (
            <>
              At <b className="font-semibold text-ink">{report.hoursPerWeek} h a week</b> for{" "}
              <b className="font-semibold text-ink">{report.weeks} weeks</b> your pace adds about {earned} points and lands
              near <b className="font-semibold text-ink">{report.projected}</b> —{" "}
              <b className="font-semibold text-gap-ink">{report.shortfall} short</b> of {report.target}.
            </>
          )}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          value={surplus > 0 ? surplus : report.gap}
          prefix={surplus > 0 ? "+" : ""}
          label={surplus > 0 ? "points above target" : "points to climb"}
          tone={surplus > 0 ? "text-ready-ink" : "text-ink"}
        />
        <Stat value={report.requiredHours} suffix="h" label={report.gap === 0 ? "hours to hold it" : "hours the gap costs"} />
        <Stat
          value={report.weeklyNeed}
          suffix="h"
          label="needed a week"
          tone={extra > 0 ? "text-gap-ink" : "text-ready-ink"}
          chip={extra > 0 ? `you: ${report.hoursPerWeek}h` : "you have it"}
          chipTone={extra > 0 ? "bg-gap-soft text-gap-ink" : "bg-ready-soft text-ready-ink"}
        />
      </dl>

      <StudySplit report={report} />
    </div>
  );
}

function Stat({
  value, label, prefix = "", suffix = "", tone = "text-ink", chip, chipTone,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  tone?: string;
  chip?: string;
  chipTone?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-surface p-3.5 elev-1 sm:p-4">
      <dd className={`order-1 font-display text-[28px] leading-none font-bold tracking-[-0.045em] sm:text-[32px] ${tone}`}>
        <CountUp value={value} format={(n) => `${prefix}${Math.round(n)}${suffix}`} startOnView duration={1} />
      </dd>
      <dt className="order-2 mt-2 text-caption leading-snug text-ink-3">{label}</dt>
      {chip && (
        <span className={`order-3 mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-micro font-semibold ${chipTone}`}>
          {chip}
        </span>
      )}
    </div>
  );
}

function StudySplit({ report }: { report: Report }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const on = reduce || inView;
  const parts = [
    { key: "rw" as const, label: "Reading & Writing", pct: report.focus.rw },
    { key: "math" as const, label: "Math", pct: report.focus.math },
  ].sort((a, b) => b.pct - a.pct);

  return (
    <div ref={ref} className="rounded-card border border-line bg-surface p-5 elev-1 sm:p-6">
      <h3 className="font-display text-title font-bold">Study split</h3>
      <p className="mt-0.5 text-caption text-ink-3">{report.focus.label}</p>
      <div
        className="well mt-4 flex h-3.5 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${p.pct}%`).join(", ")}
      >
        {parts.map((p, i) => (
          <motion.span
            key={p.key}
            className={`h-full origin-left ${KIND_FILL[p.key]}`}
            style={{ width: `${p.pct}%` }}
            initial={{ scaleX: 0 }}
            animate={on ? { scaleX: 1 } : undefined}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-caption text-ink-2">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${KIND_FILL[p.key]}`} />
            {p.label} <b className="tnum font-mono font-semibold text-ink">{p.pct}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
