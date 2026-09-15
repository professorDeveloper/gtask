"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { TAP_SCALE } from "@/components/ui/motion";
import { usePrefersReducedMotion } from "@/components/ui/motion";

const MotionLink = motion.create(Link);

/** The closing brand moment: mesh panel, sparkles drifting with the scroll. */
export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = [
    useTransform(scrollYProgress, [0, 1], [60, -60]),
    useTransform(scrollYProgress, [0, 1], [-30, 70]),
    useTransform(scrollYProgress, [0, 1], [90, -40]),
  ];
  const sparkles = [
    { className: "top-6 left-[7%]", size: 28 },
    { className: "top-1/3 right-[6%] hidden md:block", size: 38 },
    { className: "bottom-8 right-[14%]", size: 22 },
  ];

  return (
    <section className="px-4 pb-16 md:px-5 md:pb-24">
      <div
        ref={ref}
        className="mesh-strong grain relative mx-auto max-w-6xl overflow-hidden rounded-[28px] px-6 py-16 text-center elev-3 md:py-24"
      >
        {sparkles.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute ${s.className}`}
            style={reduce ? undefined : { y: drift[i] }}
          >
            <Icon name="sparkle" size={s.size} weight="fill" className="text-sunny" />
          </motion.span>
        ))}

        <h2 className="relative mx-auto max-w-[15ch] text-display font-bold text-balance">
          Five questions is a cheap way to find out.
        </h2>
        <p className="relative mx-auto mt-5 max-w-[42ch] text-lede text-white/90">
          Most SAT plans fail on arithmetic, not ambition. Check yours before the calendar does.
        </p>
        <MotionLink
          href="/check"
          whileTap={reduce ? undefined : { scale: TAP_SCALE }}
          className="cta-on-mesh relative mt-9 inline-flex min-h-14 items-center gap-2 rounded-full bg-surface px-7 text-lede font-bold text-brand elev-3 transition-colors hover:bg-brand-soft"
        >
          Start the check
          <Icon name="arrowRight" size={20} weight="bold" />
        </MotionLink>
        <p className="relative mt-4 text-caption text-white/90">No account · about 60 seconds</p>
      </div>
    </section>
  );
}
