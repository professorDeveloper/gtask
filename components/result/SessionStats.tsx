"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/components/ui/motion";
import { QUESTIONS } from "@/lib/readiness/questions";
import { FOCUS_LEVELS, formatDuration, summarizeSession, type FocusLevel, type SessionStats as Stats } from "@/lib/readiness/session";
import { TONE } from "./tones";

const FOCUS_ICON: Record<FocusLevel, IconName> = {
  focused: "eye",
  "bit-distracted": "coffee",
  distracted: "tabLeave",
};

/** How the check was taken. Shown for interest only — it never touches the score. */
export function SessionStats({ session }: { session: Stats | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const on = reduce || inView;

  if (!session) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface-2/60 p-5 text-body text-ink-2">
        <Icon name="info" size={20} className="text-ink-3" />
        Session stats were not recorded for this report.
      </div>
    );
  }

  const s = summarizeSession(session);
  const level = FOCUS_LEVELS[s.focus];
  const tone = TONE[level.tone];
  const max = Math.max(...session.perQuestionMs, 1);

  return (
    <div ref={ref} className="rounded-card border border-line bg-surface elev-2">
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <motion.span
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${tone.soft} ${tone.ink}`}
          initial={{ scale: 0.5, rotate: -20 }}
          animate={on ? { scale: 1, rotate: 0 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 16 }}
        >
          <Icon name={FOCUS_ICON[s.focus]} size={28} />
        </motion.span>
        <div className="min-w-0">
          <p className="text-micro font-semibold tracking-[0.06em] text-ink-3 uppercase">Focus badge</p>
          <p className={`font-display text-title font-bold ${tone.ink}`}>{level.label}</p>
          <p className="text-caption text-ink-2">{level.blurb}</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 border-y border-line">
        <Tile icon="timer" label="Total time" value={formatDuration(s.totalMs)} />
        <Tile
          icon="tabLeave"
          label="Left the tab"
          value={s.tabLeaves === 0 ? "0" : `${s.tabLeaves}×`}
          sub={s.tabLeaves === 0 ? "stayed put" : `${formatDuration(s.awayMs)} away`}
        />
        <Tile icon="pencil" label="Answers changed" value={String(s.answerChanges)} />
      </dl>

      <div className="p-5 sm:p-6">
        <h3 className="text-caption font-semibold text-ink-2">Time on each question</h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          {session.perQuestionMs.map((ms, i) => {
            const longest = i === s.longestIndex && ms > 0;
            return (
              <li key={i} className="grid grid-cols-[88px_1fr_52px] items-center gap-2.5">
                <span className="truncate text-caption text-ink-2">
                  <b className="font-mono font-semibold text-ink">Q{i + 1}</b> {QUESTIONS[i]?.label}
                </span>
                <span className="well relative h-3 overflow-hidden rounded-full">
                  <motion.span
                    className={`absolute inset-y-0 left-0 origin-left rounded-full ${longest ? "bg-progress" : "bg-brand/70"}`}
                    style={{ width: `${Math.max(3, Math.round((ms / max) * 1000) / 10)}%` }}
                    initial={{ scaleX: 0 }}
                    animate={on ? { scaleX: 1 } : undefined}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="tnum text-right font-mono text-caption font-semibold text-ink">{formatDuration(ms)}</span>
              </li>
            );
          })}
        </ul>
        {s.longestMs > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-control bg-progress-soft px-3 py-2.5 text-caption text-ink-2">
            <Icon name="brain" size={18} className="mt-px text-progress-ink" />
            <span>
              Longest think: <b className="font-semibold text-ink">Q{s.longestIndex + 1} · {QUESTIONS[s.longestIndex]?.label}</b>{" "}
              ({formatDuration(s.longestMs)}, average {formatDuration(s.averageMs)}).
            </span>
          </p>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-micro text-ink-3">
          <Icon name="shield" size={14} />
          Measured in your browser. It does not change your score.
        </p>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col border-r border-line px-3 py-3.5 last:border-r-0 sm:px-5">
      <dt className="order-2 mt-1 flex items-center gap-1 text-micro text-ink-3">
        <Icon name={icon} size={13} className="hidden text-ink-3 min-[400px]:block" />
        <span className="leading-tight">{label}</span>
      </dt>
      <dd className="tnum order-1 font-display text-title leading-tight font-bold tracking-[-0.03em] text-ink">{value}</dd>
      {sub && <dd className="order-3 mt-0.5 truncate text-micro font-semibold text-ink-2">{sub}</dd>}
    </div>
  );
}
