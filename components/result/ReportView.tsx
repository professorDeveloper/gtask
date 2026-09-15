"use client";

import { useMemo, useRef, useState } from "react";
import { MotionConfig, useInView } from "motion/react";
import { refineReport } from "@/app/actions";
import { ShareActions } from "@/components/share/ShareActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import { daysToTest } from "@/lib/readiness/countdown";
import { refine } from "@/lib/readiness/refine";
import type { SessionStats as Stats } from "@/lib/readiness/session";
import type { Answers, Refinements } from "@/lib/readiness/types";
import { GapCard } from "./GapCard";
import { NextMoves, PlanPhases } from "./PlanPhases";
import { RefineCard, type SaveState } from "./RefineCard";
import { ResultHeader } from "./ResultHeader";
import { ResultHero } from "./ResultHero";
import { ResultSection } from "./ResultSection";
import { SessionStats } from "./SessionStats";
import { BAND_ICON, TONE } from "./tones";
import { Transparency } from "./Transparency";
import { WeekCalendar } from "./WeekCalendar";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * The result page. Owns the optional refinements: each change re-scores
 * locally with `refine()` for instant feedback, then saves through the
 * `refineReport` action (whose sanitized answer becomes the state).
 * Everything else only composes.
 */
export function ReportView({
  id, answers, createdAt, initialRefinements, session,
}: {
  id: string;
  answers: Answers;
  createdAt: string;
  initialRefinements: Refinements;
  session: Stats | null;
}) {
  const [refinements, setRefinements] = useState<Refinements>(initialRefinements);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveSeq = useRef(0);

  const { report, accuracy } = useMemo(() => refine(answers, refinements), [answers, refinements]);
  const countdown = daysToTest({ weeks: report.weeks, booked: !report.flags.unbooked }, createdAt);
  const tone = TONE[report.band.tone];

  const heroRef = useRef<HTMLDivElement>(null);
  const heroVisible = useInView(heroRef, { initial: true, margin: "-64px 0px 0px 0px" });

  const save = (next: Refinements) => {
    setRefinements(next);
    setSaveState("saving");
    const seq = ++saveSeq.current;
    refineReport(id, next)
      .then((res) => {
        if (seq !== saveSeq.current) return;
        setRefinements(res.refinements);
        setSaveState("saved");
      })
      .catch(() => {
        if (seq !== saveSeq.current) return;
        setSaveState("error");
        toast({
          id: "refine-save",
          tone: "gap",
          icon: "warning",
          title: "Couldn't save that answer",
          description: "Your report updated here, but the link will show the old version.",
          actions: [{ label: "Try again", variant: "primary", onClick: () => save(next) }],
        });
      });
  };

  return (
    <MotionConfig reducedMotion="user">
      <ResultHeader report={report} showSummary={!heroVisible} />
      <main id="top" className="mx-auto max-w-6xl px-4 pt-2 pb-16 sm:px-6 lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12 lg:pt-6">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div ref={heroRef}>
            <ResultHero id={id} report={report} countdown={countdown} accuracy={accuracy} />
          </div>
          <div className={`mt-3 flex gap-3 rounded-card p-4 ${tone.soft}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface ${tone.ink}`}>
              <Icon name={BAND_ICON[report.band.key]} size={22} />
            </span>
            <p className="text-body text-pretty text-ink-2">
              <b className={`font-bold ${tone.ink}`}>{report.band.name}.</b> {report.band.blurb}
            </p>
          </div>
        </div>

        <div className="mt-8 flex min-w-0 flex-col gap-12 lg:mt-0">
          <RefineCard
            answers={answers}
            refinements={refinements}
            accuracy={accuracy}
            readiness={report.readiness}
            saveState={saveState}
            onChange={save}
          />

          <ResultSection id="gap" eyebrow="The gap" icon="target" title="Where your pace lands you">
            <GapCard report={report} />
          </ResultSection>

          <ResultSection id="week" eyebrow="Weekly plan" icon="calendarCheck" title="Your week, day by day">
            <WeekCalendar report={report} refinements={refinements} />
          </ResultSection>

          <ResultSection id="session" eyebrow="How you took the check" icon="timer" title="Session stats">
            <SessionStats session={session} />
          </ResultSection>

          <ResultSection id="phases" eyebrow="The plan" icon="flag" title="Your schedule, in phases">
            <PlanPhases report={report} />
          </ResultSection>

          <ResultSection id="moves" eyebrow="Actions" icon="lightning" title="Do these next, in order">
            <NextMoves report={report} />
          </ResultSection>

          <ResultSection id="scored" eyebrow="Transparency" icon="shield" title="How it was scored">
            <p className="-mt-1 mb-4 text-body text-ink-2">
              No AI, no guesswork: the same answers always give the same score. Here is every term.
            </p>
            <Transparency report={report} answers={answers} refinements={refinements} />
          </ResultSection>

          <div id="share" className="scroll-mt-20">
            <ShareActions id={id} report={report} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <Button href="/check" icon="refresh" variant="ghost" size="md" className="-ml-3">
                Run it again
              </Button>
              <p className="flex items-center gap-2 text-caption text-ink-3">
                <Icon name="lock" size={15} />
                Checked {dateFmt.format(new Date(createdAt))} · saved anonymously
              </p>
            </div>
          </div>

          <p className="border-t border-line pt-5 text-caption text-ink-3">
            GTask is a planning tool, not a prediction. Scores come from fixed rules applied to your answers.
          </p>
        </div>
      </main>
    </MotionConfig>
  );
}
