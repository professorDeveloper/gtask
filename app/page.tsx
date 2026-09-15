import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { StoryFiveQuestions } from "@/components/landing/StoryFiveQuestions";
import { GapStory } from "@/components/landing/GapStory";
import { MethodLab } from "@/components/landing/MethodLab";
import { BandLadder } from "@/components/landing/BandLadder";
import { SharePreview } from "@/components/landing/SharePreview";
import { BuiltToBrief } from "@/components/landing/BuiltToBrief";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Badge, SectionHead } from "@/components/ui/Surface";
import { evaluate, FOCUS_ADJUSTMENT, NEUTRAL_MODIFIERS } from "@/lib/readiness/engine";
import { weeklyPlan } from "@/lib/readiness/calendar";
import { summarizeSession, type SessionStats } from "@/lib/readiness/session";
import { daysToTest } from "@/lib/readiness/countdown";
import { TIMELINE } from "@/lib/readiness/questions";
import { countSubmissions } from "@/lib/store";
import type { Answers } from "@/lib/readiness/types";

/** A fixed answer set, run through the real engine, so every sample on the page is real output. */
const SAMPLE: Answers = ["t_2m", "b_mid", "h_high", "f_math", "g_1400"];

/** A plausible, focused one-sitting run for the session-stats preview. */
const SAMPLE_SESSION: SessionStats = {
  totalMs: 74_000,
  perQuestionMs: [9_000, 14_000, 11_000, 25_000, 15_000],
  tabLeaves: 0,
  awayMs: 0,
  answerChanges: 1,
};

const RULES = [
  { name: "Proximity", weight: 40, body: "How close your baseline already sits to the target." },
  { name: "Capacity", weight: 38, body: "Hours left before test day against the hours your gap costs." },
  { name: "Habit", weight: 22, body: "Your weekly rhythm, counted up to 10 hours." },
];

export const revalidate = 120;

export default async function HomePage() {
  const sample = evaluate(SAMPLE);
  const plan = weeklyPlan(sample);
  const countdown = daysToTest(TIMELINE[SAMPLE[0] as keyof typeof TIMELINE]).label;
  const checks = await countSubmissions().catch(() => 0);

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="overflow-x-clip">
        <Hero sample={sample} />
        <StoryFiveQuestions answers={SAMPLE} sample={sample} />
        <GapStory sample={sample} />

        <section id="method" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 md:py-24">
          <SectionHead
            eyebrow="The method"
            title="Move an input. Watch the score move."
            lede="This is the scoring engine itself, running in your browser. Three weighted rules, one calibration constant, no model in the loop."
          />
          <div className="mt-10">
            <MethodLab />
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {RULES.map((r) => (
              <li key={r.name} className="rounded-card border border-line bg-surface p-4 elev-1">
                <p className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-title font-bold">{r.name}</span>
                  <span className="tnum font-mono text-caption text-ink-2">up to {r.weight}</span>
                </p>
                <p className="mt-1 text-caption text-ink-2">{r.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="w-full text-caption text-ink-2 sm:w-auto">Adjustments</span>
            <Badge tone="brand">Pacing only +{FOCUS_ADJUSTMENT.pace}</Badge>
            <Badge tone="gap">Weak in both sections −{Math.abs(FOCUS_ADJUSTMENT.both)}</Badge>
            <Badge tone="progress">No practice test yet ×{NEUTRAL_MODIFIERS.unmeasuredDiscount}</Badge>
          </div>
        </section>

        <BandLadder />
        <SharePreview
          sample={sample}
          plan={plan}
          session={summarizeSession(SAMPLE_SESSION)}
          perQuestionMs={SAMPLE_SESSION.perQuestionMs}
          countdown={countdown}
        />
        <BuiltToBrief checks={checks} ruleWeights={RULES.map((r) => r.weight)} />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
