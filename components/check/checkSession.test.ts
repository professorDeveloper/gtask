import { describe, expect, it } from "vitest";
import { createCheckSession, parsePersisted, STORAGE_KEY, type StorageLike } from "./checkSession";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function setup(storage = memoryStorage()) {
  let t = 1_000;
  const clock = { advance: (ms: number) => (t += ms) };
  const session = createCheckSession({ now: () => t, storage: () => storage });
  session.getSnapshot();
  return { session, clock, storage };
}

describe("check session", () => {
  it("books visible time to the question on screen", () => {
    const { session, clock } = setup();
    clock.advance(4_000);
    session.answer("t_2m");
    session.goTo(1);
    clock.advance(2_500);
    const stats = session.stats();
    expect(stats.perQuestionMs).toEqual([4_000, 2_500, 0, 0, 0]);
    expect(stats.totalMs).toBe(6_500);
  });

  it("counts tab leaves and time away, and reports the absence on return", () => {
    const { session, clock } = setup();
    clock.advance(1_000);
    session.setHidden(true);
    clock.advance(9_000);
    expect(session.setHidden(false)).toBe(9_000);
    clock.advance(1_000);
    const stats = session.stats();
    expect(stats.tabLeaves).toBe(1);
    expect(stats.awayMs).toBe(9_000);
    expect(stats.perQuestionMs[0]).toBe(2_000);
    expect(stats.totalMs).toBe(11_000);
  });

  it("counts a changed answer, not a repeated one", () => {
    const { session } = setup();
    session.answer("t_2m");
    session.answer("t_2m");
    session.answer("t_6m");
    expect(session.stats().answerChanges).toBe(1);
  });

  it("persists progress and restores it", () => {
    const storage = memoryStorage();
    const first = setup(storage).session;
    first.answer("t_2m");
    first.goTo(1);
    first.answer("b_mid");
    first.goTo(2);
    const again = setup(storage).session.getSnapshot();
    expect(again.index).toBe(2);
    expect(again.answers).toEqual(["t_2m", "b_mid", null, null, null]);
    expect(again.restored).toBe(true);
  });

  it("clears storage on reset", () => {
    const { session, storage } = setup();
    session.answer("t_2m");
    expect(storage.data.has(STORAGE_KEY)).toBe(true);
    session.reset();
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(session.getSnapshot().answers.every((a) => a === null)).toBe(true);
  });

  it("rejects stored answers that do not belong to the questions", () => {
    const raw = JSON.stringify({ v: 1, index: 4, answers: ["nope", null, null, null, null], stats: {} });
    expect(parsePersisted(raw)).toBeNull();
    const partial = JSON.stringify({ v: 1, index: 4, answers: ["t_2m", "x", null, null, null], stats: null });
    expect(parsePersisted(partial)?.index).toBe(1);
  });
});
