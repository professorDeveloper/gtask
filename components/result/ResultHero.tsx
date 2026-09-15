"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { SPRING, usePrefersReducedMotion } from "@/components/ui/motion";
import { burst, celebrate } from "@/components/ui/confetti";
import { ScoreDial } from "@/components/viz/ScoreDial";
import { BANDS } from "@/lib/readiness/bands";
import type { Countdown } from "@/lib/readiness/countdown";
import type { Report } from "@/lib/readiness/types";
import { CountdownChip } from "./CountdownChip";
import { WarmHalo, WarmSticker } from "./Celebration";
import { BAND_ICON, TONE } from "./tones";

const rank = (key: string) => BANDS.findIndex((b) => b.key === key);

/** Celebrate a report once per browser; repeat visits still count up. */
function firstVisit(id: string): boolean {
  try {
    const key = `gtask:celebrated:${id}`;
    if (window.localStorage.getItem(key)) return false;
    window.localStorage.setItem(key, "1");
  } catch {
    /* storage blocked: celebrate anyway */
  }
  return true;
}

/**
 * The reveal: the dial counts up on the brand mesh, the band badge unlocks
 * with a spring when the number lands, then confetti (Sharpening, Test-ready)
 * or a warm halo and sticker (Foundation, Building). Re-scores from the
 * refine card animate the dial from its current number and flash the delta.
 */
export function ResultHero({
  id, report, countdown, accuracy,
}: { id: string; report: Report; countdown: Countdown; accuracy: number }) {
  const reduce = usePrefersReducedMotion();
  const dialRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ score: number; band: string } | null>(null);
  const [unlocked, setUnlocked] = useState(0);
  const [warm, setWarm] = useState(false);
  const [delta, setDelta] = useState<{ n: number; key: number } | null>(null);

  const { band } = report;
  const tone = TONE[band.tone];
  const surplus = Math.max(0, report.baseline - report.target);
  const verdict = report.gap === 0
    ? surplus > 0
      ? `Your baseline is already ${surplus} points above ${report.target}. The job now is protecting it until test day.`
      : `You are sitting right on ${report.target}. Rehearsal, not new content, keeps you there.`
    : report.verdict;

  const onSettled = (score: number) => {
    const prev = last.current;
    last.current = { score, band: band.key };
    setUnlocked((n) => n + 1);

    if (!prev) {
      if (!firstVisit(id)) return;
      void celebrate(band.key).then((fired) => {
        if (!fired && !reduce) {
          setWarm(true);
          window.setTimeout(() => setWarm(false), 2800);
        }
      });
      return;
    }
    if (score !== prev.score) {
      const key = Date.now();
      setDelta({ n: score - prev.score, key });
      window.setTimeout(() => setDelta((d) => (d?.key === key ? null : d)), 2600);
    }
    if (rank(band.key) > rank(prev.band) && dialRef.current) void burst(dialRef.current);
  };

  return (
    <section
      aria-labelledby="result-title"
      className="mesh-strong grain relative overflow-hidden rounded-card px-5 pt-5 pb-6 elev-3 sm:px-8 sm:pt-7 sm:pb-8"
    >
      <div className="flex justify-center">
        <CountdownChip countdown={countdown} />
      </div>

      <div ref={dialRef} className="relative mx-auto mt-6 w-fit">
        <WarmHalo active={warm} />
        <WarmSticker band={band.key} show={warm} />
        <div className="relative rounded-full bg-surface p-3 elev-4">
          <ScoreDial score={report.readiness} band={band} size={212} intro onSettled={onSettled} />
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.key}
                className={`tnum absolute top-5 right-3 inline-flex min-h-7 items-center rounded-full px-2.5 font-mono text-caption font-bold elev-2 ${
                  delta.n > 0 ? "bg-ready text-ink" : "bg-gap-soft text-gap-ink"
                }`}
                initial={{ opacity: 0, y: 8, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={SPRING.pop}
              >
                {delta.n > 0 ? `+${delta.n}` : delta.n}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* band unlock */}
        <div className="relative -mt-5 flex h-11 justify-center">
          <motion.p
            key={`${band.key}-${unlocked > 0 ? "on" : "off"}`}
            data-reveal
            className={`relative inline-flex min-h-11 items-center gap-2 rounded-full bg-surface pr-4 pl-1.5 text-body font-bold whitespace-nowrap text-ink ring-4 elev-3 ${tone.ring}`}
            initial={{ opacity: 0, scale: 0.6, y: 6 }}
            animate={unlocked > 0 || reduce ? { opacity: 1, scale: 1, y: 0 } : undefined}
            transition={SPRING.pop}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-full ${tone.soft} ${tone.ink}`}>
              <Icon name={BAND_ICON[band.key]} size={18} />
            </span>
            {band.name}
          </motion.p>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-md text-center">
        <p className="text-micro font-semibold tracking-[0.08em] text-white uppercase">Your archetype</p>
        <h1 id="result-title" className="mt-1.5 font-display text-h2 font-bold text-balance text-white">
          {report.archetype}
        </h1>
        <p className="mt-3 text-body text-pretty text-white">{verdict}</p>
      </div>

      <div className="mt-5 flex justify-center">
        <a
          href="#refine"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-white/12 px-4 text-caption font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Icon name="gauge" size={17} />
          <span className="tnum">{accuracy}% accurate</span>
          <span aria-hidden className="text-white/70">·</span>
          {accuracy < 100 ? "Sharpen it" : "Fully tuned"}
          <Icon name="caretRight" size={14} weight="bold" />
        </a>
      </div>
    </section>
  );
}
