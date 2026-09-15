import { FOCUS } from "./questions";
import { evaluateWith, NEUTRAL_MODIFIERS, type Modifiers } from "./engine";
import type {
  Answers, PracticeId, RefinedInfo, RefineQuestion, Refinements, Report, StressId, SubtopicId,
} from "./types";

/**
 * The three optional questions on the result page, and the rule each one
 * applies. Every rule is a modifier on the same engine, so a refined report
 * is still traceable arithmetic on the student's answers.
 *
 *   practice  – full tests already taken: softens the ×0.9 discount on an
 *               unmeasured baseline, adds a small confidence bonus to a
 *               measured one, and shortens Rehearse when there were many.
 *   subtopic  – named weak skill inside the weak section: the gap costs 5%
 *               fewer hours, and the plan and moves name the skill.
 *   stress    – running out of time: +2 when never, −4 and the timed-practice
 *               rules switched on when always.
 */

export const ACCURACY_BASE = 70;
export const ACCURACY_STEP = 10;

export const PRACTICE: Record<PracticeId, { tests: number; discount: number; bonus: number; rehearseCut: number }> = {
  p_0: { tests: 0, discount: 0.9, bonus: 0, rehearseCut: 0 },
  p_1_2: { tests: 2, discount: 0.93, bonus: 0, rehearseCut: 0 },
  p_3_5: { tests: 4, discount: 0.96, bonus: 1, rehearseCut: 1 },
  p_6: { tests: 6, discount: 0.98, bonus: 2, rehearseCut: 2 },
};

export const SUBTOPIC: Record<SubtopicId, { label: string; section: "math" | "rw" }> = {
  s_algebra: { label: "Algebra", section: "math" },
  s_advanced: { label: "Advanced math", section: "math" },
  s_data: { label: "Problem solving & data", section: "math" },
  s_geometry: { label: "Geometry & trig", section: "math" },
  s_craft: { label: "Craft & structure", section: "rw" },
  s_info: { label: "Information & ideas", section: "rw" },
  s_conventions: { label: "Standard English conventions", section: "rw" },
  s_expression: { label: "Expression of ideas", section: "rw" },
};

export const STRESS: Record<StressId, { pacingDelta: number; forcePacing: boolean }> = {
  st_never: { pacingDelta: 2, forcePacing: false },
  st_sometimes: { pacingDelta: 0, forcePacing: false },
  st_always: { pacingDelta: -4, forcePacing: true },
};

/** Multiplier on required hours when a sub-topic in the weak section is named. */
export const SUBTOPIC_HOURS_FACTOR = 0.95;

const PRACTICE_QUESTION: RefineQuestion = {
  id: "practice",
  label: "Practice tests",
  prompt: "How many full practice tests have you taken?",
  help: "Full, timed, one sitting. Section drills do not count.",
  options: [
    { id: "p_0", label: "None yet", note: "Not a single full test" },
    { id: "p_1_2", label: "1–2", note: "I know the format" },
    { id: "p_3_5", label: "3–5", note: "A few under my belt" },
    { id: "p_6", label: "6 or more", note: "Test day will feel familiar" },
  ],
};

const MATH_SUBTOPICS = [
  { id: "s_algebra", note: "Linear equations, systems, inequalities" },
  { id: "s_advanced", note: "Quadratics, functions, exponentials" },
  { id: "s_data", note: "Ratios, percentages, statistics" },
  { id: "s_geometry", note: "Area, volume, circles, trigonometry" },
] as const;

const RW_SUBTOPICS = [
  { id: "s_craft", note: "Vocabulary in context, inference, text structure" },
  { id: "s_info", note: "Central ideas, evidence, reading graphs" },
  { id: "s_conventions", note: "Grammar, punctuation, sentence boundaries" },
  { id: "s_expression", note: "Transitions, rhetorical synthesis" },
] as const;

const STRESS_QUESTION: RefineQuestion = {
  id: "stress",
  label: "Timing",
  prompt: "Do you run out of time on test sections?",
  help: "Think about your last few timed sections.",
  options: [
    { id: "st_never", label: "Never", note: "I finish with time to check" },
    { id: "st_sometimes", label: "Sometimes", note: "The last few questions get rushed" },
    { id: "st_always", label: "Almost always", note: "I guess at the end" },
  ],
};

