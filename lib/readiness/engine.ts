import { BASELINE, EFFORT, FOCUS, QUESTIONS, TARGET, TIMELINE } from "./questions";
import { bandFor } from "./bands";
import type { Answers, Move, Phase, Report, ScoreComponent } from "./types";

/**
 * The rules. No model, no randomness — the same answers always produce the
 * same report, and every number below is traceable on the result page.
 *
 * The one calibration constant: moving 100 SAT points costs roughly 45 hours
 * of deliberate practice. Everything else is arithmetic on the student's own
 * numbers.
 */
export const HOURS_PER_POINT = 0.45;

/** Score when a student has never sat a full test — deliberately conservative. */
const ASSUMED_BASELINE = 1050;

const WEIGHTS = { proximity: 40, capacity: 38, habit: 22 } as const;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, step = 1) => Math.round(n / step) * step;

export function evaluate(answers: Answers): Report {
  const timeline = TIMELINE[answers[0] as keyof typeof TIMELINE];
  const baselineAnswer = BASELINE[answers[1] as keyof typeof BASELINE];
  const effort = EFFORT[answers[2] as keyof typeof EFFORT];
  const focusAnswer = FOCUS[answers[3] as keyof typeof FOCUS];
  const target = TARGET[answers[4] as keyof typeof TARGET].score;

  const weeks = timeline.weeks;
  const hoursPerWeek = effort.hours;
  const measured = baselineAnswer.score !== null;
  const baseline = baselineAnswer.score ?? ASSUMED_BASELINE;

  const gap = Math.max(0, target - baseline);
  const budgetHours = round(weeks * hoursPerWeek);
  const requiredHours = Math.max(round(gap * HOURS_PER_POINT), 8);

  /* Where the current pace actually lands, capped at the target. */
  const pointsEarned = Math.min(gap, budgetHours / HOURS_PER_POINT);
  const projected = round(Math.min(target, baseline + pointsEarned), 10);
  const shortfall = Math.max(0, target - projected);

  const proximity = clamp(1 - gap / 400, 0, 1);
  const capacity = clamp(budgetHours / requiredHours, 0, 1);
  const habit = clamp(hoursPerWeek / 10, 0, 1);
  const pacingIssue = focusAnswer.section === "pace";
  const focusPenalty = focusAnswer.section === "both" ? -5 : pacingIssue ? 3 : 0;

  const components: ScoreComponent[] = [
    {
      key: "proximity",
      label: "How close you already are",
      weight: WEIGHTS.proximity,
      value: proximity,
      points: round(WEIGHTS.proximity * proximity),
      explain: `1 − ${gap}/400`,
    },
    {
      key: "capacity",
      label: "Time you have vs time the gap costs",
      weight: WEIGHTS.capacity,
      value: capacity,
      points: round(WEIGHTS.capacity * capacity),
      explain: `${budgetHours} h available / ${requiredHours} h needed`,
    },
    {
      key: "habit",
      label: "Weekly study habit",
      weight: WEIGHTS.habit,
      value: habit,
      points: round(WEIGHTS.habit * habit),
      explain: `${hoursPerWeek} h per week / 10 h`,
    },
  ];

  const raw = components.reduce((sum, c) => sum + c.weight * c.value, 0) + focusPenalty;
  /* An unmeasured baseline is an estimate, so the score is discounted. */
  const readiness = clamp(Math.round(measured ? raw : raw * 0.9), 3, 99);
  const band = bandFor(readiness);
  const weeklyNeed = clamp(Math.ceil(requiredHours / weeks), 3, 20);

  return {
    readiness,
    band,
    ...archetypeFor({ measured, gap, weeks, hoursPerWeek, pacingIssue, shortfall }),
    baseline,
    measured,
    target,
    gap,
    projected,
    shortfall,
    weeks,
    hoursPerWeek,
    budgetHours,
    requiredHours,
    weeklyNeed,
    focus: focusSplit(focusAnswer.section),
    components,
    phases: phasesFor({ weeks, measured, weeklyNeed, section: focusAnswer.section }),
    moves: movesFor({
      measured, gap, weeks, hoursPerWeek, weeklyNeed, requiredHours, budgetHours,
      booked: timeline.booked, section: focusAnswer.section, shortfall, target, projected,
    }),
    flags: { unbooked: !timeline.booked, needsDiagnostic: !measured, pacingIssue },
  };
}

type ArchetypeInput = {
  measured: boolean; gap: number; weeks: number;
  hoursPerWeek: number; pacingIssue: boolean; shortfall: number;
};

