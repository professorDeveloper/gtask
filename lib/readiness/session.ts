/**
 * How the student took the check: time, tab leaves, changed answers.
 * Measured in the browser, stored with the submission, shown on the result.
 * It never touches the readiness score.
 */

export const QUESTION_COUNT = 5;

export type SessionStats = {
  /** Wall time from the first question shown to the last answer, in ms (includes time away). */
  totalMs: number;
  /** Visible time spent on each question, in ms. Always 5 entries. */
  perQuestionMs: number[];
  /** Times the tab became hidden while the check was in progress. */
  tabLeaves: number;
  /** Total hidden time, in ms. */
  awayMs: number;
  /** Times an already-answered question got a different answer. */
  answerChanges: number;
};

export type FocusLevel = "focused" | "bit-distracted" | "distracted";

export const FOCUS_LEVELS: Record<FocusLevel, { label: string; tone: "ready" | "progress" | "gap"; blurb: string }> = {
  focused: { label: "Focused", tone: "ready", blurb: "One sitting, eyes on the questions." },
  "bit-distracted": { label: "A bit distracted", tone: "progress", blurb: "A short detour, but you came back." },
  distracted: { label: "Distracted", tone: "gap", blurb: "The check competed with other tabs. Test day will not allow that." },
};

export type SessionSummary = {
  focus: FocusLevel;
  focusLabel: string;
  /** 0-based index of the question with the most visible time. */
  longestIndex: number;
  longestMs: number;
  averageMs: number;
  /** totalMs − awayMs, never negative. */
  activeMs: number;
  /** awayMs / totalMs, 0–1. */
  awayShare: number;
  totalMs: number;
  tabLeaves: number;
  awayMs: number;
  answerChanges: number;
};

/* Focus rules, in order. */
export const DISTRACTED_LEAVES = 3;
export const DISTRACTED_AWAY_MS = 60_000;
export const DISTRACTED_AWAY_SHARE = 0.5;
export const BIT_AWAY_MS = 10_000;
export const BIT_CHANGES = 3;

/** One hour caps any single duration so a forgotten tab cannot wreck the stats. */
const MAX_MS = 3_600_000;

export const emptySession = (): SessionStats => ({
  totalMs: 0,
  perQuestionMs: Array(QUESTION_COUNT).fill(0),
  tabLeaves: 0,
  awayMs: 0,
  answerChanges: 0,
});

const num = (v: unknown, max: number): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(Math.min(max, Math.max(0, v))) : null;

/** Validates and clamps untrusted stats (e.g. from a server action). Returns null when unusable. */
export function sanitizeSession(value: unknown): SessionStats | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const totalMs = num(v.totalMs, MAX_MS * 3);
  const tabLeaves = num(v.tabLeaves, 999);
  const awayMs = num(v.awayMs, MAX_MS * 3);
  const answerChanges = num(v.answerChanges, 999);
  if (totalMs === null || tabLeaves === null || awayMs === null || answerChanges === null) return null;
  if (!Array.isArray(v.perQuestionMs) || v.perQuestionMs.length !== QUESTION_COUNT) return null;
  const perQuestionMs = v.perQuestionMs.map((ms) => num(ms, MAX_MS));
  if (perQuestionMs.some((ms) => ms === null)) return null;
  return {
    totalMs,
    perQuestionMs: perQuestionMs as number[],
    tabLeaves,
    awayMs: Math.min(awayMs, totalMs),
    answerChanges,
  };
}

/** Pure, deterministic read of a session. */
export function summarizeSession(stats: SessionStats): SessionSummary {
  const per = stats.perQuestionMs;
  let longestIndex = 0;
  per.forEach((ms, i) => {
    if (ms > per[longestIndex]) longestIndex = i;
  });
  const sum = per.reduce((a, b) => a + b, 0);
  const awayShare = stats.totalMs > 0 ? Math.min(1, stats.awayMs / stats.totalMs) : 0;

  let focus: FocusLevel = "focused";
  if (
    stats.tabLeaves >= DISTRACTED_LEAVES ||
    stats.awayMs >= DISTRACTED_AWAY_MS ||
    (stats.tabLeaves > 0 && awayShare >= DISTRACTED_AWAY_SHARE)
  )
    focus = "distracted";
  else if (stats.tabLeaves >= 1 || stats.awayMs >= BIT_AWAY_MS || stats.answerChanges >= BIT_CHANGES)
    focus = "bit-distracted";

  return {
    focus,
    focusLabel: FOCUS_LEVELS[focus].label,
    longestIndex,
    longestMs: per[longestIndex] ?? 0,
    averageMs: per.length ? Math.round(sum / per.length) : 0,
    activeMs: Math.max(0, stats.totalMs - stats.awayMs),
    awayShare,
    totalMs: stats.totalMs,
    tabLeaves: stats.tabLeaves,
    awayMs: stats.awayMs,
    answerChanges: stats.answerChanges,
  };
}

/** "48s", "2m 05s", "1h 02m". */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}
