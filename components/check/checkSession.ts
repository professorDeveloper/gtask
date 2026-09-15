import { QUESTIONS } from "../../lib/readiness/questions";
import { emptySession, sanitizeSession, type SessionStats } from "../../lib/readiness/session";

/**
 * The in-progress check as one small store: where the student is, what they
 * answered, and how they took it (time per question, tab leaves, changes).
 *
 * Time is booked by a single accumulator — `tick()` — which charges the time
 * since the last tick to the current question while the tab is visible, or to
 * `awayMs` while hidden. Every event ticks first, so a question change or tab
 * switch always closes the previous interval. Time while the page was closed
 * is not counted at all.
 *
 * No React here: the store is framework-free and takes its clock and storage
 * as arguments, so it can be tested directly.
 */

export const STORAGE_KEY = "gtask-check-v1";
const COUNT = QUESTIONS.length;

export type CheckSnapshot = {
  index: number;
  /** One slot per question; null until answered. */
  answers: (string | null)[];
  stats: SessionStats;
  /** True when this state came back from storage with at least one answer. */
  restored: boolean;
};

type Persisted = { v: 1; index: number; answers: (string | null)[]; stats: SessionStats };

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const blank = (): CheckSnapshot => ({
  index: 0,
  answers: Array(COUNT).fill(null),
  stats: emptySession(),
  restored: false,
});

/** Parses stored progress, dropping anything that does not match the questions. */
export function parsePersisted(raw: string | null): CheckSnapshot | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Persisted>;
    if (data?.v !== 1 || !Array.isArray(data.answers) || data.answers.length !== COUNT) return null;
    const answers = data.answers.map((a, i) =>
      typeof a === "string" && QUESTIONS[i].options.some((o) => o.id === a) ? a : null,
    );
    const stats = sanitizeSession(data.stats) ?? emptySession();
    const firstOpen = answers.indexOf(null);
    const maxIndex = firstOpen === -1 ? COUNT - 1 : firstOpen;
    const index = Number.isInteger(data.index) ? Math.min(Math.max(0, data.index as number), maxIndex) : maxIndex;
    const answered = answers.filter(Boolean).length;
    if (answered === 0) return null;
    return { index, answers, stats, restored: true };
  } catch {
    return null;
  }
}

export function answeredCount(answers: (string | null)[]): number {
  return answers.filter(Boolean).length;
}

export type CheckSession = ReturnType<typeof createCheckSession>;

export function createCheckSession({
  now = () => Date.now(),
  storage,
}: { now?: () => number; storage?: () => StorageLike | null } = {}) {
  let state: CheckSnapshot = blank();
  let loaded = false;
  let hidden = false;
  let awayAtHide = 0;
  let lastTick = now();
  const listeners = new Set<() => void>();

  const store = (): StorageLike | null => {
    try {
      return storage?.() ?? null;
    } catch {
      return null;
    }
  };

  const persist = () => {
    const s = store();
    if (!s) return;
    try {
      if (answeredCount(state.answers) === 0) s.removeItem(STORAGE_KEY);
      else {
        const data: Persisted = { v: 1, index: state.index, answers: state.answers, stats: state.stats };
        s.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      /* private mode or full storage: progress just is not resumable */
    }
  };

  const set = (next: CheckSnapshot, save = true) => {
    state = next;
    if (save) persist();
    listeners.forEach((l) => l());
  };

  /** Lazily reads storage on first client access. */
  const ensureLoaded = () => {
    if (loaded) return;
    loaded = true;
    const restored = parsePersisted(store()?.getItem(STORAGE_KEY) ?? null);
    if (restored) state = restored;
    lastTick = now();
  };

  /** Charges elapsed time to the current question (visible) or to time away (hidden). */
  const tick = () => {
    ensureLoaded();
    const t = now();
    const elapsed = Math.max(0, t - lastTick);
    lastTick = t;
    if (elapsed === 0) return;
    const stats = { ...state.stats, totalMs: state.stats.totalMs + elapsed };
    if (hidden) stats.awayMs += elapsed;
    else {
      stats.perQuestionMs = stats.perQuestionMs.map((ms, i) => (i === state.index ? ms + elapsed : ms));
    }
    state = { ...state, stats };
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): CheckSnapshot {
      ensureLoaded();
      return state;
    },
    getServerSnapshot: (() => {
      const initial = blank();
      return () => initial;
    })(),

    /** Records an answer for the current question. Returns false when nothing changed. */
    answer(optionId: string): boolean {
      tick();
      const prev = state.answers[state.index];
      if (prev === optionId) {
        set({ ...state });
        return false;
      }
      const answers = state.answers.map((a, i) => (i === state.index ? optionId : a));
      const stats = prev ? { ...state.stats, answerChanges: state.stats.answerChanges + 1 } : state.stats;
      set({ ...state, answers, stats });
      return true;
    },

    goTo(index: number) {
      tick();
      const clamped = Math.min(Math.max(0, index), COUNT - 1);
      if (clamped === state.index) return;
      set({ ...state, index: clamped, restored: false });
    },

    /** Tab visibility. Returns how long the tab was away when it comes back (ms). */
    setHidden(next: boolean): number {
      if (next === hidden) return 0;
      tick();
      hidden = next;
      if (next) {
        awayAtHide = state.stats.awayMs;
        set({ ...state, stats: { ...state.stats, tabLeaves: state.stats.tabLeaves + 1 } });
        return 0;
      }
      set({ ...state });
      return state.stats.awayMs - awayAtHide;
    },

    /** Flushes time into the stats and saves (page hide, periodic). */
    flush() {
      tick();
      set({ ...state });
    },

    /** Final stats for submission. */
    stats(): SessionStats {
      tick();
      persist();
      return state.stats;
    },

    markRestoredSeen() {
      if (state.restored) set({ ...state, restored: false }, false);
    },

    /** Forgets everything (start over, or after a successful submit). */
    reset() {
      hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      lastTick = now();
      set(blank());
    },
  };
}