function archetypeFor(i: ArchetypeInput): { archetype: string; verdict: string } {
  if (!i.measured)
    return {
      archetype: "The Unknown Quantity",
      verdict:
        "You are planning around a score nobody has measured. Every number below is an estimate until you sit one full, timed test.",
    };
  if (i.gap >= 250 && i.weeks <= 8)
    return {
      archetype: "The Sprinter",
      verdict: `${i.gap} points in ${i.weeks} weeks is steep. It gets done by narrowing what you study, not by studying longer.`,
    };
  if (i.gap >= 250)
    return {
      archetype: "The Long Climb",
      verdict: `A ${i.gap}-point gap is real work, and ${i.weeks} weeks is enough runway — as long as the weekly hours hold.`,
    };
  if (i.gap <= 120 && i.hoursPerWeek >= 6)
    return {
      archetype: "The Closer",
      verdict: `You are ${i.gap} points out with the habit already built. This is a precision problem now, not an effort problem.`,
    };
  if (i.gap <= 150 && i.hoursPerWeek < 3)
    return {
      archetype: "The Coaster",
      verdict: `Only ${i.gap} points separate you from your target, and you are spending ${i.hoursPerWeek} hours a week on them.`,
    };
  if (i.weeks >= 18 && i.hoursPerWeek < 3)
    return {
      archetype: "The Sleeper",
      verdict: `${i.weeks} weeks feels infinite right now. At ${i.hoursPerWeek} hours a week, it will not be.`,
    };
  if (i.pacingIssue)
    return {
      archetype: "The Clock Watcher",
      verdict: "You know the content. The test is measuring how fast you can prove it, and that is a trainable skill.",
    };
  return {
    archetype: "The Builder",
    verdict:
      i.shortfall === 0
        ? `The arithmetic works: ${i.weeks} weeks at ${i.hoursPerWeek} hours covers the gap with room to spare.`
        : `A ${i.gap}-point gap with ${i.weeks} weeks and ${i.hoursPerWeek} hours a week — it works if nothing slips.`,
  };
}

function focusSplit(section: string): Report["focus"] {
  if (section === "rw") return { rw: 70, math: 30, label: "70% Reading & Writing / 30% Math" };
  if (section === "math") return { rw: 30, math: 70, label: "70% Math / 30% Reading & Writing" };
  if (section === "both") return { rw: 50, math: 50, label: "50 / 50, alternating days" };
  return { rw: 50, math: 50, label: "Even split, but every session timed" };
}

function phasesFor(i: { weeks: number; measured: boolean; weeklyNeed: number; section: string }): Phase[] {
  const phases: Phase[] = [];
  const diagnose = i.measured ? 0 : 1;
  if (diagnose) {
    phases.push({
      name: "Measure",
      weeks: 1,
      hoursPerWeek: 4,
      detail: "One full timed digital test, then tag every miss by skill. This sets the real baseline.",
    });
  }
  const remaining = i.weeks - diagnose;
  if (remaining <= 4) {
    phases.push({
      name: "Rehearse",
      weeks: remaining,
      hoursPerWeek: i.weeklyNeed,
      detail: "Two full timed tests a week, same-day review of every miss. No new content this close in.",
    });
    return phases;
  }
  const rehearse = clamp(Math.round(remaining * 0.3), 2, 6);
  phases.push({
    name: "Close the gap",
    weeks: remaining - rehearse,
    hoursPerWeek: i.weeklyNeed,
    detail:
      i.section === "pace"
        ? "Full sections against the clock, not untimed drills. Pace is the skill being trained."
        : "Drill the weak section by skill tag, one full section test each weekend to check the transfer.",
  });
  phases.push({
    name: "Rehearse",
    weeks: rehearse,
    hoursPerWeek: i.weeklyNeed,
    detail: "Switch to full timed tests. The goal stops being learning and starts being repeatability.",
  });
  return phases;
}

function movesFor(i: {
  measured: boolean; gap: number; weeks: number; hoursPerWeek: number; weeklyNeed: number;
  requiredHours: number; budgetHours: number; booked: boolean; section: string;
  shortfall: number; target: number; projected: number;
}): Move[] {
  const moves: Move[] = [];
  if (!i.measured)
    moves.push({
      head: "Sit one full digital practice test this week",
      body: "Timed, one sitting, in Bluebook. Nothing below this line is reliable until you have a real number.",
    });
  if (i.shortfall > 0)
    moves.push({
      head: `Your current pace lands near ${i.projected}, not ${i.target}`,
      body: `That is ${i.shortfall} points short. Close it by adding hours, moving the date, or accepting a lower target — those are the only three levers.`,
    });
  moves.push(
    i.weeklyNeed > i.hoursPerWeek
      ? {
          head: `Move from ${i.hoursPerWeek} to ${i.weeklyNeed} hours a week`,
          body: `${i.gap} points costs about ${i.requiredHours} hours of work, and you have ${i.weeks} weeks to spend them in.`,
        }
      : {
          head: `Hold ${i.hoursPerWeek} hours a week — it is already enough`,
          body: `The gap needs about ${i.requiredHours} hours and your schedule allows ${i.budgetHours}. Protect the habit instead of adding to it.`,
        },
  );
  moves.push(
    i.section === "pace"
      ? {
          head: "Train the clock, not the content",
          body: "Every drill timed, section-length, with the countdown visible. Accuracy you cannot reach in time does not score.",
        }
      : {
          head: "Review misses the same day you make them",
          body: "Tag each one by skill. A miss you never diagnosed is a miss you will make again on test day.",
        },
  );
  if (!i.booked)
    moves.push({
      head: "Book a test date",
      body: "An unbooked date is the single strongest predictor of a plan that never starts.",
    });
  return moves.slice(0, 4);
}

/** Human-readable labels for a stored answer set, for the admin view. */
export function describeAnswers(answers: Answers): { question: string; answer: string }[] {
  return QUESTIONS.map((q, i) => ({
    question: q.prompt,
    answer: q.options.find((o) => o.id === answers[i])?.label ?? "—",
  }));
}
