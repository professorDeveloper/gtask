import { describe, expect, it } from "vitest";
import { emptySession, formatDuration, sanitizeSession, summarizeSession, type SessionStats } from "./session";

const S = (o: Partial<SessionStats>): SessionStats => ({ ...emptySession(), totalMs: 60_000, perQuestionMs: [10e3, 20e3, 5e3, 15e3, 10e3], ...o });

describe("summarizeSession", () => {
  it("finds the longest question", () => {
    const s = summarizeSession(S({}));
    expect(s.longestIndex).toBe(1);
    expect(s.longestMs).toBe(20_000);
    expect(s.averageMs).toBe(12_000);
    expect(s.focus).toBe("focused");
  });

  it("applies the focus rules", () => {
    expect(summarizeSession(S({ tabLeaves: 1, awayMs: 2_000 })).focus).toBe("bit-distracted");
    expect(summarizeSession(S({ answerChanges: 3 })).focus).toBe("bit-distracted");
    expect(summarizeSession(S({ answerChanges: 2 })).focus).toBe("focused");
    expect(summarizeSession(S({ tabLeaves: 3, awayMs: 3_000 })).focus).toBe("distracted");
    expect(summarizeSession(S({ tabLeaves: 1, awayMs: 60_000, totalMs: 200_000 })).focus).toBe("distracted");
    expect(summarizeSession(S({ tabLeaves: 1, awayMs: 35_000, totalMs: 60_000 })).focus).toBe("distracted");
  });

  it("is deterministic across a grid of inputs", () => {
    for (const tabLeaves of [0, 1, 2, 3, 5])
      for (const awayMs of [0, 5_000, 10_000, 59_999, 60_000])
        for (const answerChanges of [0, 2, 3]) {
          const stats = S({ tabLeaves, awayMs, answerChanges, totalMs: 120_000 });
          const a = summarizeSession(stats);
          expect(summarizeSession(stats)).toEqual(a);
          expect(["focused", "bit-distracted", "distracted"]).toContain(a.focus);
          if (tabLeaves === 0 && awayMs < 10_000 && answerChanges < 3) expect(a.focus).toBe("focused");
          if (tabLeaves >= 3) expect(a.focus).toBe("distracted");
        }
  });
});

describe("sanitizeSession", () => {
  it("accepts valid stats and clamps", () => {
    const s = sanitizeSession({ totalMs: 1000.4, perQuestionMs: [1, 2, 3, 4, -5], tabLeaves: 0, awayMs: 5000, answerChanges: 0 });
    expect(s).toEqual({ totalMs: 1000, perQuestionMs: [1, 2, 3, 4, 0], tabLeaves: 0, awayMs: 1000, answerChanges: 0 });
  });
  it("rejects malformed stats", () => {
    expect(sanitizeSession(null)).toBeNull();
    expect(sanitizeSession({ totalMs: 1, perQuestionMs: [1, 2], tabLeaves: 0, awayMs: 0, answerChanges: 0 })).toBeNull();
    expect(sanitizeSession({ totalMs: "1", perQuestionMs: [1, 2, 3, 4, 5], tabLeaves: 0, awayMs: 0, answerChanges: 0 })).toBeNull();
  });
});

describe("formatDuration", () => {
  it("formats", () => {
    expect(formatDuration(48_000)).toBe("48s");
    expect(formatDuration(125_000)).toBe("2m 05s");
    expect(formatDuration(3_720_000)).toBe("1h 02m");
  });
});
