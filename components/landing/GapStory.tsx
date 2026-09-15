"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import {
  Knob, Pin, Stem, Swatch, TickScale, gapGeometry, pinSpec, resolvePins, scalePct, useElementWidth, type SwatchKind,
} from "@/components/viz/GapScale";
import type { Report } from "@/lib/readiness/types";
import { useScrollStory } from "./useScrollStory";

const MIN = 800;
const MAX = 1600;
const TICKS = [800, 1000, 1200, 1400, 1600];
const G = gapGeometry("lg");

/**
 * Scroll story: the sample student's gap drawn layer by layer — where
 * they are, what their pace buys, and the stretch that is left over.
 * Same drawing as the gap bar everywhere else, driven by scroll.
 */
export function GapStory({ sample }: { sample: Report }) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(barRef);
  const { progress: p, reduce } = useScrollStory(ref, ["start start", "end end"]);

  const b = scalePct(sample.baseline, MIN, MAX);
  const pr = scalePct(sample.projected, MIN, MAX);
  const t = scalePct(sample.target, MIN, MAX);

  /* stacked layers from the left edge: each starts hidden under the one before it */
  const baseW = useTransform(p, [0.04, 0.26], ["0%", `${b}%`]);
  const paceW = useTransform(p, [0.29, 0.3, 0.5], ["0%", `${b}%`, `${pr}%`]);
  const gapW = useTransform(p, [0.53, 0.54, 0.74], ["0%", `${pr}%`, `${t}%`]);
  const todayOpacity = useTransform(p, [0.14, 0.24], [0, 1]);
  const paceOpacity = useTransform(p, [0.4, 0.5], [0, 1]);
  /* before the plan the whole gap is missing; the pace eats into it as it draws */
  const short = useTransform(p, [0.3, 0.5], [sample.gap, sample.shortfall]);
  const shortText = useTransform(short, (v) => String(Math.round(v)));
  const fixOpacity = useTransform(p, [0.78, 0.9], [0, 1]);
  const fixY = useTransform(p, [0.78, 0.9], [16, 0]);

  const specs = [
    pinSpec({ key: "today", tone: "today", value: sample.baseline, label: `${sample.baseline}` }),
    pinSpec({ key: "pace", tone: "pace", value: sample.projected, label: `${sample.projected}` }),
    pinSpec({ key: "target", tone: "target", value: sample.target, label: `${sample.target}`, icon: "flag" }),
  ];
  const anchors = specs.map((s) => ({ x: (scalePct(s.value, MIN, MAX) / 100) * width, w: s.w }));
  const { lefts, shown } = resolvePins([anchors[0], anchors[2], anchors[1]], width);
  /* resolvePins takes priority order (today, target, pace); map back to spec order */
  const place = [lefts[0], lefts[2], lefts[1]];
  const visible = [shown[0], shown[2], shown[1]];
  const pinOpacity = [todayOpacity, paceOpacity, undefined];

  const rows: { at: [number, number]; swatch: SwatchKind; label: string; value: string; tone?: string; note: string }[] = [
    { at: [0.08, 0.24], swatch: "today", label: "Today", value: `${sample.baseline}`, note: "your last full practice test" },
    {
      at: [0.32, 0.48], swatch: "pace", label: "On this pace", value: `${sample.projected}`,
      note: `${sample.weeks} weeks × ${sample.hoursPerWeek} h = ${sample.budgetHours} h of study`,
    },
    {
      at: [0.56, 0.72], swatch: "short", label: `Short of ${sample.target}`, value: `−${sample.shortfall}`, tone: "text-gap-ink",
      note: `the gap costs ${sample.requiredHours} h; the plan has ${sample.budgetHours} h`,
    },
  ];

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
              <div ref={barRef} className="relative select-none" style={{ height: G.height }}>
                <div className="well absolute inset-x-0 overflow-hidden rounded-full" style={{ top: G.trackTop, height: G.track }}>
                  <motion.div className="gapbar-short absolute inset-y-0 left-0 rounded-full" style={{ width: gapW }} />
                  <motion.div className="gapbar-pace absolute inset-y-0 left-0 rounded-full" style={{ width: paceW }} />
                  <motion.div className="gapbar-today absolute inset-y-0 left-0 rounded-full" style={{ width: baseW }} />
                </div>
                <Stem tone="target" pct={t} top={G.lane} height={G.trackTop - G.lane + G.track + 5} strong />
                {specs.map((s, i) => (
                  <span key={s.key}>
                    {s.key !== "target" && (
                      <Stem
                        tone={s.tone} pct={scalePct(s.value, MIN, MAX)} top={G.lane} height={G.trackTop - G.lane}
                        opacity={visible[i] ? pinOpacity[i] : undefined} visible={visible[i]}
                      />
                    )}
                    <Pin
                      spec={s}
                      pct={scalePct(s.value, MIN, MAX)}
                      offset={place[i] - anchors[i].x}
                      width={width}
                      opacity={visible[i] ? pinOpacity[i] : undefined}
                      visible={visible[i]}
                      transition={{ duration: 0 }}
                    />
                  </span>
                ))}
                <Knob pct={b} top={G.trackTop + G.track / 2 - G.knob / 2} size={G.knob} opacity={todayOpacity} />
              </div>
              <TickScale ticks={TICKS} min={MIN} max={MAX} />

              <ul className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
                {rows.map((r) => (
                  <FactRow key={r.label} progress={p} {...r} />
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
  progress, at, swatch, label, value, tone = "text-ink", note,
}: {
  progress: MotionValue<number>; at: [number, number]; swatch: SwatchKind; label: string; value: string; tone?: string; note: string;
}) {
  const opacity = useTransform(progress, at, [0.3, 1]);
  return (
    <motion.li style={{ opacity }} className="flex items-center gap-3 rounded-control px-1 py-1 sm:block sm:px-0">
      <p className="flex w-28 shrink-0 items-center gap-2 text-caption text-ink-2 sm:w-auto">
        <Swatch kind={swatch} />
        {label}
      </p>
      <div className="min-w-0 sm:mt-1">
        <p className={`tnum font-display text-title font-bold tracking-[-0.03em] ${tone}`}>{value}</p>
        <p className="text-micro text-ink-3">{note}</p>
      </div>
    </motion.li>
  );
}
