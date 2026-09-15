"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/components/ui/motion";

const MIN = 400;
const MAX = 1600;
const pct = (score: number) => ((Math.min(MAX, Math.max(MIN, score)) - MIN) / (MAX - MIN)) * 100;
/** A segment that exists is never shorter than this, so it peeks past the 24px today marker. */
const PEEK_PX = 18;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The product's signature chart: one SAT scale, three marks.
 * Today, where the current pace lands, and the target. Between pace and
 * target is the shortfall; when today already clears the target, the stretch
 * past it is drawn as a green surplus instead. Draws once when scrolled into view.
 */
export function GapScale({
  baseline, projected, target, assumed = false,
}: {
  baseline: number;
  projected: number;
  target: number;
  assumed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const on = reduce || inView;

  const surplus = baseline >= target;
  const pace = surplus ? baseline : Math.max(projected, baseline);
  const b = pct(baseline);
  const t = pct(target);
  /* Segments that exist get a minimum width in px, so a small pace step or surplus
     still peeks out from under the 24px today marker without shifting the scale. */
  const paceReal = surplus ? 0 : Math.max(0, pct(pace) - b);
  const paceW = paceReal > 0 ? `max(${paceReal}%, ${PEEK_PX}px)` : "0px";
  const paceEnd = `calc(${b}% + ${paceW})`;
  const shortW = surplus || t <= pct(pace) ? null : `max(0px, calc(${t}% - ${paceEnd}))`;
  const surplusW = surplus && b > t ? `max(${b - t}%, ${PEEK_PX}px)` : null;
  const markerAt = surplus ? (surplusW ? `calc(${t}% + ${surplusW})` : `${t}%`) : `${b}%`;

  const grow = (delay: number) => ({
    initial: { scaleX: 0 },
    animate: on ? { scaleX: 1 } : undefined,
    transition: reduce ? { duration: 0 } : { duration: 0.9, delay, ease: EASE },
  });

  const summary = surplus
    ? `Today ${baseline}${assumed ? " (estimated)" : ""}, already ${baseline - target} above the target of ${target}.`
    : `Today ${baseline}${assumed ? " (estimated)" : ""}. On this pace ${pace}. Target ${target}${
        target > pace ? `, ${target - pace} short` : ""
      }.`;

  return (
    <div ref={ref} className="select-none">
      <div className="relative h-[76px]" role="img" aria-label={summary}>
        {/* target flag, labelled above the track */}
        <motion.div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${t}%` }}
          initial={{ opacity: 0, y: -6 }}
          animate={on ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
        >
          <span className="tnum rounded-full bg-ink px-2 py-0.5 font-mono text-micro font-semibold whitespace-nowrap text-surface">
            {target}
          </span>
          <span className="h-[34px] w-0.5 rounded-full bg-ink" />
        </motion.div>

        {/* track */}
        <div className="well absolute inset-x-0 top-[38px] h-4 overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-y-0 left-0 origin-left bg-brand/25"
            style={{ width: `${b}%` }}
            {...grow(0)}
          />
          {paceReal > 0 && (
            <motion.div
              className="absolute inset-y-0 origin-left bg-progress"
              style={{ left: `${b}%`, width: paceW }}
              {...grow(0.45)}
            />
          )}
          {shortW && (
            <motion.div
              className="gapscale-short absolute inset-y-0 origin-left"
              style={{ left: paceEnd, width: shortW }}
              {...grow(0.8)}
            />
          )}
          {surplusW && (
            <motion.div
              className="absolute inset-y-0 origin-left bg-ready"
              style={{ left: `${t}%`, width: surplusW }}
              {...grow(0.7)}
            />
          )}
        </div>

        {/* today marker */}
        <motion.div
          className="absolute top-[34px] -translate-x-1/2"
          style={{ left: markerAt }}
          initial={{ scale: 0 }}
          animate={on ? { scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.3 }}
        >
          <div className={`h-6 w-6 rounded-full border-[3px] bg-surface elev-1 ${surplus ? "border-ready" : "border-brand"}`} />
        </motion.div>
      </div>

      <div className="flex justify-between font-mono text-micro text-ink-3" aria-hidden>
        <span>400</span><span>1000</span><span>1600</span>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        <Legend swatch="bg-brand/25 ring-2 ring-brand ring-inset" label={assumed ? "Today (est.)" : "Today"} value={baseline} />
        {surplus ? (
          <Legend swatch="bg-ready" label="Above target" value={`+${baseline - target}`} tone="text-ready-ink" />
        ) : (
          <Legend swatch="bg-progress" label="On this pace" value={pace} />
        )}
        <Legend swatch="bg-ink" label="Target" value={target} />
      </dl>
    </div>
  );
}

function Legend({
  swatch, label, value, tone = "text-ink",
}: { swatch: string; label: string; value: number | string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-caption text-ink-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${swatch}`} />
        <span className="truncate">{label}</span>
      </dt>
      <dd className={`tnum mt-1 font-display text-title font-bold tracking-[-0.03em] ${tone}`}>{value}</dd>
    </div>
  );
}
