"use client";

import { useMemo, useState } from "react";
import { evaluate } from "@/lib/readiness/engine";
import { QUESTIONS } from "@/lib/readiness/questions";
import type { Answers } from "@/lib/readiness/types";
import { Segmented } from "@/components/ui/Segmented";
import { Badge, Card } from "@/components/ui/Surface";
import { GapScale } from "@/components/viz/GapScale";

const SHORT: Record<string, string> = {
  t_4w: "< 4 weeks", t_2m: "1–2 months", t_6m: "3–6 months", t_none: "Not booked",
  b_none: "Not measured", b_low: "< 1000", b_mid: "1000–1190", b_high: "1200–1340", b_top: "1350+",
  h_low: "< 2 h", h_mid: "2–5 h", h_high: "6–10 h", h_max: "10 h +",
  f_rw: "Reading & Writing", f_math: "Math", f_both: "Both", f_pace: "Pacing",
  g_1200: "1200+", g_1300: "1300+", g_1400: "1400+", g_1500: "1500+",
};

const tone: Record<string, string> = {
  proximity: "bg-brand",
  capacity: "bg-progress",
  habit: "bg-ready",
};

/** The scoring rules, wired to controls. Change an input, watch the score move. */
export function MethodLab() {
  const [answers, setAnswers] = useState<Answers>(["t_6m", "b_mid", "h_high", "f_math", "g_1400"]);
  const report = useMemo(() => evaluate(answers), [answers]);

  const set = (i: number) => (id: string) =>
    setAnswers((prev) => prev.map((a, j) => (j === i ? id : a)) as Answers);

  return (
    <Card elevation={2} className="overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_0.92fr]">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-7 lg:border-r lg:border-b-0">
          {QUESTIONS.map((q, i) => (
            <Segmented
              key={q.id}
              label={q.label}
              value={answers[i]}
              options={q.options.map((o) => ({ id: o.id, label: SHORT[o.id] ?? o.label }))}
              onChange={set(i)}
            />
          ))}
        </div>

        <div className="well p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] tracking-[0.14em] text-ink-3 uppercase">Readiness</p>
              <p className="tnum font-display text-[64px] leading-[0.85] font-bold tracking-[-0.055em]">
                {report.readiness}
              </p>
            </div>
            <Badge tone={report.band.tone}>{report.band.name}</Badge>
          </div>

          <div className="mt-6">
            <GapScale
              baseline={report.baseline}
              projected={report.projected}
              target={report.target}
              assumed={!report.measured}
              compact
            />
          </div>

          <ul className="mt-7 flex flex-col gap-3.5">
            {report.components.map((c) => (
              <li key={c.key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-medium">{c.label}</span>
                  <span className="tnum shrink-0 font-mono text-ink-3">
                    {c.points} / {c.weight}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface/70">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${tone[c.key]}`}
                    style={{ width: `${Math.min(100, c.value * 100)}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-[11px] text-ink-3">{c.explain}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-line pt-4 font-mono text-[11.5px] leading-relaxed text-ink-2">
            {report.components.map((c) => `${c.weight}×${c.value.toFixed(2)}`).join(" + ")}
            {report.flags.pacingIssue ? " + 3" : ""}
            {!report.measured ? " × 0.9" : ""} = <b className="text-ink">{report.readiness}</b>
          </p>
        </div>
      </div>
    </Card>
  );
}
