"use client";

import { Icon } from "@/components/ui/Icon";
import type { Option } from "@/lib/readiness/types";

const KEYS = ["A", "B", "C", "D", "E"];

export function OptionRow({
  option, index, selected, onSelect,
}: {
  option: Option;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`lift group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left sm:gap-4 sm:p-[18px] ${
        selected
          ? "border-brand bg-brand-soft shadow-[var(--elev-key)] hover:shadow-[var(--elev-key-hover)]"
          : "elev-1 border-line bg-surface hover:border-line-strong"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border font-mono text-[13px] transition-colors duration-200 ${
          selected
            ? "border-brand bg-brand text-brand-ink"
            : "border-line bg-well text-ink-2 group-hover:border-line-strong group-hover:text-ink"
        }`}
      >
        {selected ? <Icon name="check" size={16} strokeWidth={2.4} /> : KEYS[index]}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] leading-tight font-semibold tracking-[-0.012em]">
          {option.label}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{option.note}</span>
      </span>
    </button>
  );
}
