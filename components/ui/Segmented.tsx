"use client";

import { useId, useRef } from "react";

/**
 * A single-choice radio group of chips. One Tab stop (roving tabindex);
 * arrow keys move and select, like native radios.
 */
export function Segmented<T extends string>({
  label, value, options, onChange, className = "",
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  className?: string;
}) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, options.findIndex((o) => o.id === value));

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <p id={labelId} className="mb-2 text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">{label}</p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
        {options.map((o, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={o.id}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(o.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-caption font-semibold transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.97] ${
                active
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-surface text-ink-2 elev-1 hover:border-line-strong hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
