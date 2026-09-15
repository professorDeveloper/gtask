"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { SPRING, usePrefersReducedMotion } from "@/components/ui/motion";
import type { Option } from "@/lib/readiness/types";

export const OPTION_KEYS = ["A", "B", "C", "D", "E"];

/**
 * The answers as one single-choice group: one Tab stop, arrow keys move
 * between options, Enter/Space (or a tap) picks.
 */
export function OptionGroup({
  options,
  value,
  labelledBy,
  onSelect,
  className = "",
}: {
  options: Option[];
  value: string | null;
  labelledBy: string;
  onSelect: (optionId: string, from: HTMLElement) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabStop = Math.max(0, options.findIndex((o) => o.id === value));

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const current = refs.current.findIndex((el) => el === document.activeElement);
    const next = (Math.max(0, current) + step + options.length) % options.length;
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className={`flex flex-col gap-3 ${className}`}>
      {options.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.soft, delay: 0.06 + i * 0.045 }}
        >
          <OptionRow
            ref={(el) => {
              refs.current[i] = el;
            }}
            option={o}
            letter={OPTION_KEYS[i]}
            selected={value === o.id}
            tabIndex={i === tabStop ? 0 : -1}
            onSelect={(el) => onSelect(o.id, el)}
          />
        </motion.div>
      ))}
    </div>
  );
}

function OptionRow({
  option,
  letter,
  selected,
  tabIndex,
  onSelect,
  ref,
}: {
  option: Option;
  letter: string;
  selected: boolean;
  tabIndex: number;
  onSelect: (el: HTMLElement) => void;
  ref: React.Ref<HTMLButtonElement>;
}) {
  return (
    <motion.button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={(e) => onSelect(e.currentTarget)}
      whileTap={{ y: 3, scale: 0.985 }}
      animate={selected ? { scale: [1, 1.025, 1] } : { scale: 1 }}
      transition={{ scale: { duration: 0.34, ease: "easeOut" }, y: SPRING.tap }}
      className="check-option flex min-h-16 w-full items-center gap-3.5 rounded-card bg-surface px-4 py-3 text-left sm:gap-4 sm:px-5"
    >
      <span className="check-key grid size-9 shrink-0 place-items-center rounded-control font-mono text-caption font-bold">
        {selected ? <DrawnCheck /> : letter}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body leading-tight font-semibold text-ink">{option.label}</span>
        <span className={`mt-1 block text-caption ${selected ? "text-ink-2" : "text-ink-3"}`}>{option.note}</span>
      </span>
    </motion.button>
  );
}

function DrawnCheck() {
  const reduce = usePrefersReducedMotion();
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <motion.path
        d="M5 12.5l4.3 4.3L19 7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, ease: "easeOut", delay: 0.04 }}
      />
    </svg>
  );
}
