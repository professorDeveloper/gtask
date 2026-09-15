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

  focus: { rw: number; math: number; label: string };
  components: ScoreComponent[];
  phases: Phase[];
  moves: Move[];
  flags: { unbooked: boolean; needsDiagnostic: boolean; pacingIssue: boolean };
};
