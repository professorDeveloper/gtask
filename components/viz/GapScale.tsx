"use client";

import { useEffect, useState } from "react";

const MIN = 400;
const MAX = 1600;
const pct = (score: number) => ((Math.min(MAX, Math.max(MIN, score)) - MIN) / (MAX - MIN)) * 100;

/**
 * The product's signature chart: one SAT scale, three marks.
 * What you have today, where your current pace lands you, and what the
 * target asks for. The coloured stretch between the last two is the gap.
 */
export function GapScale({
  baseline, projected, target, compact = false, assumed = false,
}: {
  baseline: number;
  projected: number;
  target: number;
  compact?: boolean;
  assumed?: boolean;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const b = pct(baseline);
  const p = pct(projected);
  const t = pct(target);
  const ease = "transition-[width,left,opacity] duration-1000 ease-[cubic-bezier(.22,1,.36,1)]";

  return (
    <div className={compact ? "" : "select-none"}>
      <div className={`relative ${compact ? "h-9" : "h-12"}`}>
        {/* track */}
        <div className={`absolute inset-x-0 ${compact ? "top-3 h-3" : "top-4 h-4"} well rounded-full`} />
        {/* what the student already has */}
        <div
          className={`absolute ${compact ? "top-3 h-3" : "top-4 h-4"} left-0 rounded-l-full bg-brand/25 ${ease}`}
          style={{ width: `${on ? b : 0}%` }}
        />
        {/* what the current pace adds */}
        <div
          className={`absolute ${compact ? "top-3 h-3" : "top-4 h-4"} bg-progress ${ease}`}
          style={{ left: `${b}%`, width: `${on ? Math.max(0, p - b) : 0}%` }}
        />
        {/* the shortfall */}
        <div
          className={`absolute ${compact ? "top-3 h-3" : "top-4 h-4"} rounded-r-full ${ease}`}
          style={{
            left: `${p}%`,
            width: `${on ? Math.max(0, t - p) : 0}%`,
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--gap) 0 6px, color-mix(in oklab, var(--gap) 55%, transparent) 6px 12px)",
          }}
        />
        {/* target flag */}
        <div
          className={`absolute ${compact ? "top-0.5" : "top-1"} -translate-x-1/2 ${ease}`}
          style={{ left: `${t}%`, opacity: on ? 1 : 0 }}
        >
          <div className={`mx-auto w-0.5 rounded-full bg-ink ${compact ? "h-8" : "h-10"}`} />
        </div>
        {/* today marker */}
        <div
          className={`absolute ${compact ? "top-2" : "top-3"} -translate-x-1/2 ${ease}`}
          style={{ left: `${b}%`, opacity: on ? 1 : 0 }}
        >
          <div
            className={`rounded-full border-[3px] border-brand bg-surface ${compact ? "h-5 w-5" : "h-6 w-6"}`}
          />
        </div>
      </div>

      <div className="mt-1 flex justify-between font-mono text-[10px] tracking-[0.08em] text-ink-3">
        <span>400</span><span>1000</span><span>1600</span>
      </div>

      <dl className={`mt-4 grid grid-cols-3 gap-2 ${compact ? "text-[11px]" : "text-[12px]"}`}>
        <Legend swatch="bg-brand/45" label={assumed ? "Today (est.)" : "Today"} value={baseline} />
        <Legend swatch="bg-progress" label="On this pace" value={projected} />
        <Legend swatch="bg-ink" label="Target" value={target} />
      </dl>
    </div>
  );
}

function Legend({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-ink-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${swatch}`} />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="tnum mt-0.5 font-display text-[19px] font-bold tracking-[-0.03em]">{value}</dd>
    </div>
  );
}