/**
 * The optional questions for a given five-answer set. The sub-topic options
 * follow Q4: R&W or Math only when one section was named, all eight
 * (each tagged with `section`) for "both" or "pace".
 */
export function refineQuestionsFor(answers: Answers): RefineQuestion[] {
  const section = FOCUS[answers[3] as keyof typeof FOCUS]?.section ?? "both";
  const pick = section === "math" ? MATH_SUBTOPICS : section === "rw" ? RW_SUBTOPICS : [...RW_SUBTOPICS, ...MATH_SUBTOPICS];
  const subtopic: RefineQuestion = {
    id: "subtopic",
    label: "Weakest topic",
    prompt:
      section === "math"
        ? "Which part of Math costs you the most?"
        : section === "rw"
          ? "Which part of Reading & Writing costs you the most?"
          : "Which topic costs you the most?",
    help: "The skill tag that shows up most on your missed questions.",
    options: pick.map((o) => ({ id: o.id, label: SUBTOPIC[o.id].label, note: o.note, section: SUBTOPIC[o.id].section })),
  };
  return [PRACTICE_QUESTION, subtopic, STRESS_QUESTION];
}

const has = <T extends string>(map: Record<T, unknown>, v: unknown): v is T =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(map, v);

/** Keeps only known keys with valid option ids. Never throws. */
export function sanitizeRefinements(value: unknown): Refinements {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const v = value as Record<string, unknown>;
  const out: Refinements = {};
  if (has(PRACTICE, v.practice)) out.practice = v.practice;
  if (has(SUBTOPIC, v.subtopic)) out.subtopic = v.subtopic;
  if (has(STRESS, v.stress)) out.stress = v.stress;
  return out;
}

/** True when the value is an object whose every key is a known refinement with a valid id. */
export function isRefinements(value: unknown): value is Refinements {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as object);
  return keys.length === Object.keys(sanitizeRefinements(value)).length
    && keys.every((k) => k === "practice" || k === "subtopic" || k === "stress");
}

export const answeredCount = (r: Refinements): number =>
  (r.practice ? 1 : 0) + (r.subtopic ? 1 : 0) + (r.stress ? 1 : 0);

/** 70% for the five answers, +10% per optional answer. */
export const accuracyFor = (r: Refinements): number => ACCURACY_BASE + ACCURACY_STEP * answeredCount(r);

/** Builds engine modifiers from refinements. Exported for tests and explanations. */
export function modifiersFor(answers: Answers, r: Refinements): Modifiers {
  const section = FOCUS[answers[3] as keyof typeof FOCUS]?.section;
  const practice = r.practice ? PRACTICE[r.practice] : null;
  const stress = r.stress ? STRESS[r.stress] : null;
  const sub = r.subtopic ? SUBTOPIC[r.subtopic] : null;
  /* A sub-topic outside the named weak section does not make the gap cheaper. */
  const subInWeakSection = !!sub && (section === "both" || section === "pace" || section === sub.section);
  return {
    unmeasuredDiscount: practice?.discount ?? NEUTRAL_MODIFIERS.unmeasuredDiscount,
    measuredBonus: practice?.bonus ?? 0,
    pacingDelta: stress?.pacingDelta ?? 0,
    forcePacing: stress?.forcePacing ?? false,
    hoursFactor: subInWeakSection ? SUBTOPIC_HOURS_FACTOR : 1,
    rehearseCut: practice?.rehearseCut ?? 0,
    subtopic: sub,
  };
}

export type RefineResult = {
  report: Report;
  /** 70–100. */
  accuracy: number;
  answered: number;
  /** The sanitized refinements actually applied. */
  refinements: Refinements;
};

/**
 * The adjusted report for a five-answer set plus any subset of the optional
 * answers. With no refinements the report equals `evaluate(answers)`.
 */
export function refine(answers: Answers, refinements: Refinements = {}): RefineResult {
  const r = sanitizeRefinements(refinements);
  const answered = answeredCount(r);
  const accuracy = accuracyFor(r);
  const report = evaluateWith(answers, modifiersFor(answers, r));
  if (answered > 0) {
    const info: RefinedInfo = { accuracy, answered };
    if (r.practice) info.practice = r.practice;
    if (r.subtopic) info.subtopic = { id: r.subtopic, ...SUBTOPIC[r.subtopic] };
    if (r.stress) info.stress = r.stress;
    report.refined = info;
  }
  return { report, accuracy, answered, refinements: r };
}
