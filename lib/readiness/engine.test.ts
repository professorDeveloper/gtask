import { describe, expect, it } from "vitest";
import { evaluate } from "./engine";
import { QUESTIONS, isCompleteAnswerSet } from "./questions";
import type { Answers } from "./types";

const answers = (t: string, b: string, h: string, f: string, g: string) =>
  [t, b, h, f, g] as Answers;

describe("evaluate", () => {
  it("is deterministic", () => {
    const a = answers("t_2m", "b_mid", "h_mid", "f_math", "g_1300");
    expect(evaluate(a)).toEqual(evaluate(a));
  });

  it("scores a student who is already on target as test-ready", () => {
    const r = evaluate(answers("t_6m", "b_top", "h_max", "f_pace", "g_1200"));
    expect(r.gap).toBe(0);
    expect(r.band.key).toBe("ready");
    expect(r.shortfall).toBe(0);
  });

  it("never projects below today's score, even above the target", () => {
    const r = evaluate(answers("t_2m", "b_top", "h_mid", "f_math", "g_1400"));
    expect(r.baseline).toBeGreaterThan(r.target);
    expect(r.projected).toBe(r.baseline);
    expect(r.shortfall).toBe(0);
    for (const t of QUESTIONS[0].options)
      for (const b of QUESTIONS[1].options)
        for (const g of QUESTIONS[4].options) {
          const x = evaluate(answers(t.id, b.id, "h_low", "f_rw", g.id));
          expect(x.projected).toBeGreaterThanOrEqual(x.baseline);
        }
  });

  it("does not tell a student far short of target that the plan works", () => {
    const r = evaluate(answers("t_2m", "b_mid", "h_mid", "f_math", "g_1300"));
    expect(r.shortfall).toBeGreaterThan(50);
    expect(r.verdict).not.toMatch(/it works/i);
  });

  it("scores a large gap with no time and no hours at the bottom", () => {
    const r = evaluate(answers("t_4w", "b_low", "h_low", "f_both", "g_1500"));
    expect(r.gap).toBe(560);
    expect(r.band.key).toBe("foundation");
    expect(r.shortfall).toBeGreaterThan(0);
  });

  it("keeps readiness inside 3–99 across every possible answer set", () => {
    for (const t of QUESTIONS[0].options)
      for (const b of QUESTIONS[1].options)
        for (const h of QUESTIONS[2].options)
          for (const f of QUESTIONS[3].options)
            for (const g of QUESTIONS[4].options) {
              const r = evaluate(answers(t.id, b.id, h.id, f.id, g.id));
              expect(r.readiness).toBeGreaterThanOrEqual(3);
              expect(r.readiness).toBeLessThanOrEqual(99);
              expect(r.phases.reduce((n, p) => n + p.weeks, 0)).toBe(r.weeks);
              expect(r.moves.length).toBeGreaterThan(0);
            }
  });

  it("flags an unmeasured baseline and discounts the score", () => {
    const guessed = evaluate(answers("t_2m", "b_none", "h_mid", "f_math", "g_1300"));
    expect(guessed.flags.needsDiagnostic).toBe(true);
    expect(guessed.moves[0].head).toMatch(/full digital practice test/i);
    expect(guessed.phases[0].name).toBe("Measure");
  });

  it("more study hours never lower the score", () => {
    const low = evaluate(answers("t_2m", "b_mid", "h_low", "f_math", "g_1400"));
    const high = evaluate(answers("t_2m", "b_mid", "h_max", "f_math", "g_1400"));
    expect(high.readiness).toBeGreaterThan(low.readiness);
  });

  it("a nearer target never lowers the score", () => {
    const far = evaluate(answers("t_2m", "b_mid", "h_mid", "f_math", "g_1500"));
    const near = evaluate(answers("t_2m", "b_mid", "h_mid", "f_math", "g_1200"));
    expect(near.readiness).toBeGreaterThan(far.readiness);
  });
});

describe("isCompleteAnswerSet", () => {
  it("accepts a valid set and rejects anything else", () => {
    expect(isCompleteAnswerSet(["t_4w", "b_low", "h_low", "f_rw", "g_1200"])).toBe(true);
    expect(isCompleteAnswerSet(["t_4w", "b_low", "h_low", "f_rw"])).toBe(false);
    expect(isCompleteAnswerSet(["t_4w", "b_low", "h_low", "f_rw", "nope"])).toBe(false);
    expect(isCompleteAnswerSet("t_4w")).toBe(false);
  });
});
