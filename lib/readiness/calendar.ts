import { SUBTOPIC } from "./refine";
import type { FocusSection, Refinements, Report } from "./types";

/**
 * A typical study week, Monday to Sunday, derived by rules from the report.
 *
 *   total      weeklyNeed × 60 minutes (a full practice test is never cut,
 *              so a Measure week can run slightly over).
 *   days       ≤4 h → Mon Tue Thu Sat · ≤8 h → Mon–Thu + Sat · more → Mon–Sat.
 *              Sunday is always rest.
 *   Saturday   holds the timed block + its review when there is one:
 *                full test (135 min) + 45 min review  – unmeasured baseline
 *                  with fewer than one known practice test, or weeklyNeed ≥ 8
 *                  and fewer than 6 practice tests;
 *                timed module pair (60 min) + 30 min review – pacing issue;
 *              otherwise a normal day plus a 30-minute weekly review when
 *              the week is at least 5 hours.
 *   weekdays   the rest, split evenly in 15-minute steps; each day splits by
 *              the focus percentages (weak section first). "Both" alternates
 *              whole days. Days under 45 minutes go whole to one section.
 *   stress     "almost always" turns 30 minutes of the middle weekday into a
 *              timed section drill.
 *   topics     the named sub-topic labels blocks of its section.
 */

export type BlockKind = "rw" | "math" | "timed" | "review" | "rest";

export type StudyBlock = {
  kind: BlockKind;
  minutes: number;
  topic?: string;
};

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayPlan = {
  day: DayKey;
  /** "Mon" */
  short: string;
  /** "Monday" */
  label: string;
  blocks: StudyBlock[];
  totalMinutes: number;
  rest: boolean;
};

export const DAYS: { day: DayKey; short: string; label: string }[] = [
  { day: "mon", short: "Mon", label: "Monday" },
  { day: "tue", short: "Tue", label: "Tuesday" },
  { day: "wed", short: "Wed", label: "Wednesday" },
  { day: "thu", short: "Thu", label: "Thursday" },
  { day: "fri", short: "Fri", label: "Friday" },
  { day: "sat", short: "Sat", label: "Saturday" },
  { day: "sun", short: "Sun", label: "Sunday" },
];

export const BLOCK_LABELS: Record<BlockKind, string> = {
  rw: "Reading & Writing",
  math: "Math",
  timed: "Timed practice",
  review: "Review",
  rest: "Rest",
};

export const FULL_TEST_MINUTES = 135;
const SAT = 5;
const STEP = 15;

type Plannable = Pick<Report, "weeklyNeed" | "focus" | "flags">;

/** Older stored reports have no focus.section; recover it from the split. */
export function sectionOf(report: Plannable): FocusSection {
  if (report.focus.section) return report.focus.section;
  if (report.focus.rw > report.focus.math) return "rw";
  if (report.focus.math > report.focus.rw) return "math";
  return report.flags.pacingIssue ? "pace" : "both";
}

const floorStep = (n: number) => Math.floor(n / STEP) * STEP;
const roundStep = (n: number) => Math.round(n / STEP) * STEP;

