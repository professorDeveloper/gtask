"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { LogoLink } from "@/components/ui/Logo";
import { StickyBar } from "@/components/ui/StickyBar";
import type { Report } from "@/lib/readiness/types";
import { TONE } from "./tones";

/** Sticky header. Once the hero scrolls away, a mini score chip keeps the result in sight. */
export function ResultHeader({ report, showSummary }: { report: Report; showSummary: boolean }) {
  const tone = TONE[report.band.tone];
  return (
    <StickyBar>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <LogoLink />
        <AnimatePresence>
          {showSummary && (
            <motion.a
              href="#top"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface py-1 pr-3.5 pl-1 elev-2"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              aria-label={`Readiness ${report.readiness}, ${report.band.name}. Back to top`}
            >
              <span className={`tnum grid h-9 w-9 place-items-center rounded-full font-mono text-caption font-bold ${tone.fill} ${
                report.band.tone === "brand" || report.band.tone === "gap" ? "text-white" : "text-ink"
              }`}>
                {report.readiness}
              </span>
              <span className={`text-caption font-bold ${tone.ink}`}>{report.band.name}</span>
            </motion.a>
          )}
        </AnimatePresence>
        <Button
          href="/check"
          variant="ghost"
          size="sm"
          icon="refresh"
          aria-label="New check"
          className={`whitespace-nowrap max-[359px]:hidden ${showSummary ? "max-sm:w-11 max-sm:px-0 max-sm:[&>span]:sr-only" : ""}`}
        >
          <span>New check</span>
        </Button>
      </div>
    </StickyBar>
  );
}
