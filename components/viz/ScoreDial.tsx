"use client";

import { useEffect, useState } from "react";
import type { Band } from "@/lib/readiness/types";

const toneVar: Record<Band["tone"], string> = {
  gap: "var(--gap)",
  progress: "var(--progress)",
  brand: "var(--brand)",
  ready: "var(--ready)",
};

/** Readiness out of 100, drawn as a 270° arc that fills once on mount. */
export function ScoreDial({
  score, band, size = 232, label = "Readiness",
}: { score: number; band: Band; size?: number; label?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = instant ? 1 : Math.min(1, (now - start) / 1400);
      setValue(score * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const stroke = size / 16;
  const r = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const sweep = 0.75; // 270°
  const arc = circumference * sweep;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--surface-2)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={toneVar[band.tone]} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(arc * value) / 100} ${circumference}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="tnum font-display font-bold leading-none tracking-[-0.055em]"
          style={{ fontSize: size * 0.34 }}
        >
          {Math.round(value)}
        </span>
        <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{label}</span>
      </div>
    </div>
  );
}
