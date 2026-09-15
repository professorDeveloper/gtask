"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/ui/motion";

/**
 * Scroll-in reveal for the result page. `initial` never branches on reduced
 * motion, so server and client HTML match; ReportView's
 * `<MotionConfig reducedMotion="user">` removes the movement for those users.
 * `data-reveal` keeps the no-JS fallback from the root layout working.
 */
export function SectionReveal({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode;
  /** milliseconds */
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...SPRING.soft, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
