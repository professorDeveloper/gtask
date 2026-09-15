"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { submitCheck } from "@/app/actions";
import { burst } from "@/components/ui/confetti";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoLink } from "@/components/ui/Logo";
import { SPRING } from "@/components/ui/motion";
import { dismissToast, toast } from "@/components/ui/Toast";
import { QUESTIONS } from "@/lib/readiness/questions";
import { answeredCount } from "./checkSession";
import { ProgressRail } from "./ProgressRail";
import { QuestionCard } from "./QuestionCard";
import { SaveError, ScoringScreen, STAGE_MS } from "./ScoringScreen";
import { checkSession, useCheckSnapshot, useLeaveGuard, useTabAway } from "./useCheckSession";

type Status = "asking" | "scoring" | "error";

const COUNT = QUESTIONS.length;
/** Long enough to see the tap land (pop, drawn check, rail fill) before moving on. */
const ADVANCE_MS = 420;
/** The scoring screen never flashes: its three steps always get to play. */
const MIN_SCORING_MS = STAGE_MS * 2 + 400;
const READY_HOLD_MS = 450;
const WELCOME_TOAST = "welcome-back";

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -32 }),
};

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export function CheckFlow() {
  const router = useRouter();
  const snap = useCheckSnapshot();
  const { index, answers } = snap;
  const question = QUESTIONS[index];
  const value = answers[index];

  const [status, setStatus] = useState<Status>("asking");
  const [dir, setDir] = useState(1);
  const [stepped, setStepped] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [scoring, setScoring] = useState<{ labels: string[]; done: boolean }>({ labels: [], done: false });
  const [announcement, setAnnouncement] = useState("");

  /* Synchronous guards: state updates are too late to stop a double tap. */
  const locked = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const attempt = useRef(0);
  /** One id per answer set, reused by retries so a slow save never creates two rows. */
  const submissionId = useRef<string | null>(null);

  const cancelAdvance = () => {
    window.clearTimeout(timer.current);
    locked.current = false;
    setAdvancing(false);
  };

  const submit = useCallback(async () => {
    const snapshot = checkSession.getSnapshot();
    if (answeredCount(snapshot.answers) < COUNT) return;
    const current = ++attempt.current;
    const started = performance.now();
    setScoring({
      labels: snapshot.answers.map((a, i) => QUESTIONS[i].options.find((o) => o.id === a)?.label ?? ""),
      done: false,
    });
    setStatus("scoring");
    dismissToast(WELCOME_TOAST);
    try {
      submissionId.current ??= crypto.randomUUID();
      const { id } = await submitCheck(snapshot.answers, checkSession.stats(), submissionId.current);
      if (current !== attempt.current) return;
      await sleep(Math.max(0, MIN_SCORING_MS - (performance.now() - started)));
      checkSession.reset();
      submissionId.current = null;
      setScoring((s) => ({ ...s, done: true }));
      await sleep(READY_HOLD_MS);
      router.push(`/r/${id}`);
    } catch (e) {
      if (current !== attempt.current) return;
      console.warn("[check] saving the answers failed", e);
      setStatus("error");
    } finally {
      if (current === attempt.current) locked.current = false;
    }
  }, [router]);

  const step = useCallback((to: number, direction: number) => {
    setDir(direction);
    setStepped(true);
    checkSession.goTo(to);
  }, []);

  const goNext = useCallback(() => {
    const i = checkSession.getSnapshot().index;
    if (i === COUNT - 1) {
      locked.current = true;
      void submit();
    } else step(i + 1, 1);
  }, [step, submit]);

  const choose = useCallback(
    (optionId: string, from?: HTMLElement) => {
      if (locked.current || status !== "asking") return;
      locked.current = true;
      setAdvancing(true);
      dismissToast(WELCOME_TOAST);
      if (checkSession.answer(optionId)) submissionId.current = null;
      navigator.vibrate?.(10);

      const { index: i, answers: now } = checkSession.getSnapshot();
      const last = i === COUNT - 1;
      setAnnouncement(`Answer saved. ${answeredCount(now)} of ${COUNT} answered.`);
      if (last && from) void burst(from);

      timer.current = window.setTimeout(() => {
        setAdvancing(false);
        if (last) void submit();
        else {
          locked.current = false;
          step(i + 1, 1);
        }
      }, ADVANCE_MS);
    },
    [status, step, submit],
  );

  const back = useCallback(() => {
    const i = checkSession.getSnapshot().index;
    if (i === 0 || status !== "asking") return;
    cancelAdvance();
    step(i - 1, -1);
  }, [status, step]);

  const startOver = useCallback(() => {
    cancelAdvance();
    attempt.current++;
    submissionId.current = null;
    dismissToast(WELCOME_TOAST);
    checkSession.reset();
    setStatus("asking");
    setDir(-1);
    setStepped(true);
    setAnnouncement("Started over. Question 1 of 5.");
  }, []);

  const welcomeBack = useCallback(
    (where: number) => {
      toast({
        id: WELCOME_TOAST,
        title: "Welcome back",
        description: `You left at question ${where + 1} of ${COUNT}.`,
        icon: "eyeSlash",
        tone: "brand",
        actions: [
          {
            label: "Continue",
            variant: "primary",
            onClick: () => document.getElementById(`q-${QUESTIONS[where].id}`)?.focus({ preventScroll: true }),
          },
          { label: "Start over", onClick: startOver },
        ],
      });
    },
    [startOver],
  );

  const onReturn = useCallback(() => welcomeBack(checkSession.getSnapshot().index), [welcomeBack]);
  useTabAway({ active: status === "asking", index, onReturn });
  useLeaveGuard(status === "asking" && answeredCount(answers) > 0);

  /* Resumed from storage after a refresh: say so, and offer a clean start. */
  useEffect(() => {
    if (!snap.restored) return;
    checkSession.markRestoredSeen();
    welcomeBack(snap.index);
  }, [snap.restored, snap.index, welcomeBack]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* A–E or 1–5 answer, Backspace goes back, Enter continues an answered question. */
  useEffect(() => {
    if (status !== "asking") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const onControl = Boolean(target?.closest("button, a"));

      if (e.key === "Backspace") {
        e.preventDefault();
        back();
        return;
      }
      if (e.key === "Enter") {
        if (!onControl && value && !locked.current) goNext();
        return;
      }
      const byNumber = Number(e.key) - 1;
      const byLetter = e.key.length === 1 ? "abcde".indexOf(e.key.toLowerCase()) : -1;
      const i = Number.isInteger(byNumber) && byNumber >= 0 ? byNumber : byLetter;
      if (i >= 0 && i < question.options.length) choose(question.options[i].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, choose, goNext, question, status, value]);

  const showContinue = status === "asking" && Boolean(value) && !advancing;

  /* Toasts (welcome back) sit above the Continue bar instead of covering it. */
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--toast-offset", showContinue ? "88px" : "0px");
    return () => {
      root.removeProperty("--toast-offset");
    };
  }, [showContinue]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto grid h-16 w-full max-w-6xl items-center px-4 sm:grid-cols-[1fr_minmax(0,36rem)_1fr] sm:px-6">
          <div className="hidden sm:block">
            <LogoLink />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {status === "asking" && index > 0 ? (
              <button
                type="button"
                onClick={back}
                aria-label="Previous question"
                className="-ml-2.5 grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon name="arrowLeft" size={22} weight="bold" />
              </button>
            ) : (
              <Link
                href="/"
                aria-label="Leave the check"
                className="-ml-2.5 grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon name="x" size={22} weight="bold" />
              </Link>
            )}
            <ProgressRail
              answers={status === "asking" ? answers : Array(COUNT).fill("done")}
              index={status === "asking" ? index : COUNT - 1}
              current={status === "asking"}
              className="flex-1"
            />
            <span className="min-w-12 shrink-0 text-right font-display text-body font-bold text-ink tnum" aria-hidden>
              {status === "asking" ? index + 1 : COUNT}
              <span className="text-ink-3"> / {COUNT}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-clip">
        <p className="sr-only-text" aria-live="polite">
          {announcement}
        </p>

        {status === "scoring" && (
          <ScoringScreen
            labels={scoring.labels}
            done={scoring.done}
            onRetry={() => void submit()}
          />
        )}

        {status === "error" && <SaveError onRetry={() => void submit()} onReview={() => setStatus("asking")} />}

        {status === "asking" && (
          <div className="mx-auto w-full max-w-xl px-5 pt-5 pb-36 sm:px-0 sm:pt-12">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={question.id}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: SPRING.soft, opacity: { duration: 0.16 } }}
              >
                <QuestionCard
                  question={question}
                  index={index}
                  value={value}
                  focusOnMount={stepped}
                  onSelect={choose}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showContinue && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={SPRING.soft}
            className="check-footer fixed inset-x-0 bottom-0 z-30 px-5 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto max-w-xl">
              <Button size="lg" icon="arrowRight" onClick={goNext} className="w-full">
                {index === COUNT - 1 ? "See my result" : "Continue"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
