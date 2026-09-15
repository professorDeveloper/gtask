/** Everything the readiness check knows how to say about a student. */

export type QuestionId = "timeline" | "baseline" | "effort" | "focus" | "target";

export type Option = {
  id: string;
  label: string;
  note: string;
};

export type Question = {
  id: QuestionId;
  /** Short word shown in the progress rail. */
  label: string;
  prompt: string;
  help: string;
  options: Option[];
};

/** One answer per question, in question order. */
export type Answers = [string, string, string, string, string];

export type BandKey = "foundation" | "building" | "sharpening" | "ready";

export type Band = {
  key: BandKey;
  name: string;
  /** Inclusive upper bound of the band. */
  max: number;
  blurb: string;
  /** CSS custom property that carries this band's colour. */
  tone: "gap" | "progress" | "brand" | "ready";
};

export type ScoreComponent = {
  key: string;
  label: string;
  /** Points this component can contribute at most. */
  weight: number;
  /** 0–1, how much of the weight was earned. */
  value: number;
  points: number;
  explain: string;
};

export type Phase = {
  name: string;
  weeks: number;
  hoursPerWeek: number;
  detail: string;
};

export type Move = { head: string; body: string };

export type Report = {
  readiness: number;
  band: Band;
  archetype: string;
  verdict: string;

  baseline: number;
  measured: boolean;
  target: number;
  gap: number;
  /** Where the current pace actually lands the student by test day. */
  projected: number;
  shortfall: number;

  weeks: number;
  hoursPerWeek: number;
  budgetHours: number;
  requiredHours: number;
  weeklyNeed: number;

  /** Study split; `section` is the Q4 answer the split was derived from. */
  focus: { rw: number; math: number; label: string; section: FocusSection };
  components: ScoreComponent[];
  phases: Phase[];
  moves: Move[];
  flags: { unbooked: boolean; needsDiagnostic: boolean; pacingIssue: boolean };
  /** Present only on a report produced by `refine()` with at least one optional answer. */
  refined?: RefinedInfo;
};

export type FocusSection = "rw" | "math" | "both" | "pace";

/* ---- optional refinement (result page) -------------------------------- */

export type PracticeId = "p_0" | "p_1_2" | "p_3_5" | "p_6";
export type SubtopicId =
  | "s_algebra" | "s_advanced" | "s_data" | "s_geometry"
  | "s_craft" | "s_info" | "s_conventions" | "s_expression";
export type StressId = "st_never" | "st_sometimes" | "st_always";

/** The three optional answers. Any subset may be present. */
export type Refinements = {
  practice?: PracticeId;
  subtopic?: SubtopicId;
  stress?: StressId;
};

export type RefineQuestionId = keyof Refinements;

export type RefineOption = Option & {
  /** Only on sub-topic options: which section the sub-topic belongs to. */
  section?: "math" | "rw";
};

export type RefineQuestion = {
  id: RefineQuestionId;
  label: string;
  prompt: string;
  help: string;
  options: RefineOption[];
};

export type RefinedInfo = {
  /** 70 + 10 per answered optional question (70–100). */
  accuracy: number;
  answered: number;
  practice?: PracticeId;
  subtopic?: { id: SubtopicId; label: string; section: "math" | "rw" };
  stress?: StressId;
};
