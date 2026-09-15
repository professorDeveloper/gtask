"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { QUESTIONS } from "@/lib/readiness/questions";
import { submitCheck } from "@/app/actions";
import { OptionRow } from "./OptionRow";
import { ProgressRail } from "./ProgressRail";
import { Icon } from "@/components/ui/Icon";

type Status = "asking" | "scoring" | "error";

export function CheckFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("asking");
  const [error, setError] = useState("");

  const question = QUESTIONS[index];

  const submit = useCallback(
    async (finished: string[]) => {
      setStatus("scoring");
      try {
        const { id } = await submitCheck(finished);
        router.push(`/r/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong while saving your answers.");
        setStatus("error");
      }
    },
    [router],
  );

  const choose = useCallback(
    (optionId: string) => {
      if (status !== "asking") return;
      const next = [...answers];
      next[index] = optionId;
      setAnswers(next);
      const last = index === QUESTIONS.length - 1;
      window.setTimeout(() => (last ? submit(next) : setIndex(index + 1)), 240);
    },
    [answers, index, status, submit],
  );

  /* A–E and 1–5 pick an answer; Backspace goes back. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "asking") return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const byNumber = Number(e.key) - 1;
      const byLetter = "abcde".indexOf(e.key.toLowerCase());
      const i = byNumber >= 0 && byNumber < 9 ? byNumber : byLetter;
      if (i >= 0 && i < question.options.length) choose(question.options[i].id);
      if (e.key === "Backspace" && index > 0) setIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, index, question, status]);

  if (status === "scoring") return <Scoring />;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="mx-auto w-full max-w-2xl px-5 pt-6">
        <ProgressRail index={index} />
        <div className="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">
          <span>
            Question <span className="text-ink">{String(index + 1).padStart(2, "0")}</span> / 05
          </span>
          <span>{question.label}</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pt-8 pb-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col"
          >
            <h1 className="text-[clamp(27px,6.6vw,38px)] leading-[1.08] font-bold text-balance">
              {question.prompt}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{question.help}</p>

            <div className="mt-8 flex flex-col gap-2.5">
              {question.options.map((o, i) => (
                <OptionRow
                  key={o.id}
                  option={o}
                  index={i}
                  selected={answers[index] === o.id}
                  onSelect={() => choose(o.id)}
                />
              ))}
            </div>

            {status === "error" && (
              <p className="mt-6 rounded-xl border border-gap bg-gap-soft px-4 py-3 text-[14px] text-gap">
                {error} Please try again.
              </p>
            )}

            <div className="mt-10 flex items-center justify-between">
              {index > 0 ? (
                <button
                  onClick={() => setIndex(index - 1)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13.5px] font-medium text-ink-3 transition-colors hover:text-ink"
                >
                  <Icon name="arrowLeft" size={16} /> Back
                </button>
              ) : (
                <span />
              )}
              <span className="hidden font-mono text-[11px] text-ink-3 sm:block">
                Press A–{"ABCDE"[question.options.length - 1]} to answer
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Scoring() {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] place-items-center px-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-ink">
            <Icon name="gauge" size={24} />
          </span>
        </div>
        <p className="mt-7 font-display text-[24px] font-bold tracking-[-0.03em]">Scoring your answers</p>
        <p className="mt-2 text-[14.5px] text-ink-3">Running the rules and saving your report.</p>
      </div>
    </div>
  );
}
