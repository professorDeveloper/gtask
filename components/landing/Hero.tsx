"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Eyebrow } from "@/components/ui/Surface";
import { Icon } from "@/components/ui/Icon";
import { Sticker } from "@/components/ui/Sticker";
import { CountUp } from "@/components/ui/CountUp";
import { SPRING } from "@/components/ui/motion";
import type { Report } from "@/lib/readiness/types";
import { ScoreRing } from "./ScoreRing";
import { GapLine } from "./GapLine";
import { usePrefersReducedMotion } from "@/components/ui/motion";
import { onJumpClick } from "@/components/ui/jumpTo";

const HEADLINE = "Find out if your SAT plan actually";
const ACCENT = "adds up.";

export function Hero({ sample }: { sample: Report }) {
  return (
    <section className="mesh grain">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 pb-16 md:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:pt-20 lg:pb-28">
        <div>
          <p className="anim-rise inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pr-3.5 pl-1 text-caption font-medium text-ink-2 elev-1">
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-micro font-bold text-brand-ink">Free</span>
            5 questions · 60 seconds · no sign-up
          </p>

          <Headline />

          <p className="anim-rise mt-5 max-w-[44ch] text-lede text-ink-2" style={{ ["--i" as string]: 5 }}>
            Five questions. We turn your points gap into study hours and tell you if your pace closes it.
          </p>

          <div
            className="anim-rise mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4"
            style={{ ["--i" as string]: 6 }}
          >
            <Button href="/check" size="lg" icon="arrowRight">Start the check</Button>
            <a
              href="#method"
              onClick={onJumpClick}
              className="group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-body font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              See how it is scored
              <Icon name="chevron" size={17} className="transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
          </div>

          <ul
            className="anim-rise mt-8 hidden flex-wrap gap-x-5 gap-y-2 text-caption text-ink-3 sm:flex"
            style={{ ["--i" as string]: 7 }}
          >
            <li className="flex items-center gap-1.5"><Icon name="shield" size={16} /> No account, no email</li>
            <li className="flex items-center gap-1.5"><Icon name="layers" size={16} /> Three rules, all shown</li>
            <li className="flex items-center gap-1.5"><Icon name="gauge" size={16} /> Same answers, same score</li>
          </ul>
        </div>

        <SampleCard sample={sample} />
      </div>
    </section>
  );
}

/**
 * The headline rises word by word; screen readers get the sentence once.
 * A CSS animation (opacity + transform only, no per-word blur) so it runs on
 * the compositor from first paint instead of waiting for hydration; the
 * global reduced-motion rule collapses it.
 */
function Headline() {
  const words = [...HEADLINE.split(" ").map((w) => ({ w, accent: false })), ...ACCENT.split(" ").map((w) => ({ w, accent: true }))];
  return (
    <h1 className="mt-6 max-w-[14ch] text-display font-bold">
      <span className="sr-only-text">{`${HEADLINE} ${ACCENT}`}</span>
      <span aria-hidden>
        {words.map(({ w, accent }, i) => (
          <span key={i}>
            <span
              data-reveal
              className={`hero-word inline-block ${accent ? "text-mesh pr-[0.04em]" : ""}`}
              style={{ ["--i" as string]: i }}
            >
              {w}
            </span>{" "}
          </span>
        ))}
      </span>
    </h1>
  );
}

function SampleCard({ sample }: { sample: Report }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 600], [0, -44]);
  const rotateX = useSpring(0, { stiffness: 170, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 170, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const reset = () => { rotateX.set(0); rotateY.set(0); };

  const tiles = [
    { v: sample.requiredHours, suffix: " h", l: "to close the gap" },
    { v: sample.weeklyNeed, suffix: " h", l: "needed / week" },
    { v: sample.shortfall, suffix: "", l: "pts short" },
  ];

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { y: parallax }}
      className={`relative [perspective:1200px] lg:pl-2 ${reduce ? "" : "will-change-transform"}`}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING.gentle, delay: 0.45 }}
      >
        <motion.div
          onPointerMove={onMove}
          onPointerLeave={reset}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          <Card elevation={3} className="relative p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <Eyebrow>Sample report</Eyebrow>
              <Badge tone={sample.band.tone}>{sample.band.name}</Badge>
            </div>

            <div className="mt-4 flex items-center gap-4 sm:gap-6">
              <ScoreRing score={sample.readiness} band={sample.band} size={120} />
              <div className="min-w-0">
                <p className="font-display text-title font-bold tracking-[-0.03em]">
                  {sample.archetype}
                </p>
                <p className="mt-1.5 text-caption text-ink-2">
                  {sample.gap} points to climb, {sample.weeks} weeks left.
                </p>
              </div>
            </div>

            <GapLine
              className="mt-6 border-t border-line pt-5"
              baseline={sample.baseline}
              projected={sample.projected}
              target={sample.target}
              drawn={inView || reduce}
            />

            <dl className="mt-5 grid grid-cols-3 gap-2">
              {tiles.map((t) => (
                <div key={t.l} className="well flex flex-col-reverse rounded-control px-3 py-2.5">
                  <dt className="text-micro text-ink-3">{t.l}</dt>
                  <dd className="font-display text-title font-bold tracking-[-0.03em]">
                    <CountUp value={t.v} startOnView format={(n) => `${Math.round(n)}${t.suffix}`} />
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="absolute -top-4 right-4 z-10" style={{ transform: "translateZ(40px)" }}>
            <Sticker tone="sunny" icon="share" rotate={5} delay={1.1}>Share card inside</Sticker>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