export function weeklyPlan(report: Plannable, refinements: Refinements = {}): DayPlan[] {
  const section = sectionOf(report);
  const pacing = report.flags.pacingIssue;
  const total = Math.max(3, report.weeklyNeed) * 60;
  const tests = refinements.practice;
  const sub = refinements.subtopic ? SUBTOPIC[refinements.subtopic] : null;

  const studyDays = report.weeklyNeed <= 4 ? [0, 1, 3, SAT] : report.weeklyNeed <= 8 ? [0, 1, 2, 3, SAT] : [0, 1, 2, 3, 4, SAT];

  /* Saturday's timed block. */
  let timed: StudyBlock | null = null;
  let review = 0;
  if (report.flags.needsDiagnostic && (!tests || tests === "p_0")) {
    timed = { kind: "timed", minutes: FULL_TEST_MINUTES, topic: "Full practice test — sets your baseline" };
    review = 45;
  } else if (report.weeklyNeed >= 8 && tests !== "p_6") {
    timed = { kind: "timed", minutes: FULL_TEST_MINUTES, topic: "Full timed practice test" };
    review = 45;
  } else if (pacing) {
    timed = { kind: "timed", minutes: 60, topic: "Timed module pair, clock visible" };
    review = 30;
  } else if (total >= 300) {
    review = 30;
  }
  review = Math.max(0, Math.min(review, total - (timed?.minutes ?? 0)));

  const days: StudyBlock[][] = DAYS.map(() => []);
  const splitDays = timed ? studyDays.filter((d) => d !== SAT) : studyDays;
  let remaining = Math.max(0, total - (timed?.minutes ?? 0) - review);

  if (timed) {
    days[SAT].push(timed);
    if (review) days[SAT].push({ kind: "review", minutes: review, topic: "Tag every miss by skill" });
  }

  /* Even minutes per split day, leftover quarter-hours to the earliest days. */
  const per = floorStep(remaining / splitDays.length);
  const dayMinutes = splitDays.map(() => per);
  remaining -= per * splitDays.length;
  for (let i = 0; remaining >= STEP; i = (i + 1) % splitDays.length) {
    dayMinutes[i] += STEP;
    remaining -= STEP;
  }

  const weak: "rw" | "math" = section === "math" ? "math" : "rw";
  const strong: "rw" | "math" = weak === "rw" ? "math" : "rw";
  const share = { rw: report.focus.rw / 100, math: report.focus.math / 100 };
  const topic = (kind: "rw" | "math") =>
    pacing
      ? kind === "rw" ? "Timed R&W set" : "Timed Math set"
      : sub && sub.section === kind
        ? sub.label
        : kind === "rw" ? "Mixed R&W practice" : "Mixed Math practice";

  splitDays.forEach((d, i) => {
    const minutes = dayMinutes[i];
    if (minutes <= 0) return;
    const alternate = section === "both" || minutes < 45;
    if (alternate) {
      /* Whole day to one section; the weak one gets the larger share of days. */
      const ratio = section === "both" ? 2 : Math.round(1 / Math.max(0.01, share[strong]));
      const kind = (i + 1) % ratio === 0 ? strong : weak;
      days[d].push({ kind, minutes, topic: topic(kind) });
      return;
    }
    const weakMin = Math.min(minutes - STEP, Math.max(STEP, roundStep(minutes * share[weak])));
    days[d].push({ kind: weak, minutes: weakMin, topic: topic(weak) });
    days[d].push({ kind: strong, minutes: minutes - weakMin, topic: topic(strong) });
  });

  if (!timed && review) days[SAT].push({ kind: "review", minutes: review, topic: "Weekly review of misses" });

  if (refinements.stress === "st_always") {
    const mid = splitDays[Math.floor((splitDays.length - 1) / 2)];
    const blocks = days[mid];
    const biggest = blocks.reduce<StudyBlock | null>((b, x) => (!b || x.minutes > b.minutes ? x : b), null);
    if (biggest && biggest.minutes >= 2 * STEP) {
      const take = Math.min(30, biggest.minutes - STEP);
      biggest.minutes -= take;
      blocks.push({ kind: "timed", minutes: take, topic: "Timed section drill" });
    }
  }

  return DAYS.map((meta, i) => {
    const blocks = days[i].length ? days[i] : [{ kind: "rest" as const, minutes: 0 }];
    const totalMinutes = blocks.reduce((n, b) => n + b.minutes, 0);
    return { ...meta, blocks, totalMinutes, rest: totalMinutes === 0 };
  });
}

/** Totals for a plan: all minutes, and minutes per block kind. */
export function summarizePlan(plan: DayPlan[]): { totalMinutes: number; studyDays: number; byKind: Record<BlockKind, number> } {
  const byKind: Record<BlockKind, number> = { rw: 0, math: 0, timed: 0, review: 0, rest: 0 };
  let totalMinutes = 0;
  for (const d of plan)
    for (const b of d.blocks) {
      byKind[b.kind] += b.minutes;
      totalMinutes += b.minutes;
    }
  return { totalMinutes, studyDays: plan.filter((d) => !d.rest).length, byKind };
}
