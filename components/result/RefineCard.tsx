"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SPRING, TAP_SCALE, usePrefersReducedMotion } from "@/components/ui/motion";
import { burst } from "@/components/ui/confetti";
import { refineQuestionsFor } from "@/lib/readiness/refine";
import type { Answers, RefineOption, RefineQuestion, RefineQuestionId, Refinements } from "@/lib/readiness/types";
import { AccuracyMeter } from "./AccuracyMeter";

const QUESTION_ICON: Record<RefineQuestionId, IconName> = {
  practice: "listChecks",
  subtopic: "crosshair",
  stress: "timer",
};

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Three optional questions on the result page. Each answer re-scores the
 * report instantly (the parent computes `refine()` locally) and is then saved;
 * the parent owns the refinements and the save state.
 */
export function RefineCard({
  answers, refinements, accuracy, readiness, saveState, onChange,
}: {
  answers: Answers;
  refinements: Refinements;
  accuracy: number;
  readiness: number;
  saveState: SaveState;
  onChange: (next: Refinements) => void;
}) {
  const questions = useMemo(() => refineQuestionsFor(answers), [answers]);
  const firstOpen = questions.find((q) => !refinements[q.id])?.id ?? null;
  const [editing, setEditing] = useState<RefineQuestionId | null>(null);
  const done = questions.every((q) => refinements[q.id]);

  const choose = (q: RefineQuestion, option: RefineOption, el: HTMLElement) => {
    const wasAnswered = !!refinements[q.id];
    setEditing(null);
    onChange({ ...refinements, [q.id]: option.id });
    if (!wasAnswered) void burst(el);
  };

  return (
    <section id="refine" aria-labelledby="refine-title" className="scroll-mt-20">
      <div className="rounded-card border border-line bg-surface elev-2">
        <header className="p-5 pb-4 sm:p-6 sm:pb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-sunny-soft px-2.5 text-micro font-bold text-sunny-ink">
                <Icon name="sparkle" size={14} weight="fill" /> Optional · 30 seconds
              </p>
              <h2 id="refine-title" className="mt-3 font-display text-title font-bold">
                {done ? "Report fully tuned" : "Refine your report"}
              </h2>
              <p className="mt-1 text-caption text-ink-3">
                {done
                  ? "Every rule that can use your answers is now using them."
                  : "Three quick answers make the score and plan more precise."}
              </p>
            </div>
            <SaveBadge state={saveState} />
          </div>
          <div className="mt-4">
            <AccuracyMeter accuracy={accuracy} />
          </div>
        </header>

        <ol className="border-t border-line">
          {questions.map((q, i) => {
            const answer = q.options.find((o) => o.id === refinements[q.id]);
            const open = editing === q.id || (editing === null && !answer && firstOpen === q.id);
            return (
              <li key={q.id} className="border-b border-line last:border-b-0">
                <QuestionRow
                  index={i}
                  question={q}
                  answer={answer}
                  open={open}
                  onOpen={() => setEditing(q.id)}
                  onChoose={(o, el) => choose(q, o, el)}
                />
              </li>
            );
          })}
        </ol>

        <p className="flex items-center gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5 text-caption text-ink-2 sm:px-6" aria-live="polite">
          <Icon name="gauge" size={16} className="text-brand" />
          <span>
            Readiness now <b className="tnum font-mono font-bold text-ink">{readiness}</b>. Each answer applies one rule you can read under “How it was scored”.
          </span>
        </p>
      </div>
    </section>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<Exclude<SaveState, "idle">, { icon: IconName; text: string; cls: string }> = {
    saving: { icon: "refresh", text: "Saving", cls: "text-ink-3" },
    saved: { icon: "checkCircle", text: "Saved", cls: "text-ready-ink" },
    error: { icon: "warning", text: "Not saved", cls: "text-gap-ink" },
  };
  const s = state === "idle" ? null : map[state];
  return (
    <span className="min-h-6 shrink-0 text-micro font-semibold" aria-live="polite">
      {s && (
        <span className={`inline-flex items-center gap-1 ${s.cls}`}>
          <Icon name={s.icon} size={14} className={state === "saving" ? "anim-spin" : ""} />
          {s.text}
        </span>
      )}
    </span>
  );
}

function QuestionRow({
  index, question, answer, open, onOpen, onChoose,
}: {
  index: number;
  question: RefineQuestion;
  answer: RefineOption | undefined;
  open: boolean;
  onOpen: () => void;
  onChoose: (option: RefineOption, el: HTMLElement) => void;
}) {
  const reduce = usePrefersReducedMotion();
  const headingId = `refine-${question.id}`;
  const grouped = question.options.some((o) => o.section) && new Set(question.options.map((o) => o.section)).size > 1;

  return (
    <div className="px-5 py-4 sm:px-6">
      <div className="flex min-h-11 items-center gap-3">
        <motion.span
          key={answer ? "done" : "todo"}
          initial={!answer ? false : { scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={SPRING.pop}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            answer ? "bg-ready text-ink" : open ? "bg-brand-soft text-brand" : "bg-surface-2 text-ink-3"
          }`}
        >
          {answer ? <Icon name="check" size={18} weight="bold" /> : <Icon name={QUESTION_ICON[question.id]} size={19} />}
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-micro font-semibold tracking-[0.06em] text-ink-3 uppercase">
            {index + 1} · {question.label} <span className="text-ready-ink normal-case">{answer ? "+10%" : ""}</span>
          </p>
          <h3 id={headingId} className="text-body leading-snug font-semibold text-ink">
            {answer && !open ? answer.label : question.prompt}
          </h3>
        </div>
        {!open && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-caption font-semibold text-brand hover:bg-brand-soft"
            aria-label={answer ? `Change answer: ${question.label}` : `Answer: ${question.prompt}`}
          >
            {answer ? "Change" : "Answer"}
            <Icon name={answer ? "pencil" : "caretRight"} size={14} weight="bold" />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={SPRING.soft}
            className="overflow-hidden"
          >
            <p className="mt-2 text-caption text-ink-3">{question.help}</p>
            {grouped ? (
              (["rw", "math"] as const).map((section) => (
                <div key={section} className="mt-3">
                  <p className="mb-2 text-micro font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    {section === "rw" ? "Reading & Writing" : "Math"}
                  </p>
                  <Options
                    labelledBy={headingId}
                    options={question.options.filter((o) => o.section === section)}
                    selected={answer?.id}
                    onChoose={onChoose}
                  />
                </div>
              ))
            ) : (
              <div className="mt-3">
                <Options labelledBy={headingId} options={question.options} selected={answer?.id} onChoose={onChoose} />
              </div>
            )}
            <div className="h-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Options({
  labelledBy, options, selected, onChoose,
}: {
  labelledBy: string;
  options: RefineOption[];
  selected: string | undefined;
  onChoose: (option: RefineOption, el: HTMLElement) => void;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const on = o.id === selected;
        return (
          <motion.button
            key={o.id}
            type="button"
            aria-pressed={on}
            whileTap={{ scale: TAP_SCALE }}
            transition={SPRING.tap}
            onClick={(e) => onChoose(o, e.currentTarget)}
            className={`flex min-h-14 flex-col items-start justify-center rounded-control border px-3.5 py-2.5 text-left transition-colors ${
              on
                ? "border-brand bg-brand-soft shadow-[inset_0_0_0_1px_var(--brand)]"
                : "border-line-strong bg-surface hover:border-brand hover:bg-brand-soft/40"
            }`}
          >
            <span className={`text-body leading-tight font-semibold ${on ? "text-brand" : "text-ink"}`}>{o.label}</span>
            <span className="mt-0.5 text-micro text-ink-3">{o.note}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
