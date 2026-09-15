"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { BANDS } from "@/lib/readiness/bands";
import type { Band } from "@/lib/readiness/types";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Surface";
import { useScrollStory } from "./useScrollStory";

const FILL: Record<Band["tone"], string> = { gap: "bg-gap", progress: "bg-progress", brand: "bg-brand", ready: "bg-ready" };
/* desktop staircase: every band one step higher than the last */
const STAIR = ["md:mb-0", "md:mb-12", "md:mb-24", "md:mb-36"];

/** The four bands as a staircase that climbs into place as it scrolls by. */
export function BandLadder() {
  const ref = useRef<HTMLDivElement>(null);
  const { progress: p } = useScrollStory(ref, ["start 85%", "end 60%"]);

  return (
    <section id="bands" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 md:py-24">
      <SectionHead
        eyebrow="The four bands"
        title="A score of 100 is not the goal. Landing on target is."
        lede="Readiness measures one thing: whether your current plan gets you to your target score by test day."
      />

      <div ref={ref} className="relative mt-10 md:mt-14">
        {/* phones: a rail that fills as the bands climb */}
        <div className="absolute top-3 bottom-3 left-[11px] w-0.5 rounded-full bg-line md:hidden" aria-hidden>
          <motion.div className="h-full origin-top rounded-full bg-brand" style={{ scaleY: p }} />
        </div>
        <ol className="flex flex-col gap-4 md:grid md:grid-cols-4 md:items-end">
          {BANDS.map((band, i) => (
            <Step key={band.key} band={band} index={i} progress={p} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ band, index, progress }: { band: Band; index: number; progress: MotionValue<number> }) {
  const start = index * 0.2;
  const y = useTransform(progress, [start, start + 0.3], [56, 0]);
  const opacity = useTransform(progress, [start, start + 0.22], [0, 1]);
  const dot = useTransform(progress, [start + 0.08, start + 0.24], [0.3, 1]);
  const from = index === 0 ? 0 : BANDS[index - 1].max + 1;
  const confetti = band.key === "sharpening" || band.key === "ready";

  return (
    <motion.li style={{ y, opacity }} className={`relative pl-9 md:pl-0 ${STAIR[index]}`}>
      <motion.span
        style={{ scale: dot }}
        className={`absolute top-6 left-0 h-6 w-6 rounded-full border-4 border-paper md:hidden ${FILL[band.tone]}`}
        aria-hidden
      />
      <article className="relative overflow-hidden rounded-card border border-line bg-surface p-5 elev-1">
        <span className={`absolute inset-x-0 top-0 h-1.5 ${FILL[band.tone]}`} aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <span className="tnum font-mono text-caption text-ink-2">
            {from}–{band.max}
          </span>
          {confetti && (
            <span className="inline-flex rotate-6 items-center gap-1 rounded-full bg-sunny px-2 py-0.5 text-micro font-bold text-ink elev-1">
              <Icon name="confetti" size={14} /> Confetti
            </span>
          )}
        </div>
        <h3 className="mt-3 text-title font-bold">{band.name}</h3>
        <p className="mt-2 text-body text-ink-2">{band.blurb}</p>
        <p className="mt-4 flex items-center gap-1.5 text-micro text-ink-3">
          <Icon name={confetti ? "sparkle" : "coffee"} size={15} />
          {confetti ? "Revealed with a celebration" : "Revealed with a warm pep talk"}
        </p>
      </article>
    </motion.li>
  );
}
