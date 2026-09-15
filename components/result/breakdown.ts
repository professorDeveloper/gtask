import { PRACTICE, STRESS } from "@/lib/readiness/refine";
import { FOCUS_ADJUSTMENT } from "@/lib/readiness/engine";
import { sectionOf } from "@/lib/readiness/calendar";
import type { Refinements, Report } from "@/lib/readiness/types";

/**
 * The readiness arithmetic, restated line by line for the Transparency
 * section. It mirrors the engine's formula so every term the student sees is
 * a term that was actually added; the final line is always the report's own
 * score, so a rounding edge can never show a different number.
 */

export type BreakdownRow = {
  key: string;
  label: string;
  /** Plain-English reason for the value. */
  why: string;
  weight: number;
  /** 0–1 share of the weight earned. */
  value: number;
  points: number;
};

export type Adjustment = { label: string; points: number };

export type Breakdown = {
  rows: BreakdownRow[];
  adjustments: Adjustment[];
  subtotal: number;
  /** Multiplier applied when the baseline is an estimate; null when measured. */
  discount: { factor: number; why: string } | null;
  /** Set when the result was clamped to the 3–99 range. */
  clamped: "floor" | "cap" | null;
  readiness: number;
};

const WHY: Record<string, (r: Report) => string> = {
  proximity: (r) =>
    r.gap === 0
      ? "You are already at or above the target."
      : r.gap >= 400
        ? `A ${r.gap}-point gap is wider than the 400-point window, so this scores nothing yet.`
        : `A ${r.gap}-point gap, out of a 400-point window.`,
  capacity: (r) =>
    `${r.budgetHours} hours available before test day, against ${r.requiredHours} hours the gap costs.`,
  habit: (r) => `${r.hoursPerWeek} hours a week, against a 10-hour benchmark.`,
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function breakdownFor(report: Report, refinements: Refinements): Breakdown {
  const rows: BreakdownRow[] = report.components.map((c) => ({
    key: c.key,
    label: c.label,
    why: WHY[c.key]?.(report) ?? c.explain,
    weight: c.weight,
    value: c.value,
    points: round1(c.weight * c.value),
  }));

  const adjustments: Adjustment[] = [];
  const section = sectionOf(report);
  if (section === "both") adjustments.push({ label: "Two weak sections to split time across", points: FOCUS_ADJUSTMENT.both });
  if (section === "pace") adjustments.push({ label: "Content is solid, pace is the issue", points: FOCUS_ADJUSTMENT.pace });
  if (refinements.stress) {
    const delta = STRESS[refinements.stress].pacingDelta;
    if (delta !== 0)
      adjustments.push({
        label: delta > 0 ? "You finish sections with time to spare" : "You run out of time on most sections",
        points: delta,
      });
  }
  if (report.measured && refinements.practice && PRACTICE[refinements.practice].bonus > 0)
    adjustments.push({ label: "Several full tests behind your baseline", points: PRACTICE[refinements.practice].bonus });

  const subtotal = round1(rows.reduce((n, r) => n + r.weight * r.value, 0) + adjustments.reduce((n, a) => n + a.points, 0));

  const factor = report.measured ? null : refinements.practice ? PRACTICE[refinements.practice].discount : 0.9;
  const discount = factor === null
    ? null
    : {
        factor,
        why: refinements.practice && refinements.practice !== "p_0"
          ? "Estimated baseline, softened by the practice tests you have taken"
          : "Your baseline is an estimate, not a measured score",
      };

  const raw = Math.round(discount ? subtotal * discount.factor : subtotal);
  const clamped = raw < 3 ? "floor" : raw > 99 ? "cap" : null;

  return { rows, adjustments, subtotal, discount, clamped, readiness: report.readiness };
}
