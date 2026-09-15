"use client";

import { useId } from "react";

/**
 * A slider over an ordered set of choices: a native range input (keyboard,
 * screen readers and touch for free) with a tick label under every stop.
 * The track is 44px tall so it is an easy thumb target on a phone; each tick
 * label carries an invisible 44px hit area (see .step-tick) that stays clear
 * of the thumb.
 */
export function StepSlider<T extends string>({
  label, value, options, onChange, className = "",
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  className?: string;
}) {
  const labelId = useId();
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const last = Math.max(1, options.length - 1);
  const pct = (index / last) * 100;

  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p id={labelId} className="text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">{label}</p>
        <p className="tnum text-caption font-bold text-brand" aria-hidden>{options[index]?.label}</p>
      </div>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        aria-labelledby={labelId}
        aria-valuetext={options[index]?.label}
        onChange={(e) => onChange(options[Number(e.target.value)].id)}
        className="step-slider block h-11 w-full cursor-pointer"
        style={{ ["--fill" as string]: `${pct}%` }}
      />
      <div className="relative h-4 text-micro text-ink-3" aria-hidden>
        {options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            tabIndex={-1}
            onClick={() => onChange(o.id)}
            className={`step-tick absolute top-0 cursor-pointer whitespace-nowrap ${i === index ? "font-semibold text-ink" : ""} ${
              i === 0 ? "left-0" : i === options.length - 1 ? "right-0" : "-translate-x-1/2"
            }`}
            style={i === 0 || i === options.length - 1 ? undefined : { left: `${(i / last) * 100}%` }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
