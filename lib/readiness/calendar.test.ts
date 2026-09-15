import { describe, expect, it } from "vitest";
import { evaluate } from "./engine";
import { QUESTIONS } from "./questions";
import { PRACTICE, STRESS, SUBTOPIC, refine } from "./refine";
import { FULL_TEST_MINUTES, summarizePlan, weeklyPlan } from "./calendar";
import { daysToTest } from "./countdown";
import type { Answers, PracticeId, Refinements, StressId } from "./types";

const A = (t: string, b: string, h: string, f: string, g: string) => [t, b, h, f, g] as Answers;

const REFS: Refinements[] = [
  {},
  ...(Object.keys(PRACTICE) as PracticeId[]).map((practice) => ({ practice })),
  ...(Object.keys(STRESS) as StressId[]).map((stress) => ({ stress })),
  { subtopic: "s_algebra" },
  { practice: "p_6", subtopic: "s_craft", stress: "st_always" },
  { practice: "p_0", subtopic: "s_data", stress: "st_never" },
];

describe("weeklyPlan", () => {
  it("builds a sane Mon–Sun week for every answer set and representative refinements", () => {
    for (const t of QUESTIONS[0].options)
      for (const b of QUESTIONS[1].options)
        for (const h of QUESTIONS[2].options)
          for (const f of QUESTIONS[3].options)
            for (const g of QUESTIONS[4].options)
              for (const ref of REFS) {
                const { report } = refine(A(t.id, b.id, h.id, f.id, g.id), ref);
                const plan = weeklyPlan(report, ref);
                expect(plan.map((d) => d.day).join()).toBe("mon,tue,wed,thu,fri,sat,sun");
                expect(plan[6].rest).toBe(true);
                expect(summarizePlan(plan).totalMinutes).toBe(report.weeklyNeed * 60);
                for (const d of plan) {
                  let sum = 0;
                  for (const x of d.blocks) {
                    sum += x.minutes;
                    if (x.minutes % 15 !== 0 || (x.kind !== "rest" && x.minutes <= 0))
                      throw new Error(`bad block ${JSON.stringify(x)} for ${[t.id, b.id, h.id, f.id, g.id]}`);
                  }
                  if (sum !== d.totalMinutes) throw new Error("day total mismatch");
                }
              }
  }, 60_000);

  it("is deterministic", () => {
    const a = A("t_6m", "b_mid", "h_high", "f_both", "g_1400");
    const ref: Refinements = { practice: "p_3_5", subtopic: "s_info", stress: "st_always" };
    expect(weeklyPlan(refine(a, ref).report, ref)).toEqual(weeklyPlan(refine(a, ref).report, ref));
  });

  it("puts a baseline test on Saturday when the baseline is unmeasured", () => {
    const r = evaluate(A("t_2m", "b_none", "h_mid", "f_math", "g_1300"));
    const sat = weeklyPlan(r)[5];
    expect(sat.blocks[0]).toMatchObject({ kind: "timed", minutes: FULL_TEST_MINUTES });
  });

  it("weights the weak section and names the sub-topic", () => {
    const a = A("t_6m", "b_mid", "h_high", "f_math", "g_1500");
    const ref: Refinements = { subtopic: "s_geometry" };
    const plan = weeklyPlan(refine(a, ref).report, ref);
    const { byKind } = summarizePlan(plan);
    expect(byKind.math).toBeGreaterThan(byKind.rw);
    expect(plan.some((d) => d.blocks.some((b) => b.topic === SUBTOPIC.s_geometry.label))).toBe(true);
  });

  it("adds a timed drill mid-week when the student always runs out of time", () => {
    const a = A("t_6m", "b_mid", "h_mid", "f_rw", "g_1300");
    const ref: Refinements = { stress: "st_always" };
    const plan = weeklyPlan(refine(a, ref).report, ref);
    expect(plan.slice(0, 5).some((d) => d.blocks.some((b) => b.kind === "timed"))).toBe(true);
  });

  it("tolerates stored reports without focus.section", () => {
    const r = evaluate(A("t_2m", "b_mid", "h_mid", "f_rw", "g_1300"));
    const legacy = { ...r, focus: { rw: 70, math: 30, label: r.focus.label } } as unknown as typeof r;
    expect(weeklyPlan(legacy)).toEqual(weeklyPlan(r));
  });
});

describe("daysToTest", () => {
  const from = "2026-09-01T10:00:00.000Z";
  it("counts down from the check date", () => {
    expect(daysToTest({ weeks: 7, booked: true }, from, new Date(from)).days).toBe(49);
    const c = daysToTest({ weeks: 7, booked: true }, from, new Date("2026-09-03T10:00:00.000Z"));
    expect(c.days).toBe(47);
    expect(c.label).toBe("47 days left");
    expect(c.testDate).toBe("2026-10-20");
  });
  it("never goes negative and words unbooked dates", () => {
    expect(daysToTest({ weeks: 3, booked: true }, from, new Date("2027-01-01")).days).toBe(0);
    expect(daysToTest({ weeks: 26, booked: false }, from, new Date(from)).label).toBe("182 days of runway");
  });
});
