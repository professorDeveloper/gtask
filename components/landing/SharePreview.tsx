"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card, Eyebrow, SectionHead } from "@/components/ui/Surface";
import { Sticker } from "@/components/ui/Sticker";
import { SPRING } from "@/components/ui/motion";
import { BLOCK_LABELS, type BlockKind, type DayPlan } from "@/lib/readiness/calendar";
import { FOCUS_LEVELS, formatDuration, type SessionSummary } from "@/lib/readiness/session";
import type { Report } from "@/lib/readiness/types";

const KIND_FILL: Record<BlockKind, string> = {
  rw: "bg-brand",
  math: "bg-accent-2",
  timed: "bg-progress",
  review: "bg-ready",
  rest: "bg-line",
};

const hours = (minutes: number) => `${Math.round((minutes / 60) * 10) / 10}h`;

/** What comes back: the share card, the session stats and the week, all from the sample. */
export function SharePreview({
  sample, plan, session, perQuestionMs, countdown,
}: {
  sample: Report;
  plan: DayPlan[];
  session: SessionSummary;
  perQuestionMs: number[];
  countdown: string;
}) {
  return (
    <section className="mesh grain cv-share">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead
          eyebrow="What comes back · sample"
          title="A report you will actually want to share."
          lede="A card for your group chat, how you took the check, and a week of study counting down to test day."
        />

        <div className="mt-10 grid items-center gap-8 lg:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <ShareCard sample={sample} />
          <div className="flex min-w-0 flex-col gap-4">
            <SessionCard session={session} perQuestionMs={perQuestionMs} />
            <WeekCard plan={plan} countdown={countdown} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShareCard({ sample }: { sample: Report }) {
  return (
    <div className="relative mx-auto w-full max-w-[290px] py-4 sm:max-w-[330px]">
      <motion.div
        initial={{ opacity: 0, rotate: -10, y: 48 }}
        whileInView={{ opacity: 1, rotate: -3, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={SPRING.gentle}
        className="mesh-strong grain flex aspect-[4/5] flex-col rounded-[28px] p-6 elev-4"
      >
        <div className="flex items-center justify-between text-micro font-semibold tracking-[0.08em] uppercase">
          <span>GTask · SAT readiness</span>
          <Icon name="sparkle" size={18} weight="fill" className="text-sunny" />
        </div>
        <div className="relative mx-auto mt-5 grid aspect-square w-[68%] place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-[225deg]" aria-hidden>
            <circle cx="50" cy="50" r="44" fill="none" pathLength={1} strokeDasharray="0.75 1" strokeWidth="8" strokeLinecap="round" className="stroke-white/20" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-sunny"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: (sample.readiness / 100) * 0.75 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="text-center">
            <p className="numeral-card tnum font-display font-bold tracking-[-0.06em]">{sample.readiness}</p>
            <p className="text-micro font-semibold text-white/90">readiness</p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="rounded-full bg-white px-3 py-1 text-caption font-bold text-brand">{sample.band.name}</span>
          <span className="font-display text-title font-bold">{sample.archetype}</span>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/25 pt-4 text-center">
          {[
            { v: sample.gap, l: "pts to go" },
            { v: sample.weeks, l: "weeks" },
            { v: sample.weeklyNeed, l: "h / week" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col-reverse">
              <dt className="text-micro text-white/90">{s.l}</dt>
              <dd className="tnum font-display text-title font-bold">{s.v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
      <div className="absolute right-0 bottom-0 z-10">
        <Sticker tone="sunny" icon="download" rotate={6} delay={0.2}>Save image</Sticker>
      </div>
      <div className="absolute top-0 -left-1 z-10">
        <Sticker tone="surface" icon="share" rotate={-6} delay={0.35}>One tap share</Sticker>
      </div>
    </div>
  );
}

function SessionCard({ session, perQuestionMs }: { session: SessionSummary; perQuestionMs: number[] }) {
  const level = FOCUS_LEVELS[session.focus];
  const max = Math.max(...perQuestionMs, 1);
  const tiles = [
    { l: "Total time", v: formatDuration(session.totalMs) },
    { l: "Tab switches", v: String(session.tabLeaves) },
    { l: "Answers changed", v: String(session.answerChanges) },
    { l: "Longest think", v: `Q${session.longestIndex + 1} · ${formatDuration(session.longestMs)}` },
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow icon="timer">How you took the check</Eyebrow>
        <Badge tone={level.tone} icon="eye">{level.label}</Badge>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <dl className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <div key={t.l} className="well flex flex-col-reverse rounded-control px-3 py-2.5">
              <dt className="text-micro text-ink-3">{t.l}</dt>
              <dd className="tnum font-display text-title font-bold tracking-[-0.03em]">{t.v}</dd>
            </div>
          ))}
        </dl>

        <div aria-label="Seconds spent on each question" role="img" className="flex h-28 items-end gap-2 sm:w-44">
          {perQuestionMs.map((ms, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="tnum font-mono text-micro text-ink-3">{Math.round(ms / 1000)}s</span>
              <motion.span
                className={`w-full origin-bottom rounded-t-md ${i === session.longestIndex ? "bg-progress" : "bg-brand/30"}`}
                style={{ height: `${(ms / max) * 64}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...SPRING.pop, delay: i * 0.07 }}
              />
              <span className="text-micro font-semibold text-ink-2">Q{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-micro text-ink-3">
        <Icon name="info" size={15} /> Measured while you answer. It never changes the score.
      </p>
    </Card>
  );
}

function WeekCard({ plan, countdown }: { plan: DayPlan[]; countdown: string }) {
  const kinds = (["rw", "math", "timed", "review"] as const).filter((k) => plan.some((d) => d.blocks.some((b) => b.kind === k)));
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow icon="calendarDots">Your week, Mon–Sun</Eyebrow>
        <Badge tone="sunny" icon="hourglass">{countdown}</Badge>
      </div>

      <ol className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {plan.map((d, i) => {
          const test = d.blocks.some((b) => b.kind === "timed");
          return (
            <motion.li
              key={d.day}
              className="flex min-w-0 flex-col items-center gap-1.5"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ ...SPRING.pop, delay: 0.1 + i * 0.06 }}
            >
              <span className="text-micro font-semibold text-ink-3">{d.short.slice(0, 2)}</span>
              <span
                className={`grid aspect-square w-full max-w-12 place-items-center rounded-full text-micro font-bold ${
                  d.rest
                    ? "border-2 border-dashed border-line-strong text-ink-3"
                    : test
                      ? "bg-progress text-ink"
                      : "bg-brand-soft text-brand"
                }`}
              >
                {d.rest ? <Icon name="coffee" size={16} label="Rest" /> : <span className="tnum">{hours(d.totalMinutes)}</span>}
              </span>
              <span className="flex h-1.5 w-full max-w-12 overflow-hidden rounded-full bg-line" aria-hidden>
                {d.blocks.map((b, j) => (
                  <span key={j} className={KIND_FILL[b.kind]} style={{ flexGrow: b.minutes }} />
                ))}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {kinds.map((k) => (
          <li key={k} className="flex items-center gap-1.5 text-micro text-ink-2">
            <span className={`h-2 w-2 rounded-full ${KIND_FILL[k]}`} /> {BLOCK_LABELS[k]}
          </li>
        ))}
      </ul>
    </Card>
  );
}
