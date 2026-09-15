"use client";

import { motion } from "motion/react";
import { Icon, type IconName } from "./Icon";
import { SPRING } from "./motion";

const tones = {
  sunny: "bg-sunny text-ink",
  brand: "bg-brand text-brand-ink",
  ready: "bg-ready text-ink",
  progress: "bg-progress text-ink",
  surface: "bg-surface text-ink border border-line",
} as const;

/**
 * A slightly rotated label that pops in with a spring — for micro-wins,
 * "+10% accuracy", streak counts. Decorative motion is skipped under reduced
 * motion by the root MotionConfig.
 */
export function Sticker({
  children, tone = "sunny", icon, rotate = -4, delay = 0, className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  icon?: IconName;
  /** degrees */
  rotate?: number;
  /** seconds */
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0, rotate: rotate - 12 }}
      animate={{ scale: 1, opacity: 1, rotate }}
      transition={{ ...SPRING.pop, delay }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-bold elev-2 ${tones[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={15} weight="fill" />}
      {children}
    </motion.span>
  );
}
