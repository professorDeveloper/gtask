import type { Question } from "./types";

/**
 * The five questions, and the numbers each answer carries.
 *
 * Option payloads live next to the option so the engine never has to
 * know how a question was worded — it only reads the numbers.
 */

export const TIMELINE = {
  t_4w: { weeks: 3, booked: true },
  t_2m: { weeks: 7, booked: true },
  t_6m: { weeks: 18, booked: true },
  t_none: { weeks: 26, booked: false },
} as const;

export const BASELINE = {
  b_none: { score: null },
  b_low: { score: 940 },
  b_mid: { score: 1090 },
  b_high: { score: 1270 },
  b_top: { score: 1420 },
} as const;

export const EFFORT = {
  h_low: { hours: 1.5 },
  h_mid: { hours: 3.5 },
  h_high: { hours: 8 },
  h_max: { hours: 12 },
} as const;

export const FOCUS = {
  f_rw: { section: "rw" },
  f_math: { section: "math" },
  f_both: { section: "both" },
  f_pace: { section: "pace" },
} as const;

export const TARGET = {
  g_1200: { score: 1200 },
  g_1300: { score: 1300 },
  g_1400: { score: 1400 },
  g_1500: { score: 1500 },
} as const;

export const QUESTIONS: Question[] = [
  {
    id: "timeline",
    label: "Test date",
    prompt: "When do you sit the SAT?",
    help: "Use the date you have booked — or the one you are aiming at.",
    options: [
      { id: "t_4w", label: "In under 4 weeks", note: "Booked and close" },
      { id: "t_2m", label: "1–2 months away", note: "Next test window" },
      { id: "t_6m", label: "3–6 months away", note: "Real runway left" },
      { id: "t_none", label: "No date booked yet", note: "Still deciding" },
    ],
  },
  {
    id: "baseline",
    label: "Baseline",
    prompt: "What did your last full practice test score?",
    help: "A full, timed, digital practice test — not a section drill.",
    options: [
      { id: "b_none", label: "I haven’t taken one", note: "No measured baseline" },
      { id: "b_low", label: "Below 1000", note: "Early days" },
      { id: "b_mid", label: "1000–1190", note: "Foundation in place" },
      { id: "b_high", label: "1200–1340", note: "Solid, chasing precision" },
      { id: "b_top", label: "1350 or above", note: "Top-band territory" },
    ],
  },
  {
    id: "effort",
    label: "Hours",
    prompt: "Hours you really study in a normal week?",
    help: "The honest number. The plan is only useful if this one is true.",
    options: [
      { id: "h_low", label: "Under 2 hours", note: "Whenever it comes up" },
      { id: "h_mid", label: "2–5 hours", note: "A couple of sessions" },
      { id: "h_high", label: "6–10 hours", note: "Most days" },
      { id: "h_max", label: "More than 10 hours", note: "This is the priority" },
    ],
  },
  {
    id: "focus",
    label: "Weak point",
    prompt: "Which part costs you the most points?",
    help: "Where your practice tests bleed the most marks.",
    options: [
      { id: "f_rw", label: "Reading & Writing", note: "Inference, grammar, vocabulary" },
      { id: "f_math", label: "Math", note: "Algebra, data, advanced topics" },
      { id: "f_both", label: "Both, about equally", note: "No section is safe yet" },
      { id: "f_pace", label: "Neither — I run out of time", note: "Content is fine, the clock is not" },
    ],
  },
  {
    id: "target",
    label: "Target",
    prompt: "What score does your target university expect?",
    help: "The number on the admissions page, not the dream number.",
    options: [
      { id: "g_1200", label: "1200+", note: "Solid state and regional universities" },
      { id: "g_1300", label: "1300+", note: "Competitive scholarships" },
      { id: "g_1400", label: "1400+", note: "Top-100 territory" },
      { id: "g_1500", label: "1500+", note: "Ivy League / full-ride territory" },
    ],
  },
];

/** True when every slot holds an option id that belongs to that question. */
export function isCompleteAnswerSet(value: unknown): value is [string, string, string, string, string] {
  if (!Array.isArray(value) || value.length !== QUESTIONS.length) return false;
  return QUESTIONS.every((q, i) => q.options.some((o) => o.id === value[i]));
}
