import { describe, expect, it } from "vitest";
import { evaluate } from "./engine";
import { QUESTIONS } from "./questions";
import {
  PRACTICE, STRESS, SUBTOPIC, accuracyFor, isRefinements, refine, refineQuestionsFor, sanitizeRefinements,
} from "./refine";
import type { Answers, PracticeId, Refinements, StressId, SubtopicId } from "./types";

const A = (t: string, b: string, h: string, f: string, g: string) => [t, b, h, f, g] as Answers;

const practiceIds = [undefined, ...Object.keys(PRACTICE)] as (PracticeId | undefined)[];
const subtopicIds = [undefined, ...Object.keys(SUBTOPIC)] as (SubtopicId | undefined)[];
const stressIds = [undefined, ...Object.keys(STRESS)] as (StressId | undefined)[];

function* allAnswerSets(): Generator<Answers> {
  for (const t of QUESTIONS[0].options)
    for (const b of QUESTIONS[1].options)
      for (const h of QUESTIONS[2].options)
        for (const f of QUESTIONS[3].options)
          for (const g of QUESTIONS[4].options) yield A(t.id, b.id, h.id, f.id, g.id);
}

describe("refine", () => {
  it("with no refinements equals evaluate()", () => {
    for (const a of allAnswerSets()) {
      const r = refine(a, {});
      expect(r.report).toEqual(evaluate(a));
      expect(r.accuracy).toBe(70);
      expect(r.report.refined).toBeUndefined();
    }
  });

  it("adds 10% accuracy per answered optional question", () => {
    expect(accuracyFor({})).toBe(70);
    expect(accuracyFor({ practice: "p_0" })).toBe(80);
    expect(accuracyFor({ practice: "p_0", stress: "st_never" })).toBe(90);
    expect(accuracyFor({ practice: "p_0", stress: "st_never", subtopic: "s_algebra" })).toBe(100);
  });

  it("is deterministic and keeps invariants for every refinement combination", () => {
    const sample = [
      A("t_4w", "b_none", "h_low", "f_both", "g_1500"),
      A("t_2m", "b_mid", "h_mid", "f_math", "g_1300"),
      A("t_6m", "b_high", "h_high", "f_rw", "g_1400"),
      A("t_none", "b_top", "h_max", "f_pace", "g_1200"),
      A("t_6m", "b_none", "h_max", "f_rw", "g_1500"),
    ];
    for (const a of sample)
      for (const practice of practiceIds)
        for (const subtopic of subtopicIds)
          for (const stress of stressIds) {
            const ref: Refinements = { practice, subtopic, stress };
            const x = refine(a, ref);
            expect(refine(a, ref)).toEqual(x);
            expect(x.report.readiness).toBeGreaterThanOrEqual(3);
            expect(x.report.readiness).toBeLessThanOrEqual(99);
            expect(x.report.phases.reduce((n, p) => n + p.weeks, 0)).toBe(x.report.weeks);
            expect(x.report.phases.every((p) => p.weeks >= 1)).toBe(true);
            expect(x.report.moves.length).toBeGreaterThan(0);
            expect(x.accuracy).toBe(70 + 10 * [practice, subtopic, stress].filter(Boolean).length);
          }
  });

  it("more practice tests soften the unmeasured discount", () => {
    const a = A("t_2m", "b_none", "h_mid", "f_math", "g_1300");
    const scores = (["p_0", "p_1_2", "p_3_5", "p_6"] as const).map((p) => refine(a, { practice: p }).report.readiness);
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    expect(scores[3]).toBeGreaterThan(scores[0]);
    expect(scores[0]).toBe(evaluate(a).readiness);
  });

  it("many practice tests shorten Rehearse", () => {
    const a = A("t_6m", "b_mid", "h_high", "f_math", "g_1400");
    const base = evaluate(a).phases.find((p) => p.name === "Rehearse")!.weeks;
    const many = refine(a, { practice: "p_6" }).report.phases.find((p) => p.name === "Rehearse")!.weeks;
    expect(many).toBeLessThan(base);
  });

  it("always running out of time lowers the score and switches on pacing", () => {
    const a = A("t_2m", "b_mid", "h_mid", "f_math", "g_1300");
    const never = refine(a, { stress: "st_never" }).report;
    const always = refine(a, { stress: "st_always" }).report;
    expect(never.readiness).toBeGreaterThan(always.readiness);
    expect(always.flags.pacingIssue).toBe(true);
    expect(always.moves.some((m) => /clock/i.test(m.head))).toBe(true);
  });

  it("a sub-topic in the weak section makes the gap cheaper and names the skill", () => {
    const a = A("t_2m", "b_mid", "h_mid", "f_math", "g_1400");
    const r = refine(a, { subtopic: "s_advanced" }).report;
    expect(r.requiredHours).toBeLessThan(evaluate(a).requiredHours);
    expect(r.moves.some((m) => m.head.includes("Advanced math"))).toBe(true);
    expect(r.refined?.subtopic?.label).toBe("Advanced math");
    const off = refine(a, { subtopic: "s_craft" }).report;
    expect(off.requiredHours).toBe(evaluate(a).requiredHours);
  });

  it("sanitizes untrusted input", () => {
    expect(sanitizeRefinements({ practice: "p_6", stress: "nope", extra: 1 })).toEqual({ practice: "p_6" });
    expect(sanitizeRefinements(null)).toEqual({});
    expect(sanitizeRefinements(["p_6"])).toEqual({});
    expect(isRefinements({ practice: "p_6" })).toBe(true);
    expect(isRefinements({ practice: "p_7" })).toBe(false);
    expect(isRefinements({ practice: "p_6", x: "y" })).toBe(false);
  });

  it("offers sub-topics that follow the weak section", () => {
    const math = refineQuestionsFor(A("t_2m", "b_mid", "h_mid", "f_math", "g_1300"));
    expect(math.map((q) => q.id)).toEqual(["practice", "subtopic", "stress"]);
    expect(math[1].options.every((o) => o.section === "math")).toBe(true);
    const rw = refineQuestionsFor(A("t_2m", "b_mid", "h_mid", "f_rw", "g_1300"));
    expect(rw[1].options.every((o) => o.section === "rw")).toBe(true);
    const both = refineQuestionsFor(A("t_2m", "b_mid", "h_mid", "f_both", "g_1300"));
    expect(both[1].options).toHaveLength(8);
  });
});
