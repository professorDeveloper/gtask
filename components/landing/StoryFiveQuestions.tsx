"use client";

import { useEffect, useRef, useState, type ContextType } from "react";
import { AnimatePresence, motion, PresenceContext, useMotionValueEvent, useScroll } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { JUMP_EVENT, JUMP_LANDED_EVENT } from "@/components/ui/jumpTo";
import { SPRING } from "@/components/ui/motion";
import { QUESTIONS } from "@/lib/readiness/questions";
import type { Answers, Report } from "@/lib/readiness/types";
import { PhoneMockup } from "./PhoneMockup";

/** Why each question is asked, in the order of QUESTIONS. The 6th step is the report. */
const WHY = [
  "Weeks left is your study budget. Everything else is spent from it.",
  "Where you start. No test yet? We assume a careful 1050 and discount the score.",
  "Hours a week times weeks left is the time you can actually put into the gap.",
  "Decides how every study day is split between Reading & Writing and Math.",
  "The finish line. Every 100 points to it is priced at about 45 hours.",
];
const STEPS = QUESTIONS.length + 1;

/**
 * A present, never-exiting presence context for the story stage. It is always
 * provided (motion's hooks require it to stay non-null for a component's life);
 * only `initial` changes: false blocks mount animations for the remount after a jump.
 */
const LIVE: NonNullable<ContextType<typeof PresenceContext>> = {
  id: "story-stage",
  initial: undefined,
  isPresent: true,
  custom: undefined,
  onExitComplete: () => {},
  register: () => () => {},
};
const SNAP = { ...LIVE, initial: false as const };

/**
 * Scroll story: a phone pinned in place while the page scrolls, stepping
 * through the five questions and landing on the report.
 */
export function StoryFiveQuestions({ answers, sample }: { answers: Answers; sample: Report }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  /*
   * Bumped when a section jump moves the page. The stage below is keyed by it,
   * so it remounts at the new step with initial animations blocked: no exit of
   * the old step, no spring, no colour transition finishing after the fade-in.
   */
  const [epoch, setEpoch] = useState(0);
  const [snap, setSnap] = useState(false);
  const jumping = useRef(false);
  const stepRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const remount = () => {
    setEpoch((e) => e + 1);
    setSnap(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setSnap(false)));
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STEPS - 1, Math.max(0, Math.floor(p * STEPS)));
    if (next === stepRef.current) return;
    stepRef.current = next;
    if (jumping.current) remount();
    setStep(next);
  });
  useEffect(() => {
    const onJump = () => { jumping.current = true; };
    const onLanded = () => {
      jumping.current = false;
      remount();
    };
    window.addEventListener(JUMP_EVENT, onJump);
    window.addEventListener(JUMP_LANDED_EVENT, onLanded);
    return () => {
      window.removeEventListener(JUMP_EVENT, onJump);
      window.removeEventListener(JUMP_LANDED_EVENT, onLanded);
    };
  }, []);

  return (
    <section id="how" className="scroll-mt-16 pt-16 md:pt-24">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p className="text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">How it works</p>
        <h2 className="mt-3 text-h2 font-bold text-balance">Five questions. Then the arithmetic.</h2>
        <p className="mt-4 text-lede text-ink-2">Keep scrolling — this is the check, one question at a time.</p>
      </div>

      <ol className="sr-only-text">
        {QUESTIONS.map((q, i) => (
          <li key={q.id}>{`${q.prompt} ${WHY[i]}`}</li>
        ))}
      </ol>

      <div ref={ref} className="story-track relative">
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
          {/* `initial: false` in presence context makes every motion element mounted under it
              start at its animate state; provided only for the remount frame, so step changes
              while scrolling keep their mount animations */}
          <PresenceContext.Provider value={snap ? SNAP : LIVE}>
            <div
              key={epoch}
              className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-5 lg:grid lg:grid-cols-[1fr_auto] lg:gap-16"
              aria-hidden
            >
              <StepText step={step} />
              <PhoneMockup step={step} answers={answers} sample={sample} />
            </div>
          </PresenceContext.Provider>
        </div>
      </div>
    </section>
  );
}

function StepText({ step }: { step: number }) {
  const done = step >= QUESTIONS.length;
  return (
    <div className="w-full max-w-md lg:max-w-lg">
      <div className="flex items-center gap-4 lg:block">
        <div className="numeral relative h-[1em] min-w-[0.7em] shrink-0 overflow-hidden font-display leading-none font-bold tracking-[-0.06em]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={step}
              className={`block ${done ? "text-ready-ink" : "text-mesh"}`}
              initial={{ y: "70%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-70%", opacity: 0 }}
              transition={SPRING.soft}
            >
              {done ? <Icon name="sealCheck" size={48} /> : step + 1}
            </motion.span>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="min-w-0 lg:mt-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p className="text-micro font-semibold tracking-[0.08em] text-brand uppercase">
              {done ? "Your report" : `Question ${step + 1} of 5 · ${QUESTIONS[step].label}`}
            </p>
            <p className="mt-1.5 font-display text-title font-bold tracking-[-0.02em] text-balance lg:text-h2">
              {done ? "A score, a band and a week of study, instantly." : QUESTIONS[step].prompt}
            </p>
            <p className="mt-1 text-caption text-ink-2 sm:mt-2 sm:text-lede">
              {done ? "Right after question 5, no email wall. Three more questions on it are optional." : WHY[step]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-1.5 lg:mt-10">
        {Array.from({ length: STEPS }, (_, i) => (
          <motion.span
            key={i}
            className={`h-1.5 rounded-full ${i < step ? "bg-brand" : i === step ? (done ? "bg-ready" : "bg-brand") : "bg-line"}`}
            animate={{ width: i === step ? 36 : 12 }}
            transition={SPRING.pop}
          />
        ))}
      </div>
    </div>
  );
}
