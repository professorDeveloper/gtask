"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Sticker } from "@/components/ui/Sticker";
import type { Question, QuestionId } from "@/lib/readiness/types";
import { OptionGroup, OPTION_KEYS } from "./OptionRow";

const QUESTION_ICON: Record<QuestionId, IconName> = {
  timeline: "calendarDots",
  baseline: "chartLine",
  effort: "timer",
  focus: "crosshair",
  target: "target",
};

/** Small cheers on the way through: the micro-wins. */
const CHEER: Partial<Record<number, { text: string; icon: IconName }>> = {
  2: { text: "Halfway there", icon: "fire" },
  4: { text: "Last one", icon: "flag" },
};

export function QuestionCard({
  question,
  index,
  value,
  focusOnMount,
  onSelect,
}: {
  question: Question;
  index: number;
  value: string | null;
  /** Move focus to the prompt (after a step, not on first page load). */
  focusOnMount: boolean;
  onSelect: (optionId: string, from: HTMLElement) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = `q-${question.id}`;
  const cheer = CHEER[index];

  useEffect(() => {
    if (!focusOnMount) return;
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div>
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface pr-3 pl-2.5 text-caption font-semibold text-ink-2 elev-1">
          <Icon name={QUESTION_ICON[question.id]} size={16} className="text-brand" />
          {question.label}
        </span>
        {cheer && (
          <Sticker tone="sunny" icon={cheer.icon} rotate={-3} delay={0.25}>
            {cheer.text}
          </Sticker>
        )}
      </div>

      <h1
        ref={heading}
        id={headingId}
        tabIndex={-1}
        className="check-prompt mt-4 font-display text-h2 font-bold text-balance text-ink"
      >
        {question.prompt}
      </h1>
      <p className="mt-3 text-body text-ink-3">{question.help}</p>

      <OptionGroup
        className="mt-7"
        options={question.options}
        value={value}
        labelledBy={headingId}
        onSelect={onSelect}
      />

      <p className="mt-8 hidden items-center gap-2 text-micro text-ink-3 sm:flex">
        <Kbd>A</Kbd>–<Kbd>{OPTION_KEYS[question.options.length - 1]}</Kbd>
        <span className="mr-2">answer</span>
        {index > 0 && (
          <>
            <Kbd>⌫</Kbd>
            <span className="mr-2">back</span>
          </>
        )}
        {value && (
          <>
            <Kbd>↵</Kbd>
            <span>continue</span>
          </>
        )}
      </p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-6 min-w-6 place-items-center check-kbd rounded-md bg-surface px-1.5 font-mono text-micro font-semibold text-ink-2">
      {children}
    </kbd>
  );
}
