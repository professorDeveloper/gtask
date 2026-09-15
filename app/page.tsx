import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhatYouGet } from "@/components/landing/WhatYouGet";
import { MethodLab } from "@/components/landing/MethodLab";
import { BandLadder } from "@/components/landing/BandLadder";
import { Faq } from "@/components/landing/Faq";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SectionHead } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { evaluate } from "@/lib/readiness/engine";
import { countSubmissions } from "@/lib/store";
import type { Answers } from "@/lib/readiness/types";

/** A fixed answer set, run through the real engine, so the hero shows real output. */
const SAMPLE: Answers = ["t_2m", "b_mid", "h_high", "f_math", "g_1400"];

export const revalidate = 120;

export default async function HomePage() {
  const sample = evaluate(SAMPLE);
  const checks = await countSubmissions().catch(() => 0);

  return (
    <>
      <SiteNav />
      <main>
        <Hero sample={sample} />
        <HowItWorks />
        <WhatYouGet sample={sample} />

        <section id="method" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <SectionHead
              eyebrow="The method"
              title="Move an input. Watch the score move."
              lede="This is the scoring engine itself, running in your browser. Three weighted rules, one calibration constant, no model in the loop."
            />
            <Reveal className="mt-12">
              <MethodLab />
            </Reveal>
            <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
              Proximity is how close your baseline already sits to your target. Capacity compares the
              study hours your gap costs with the hours left before test day. Habit is your weekly
              rhythm. A pacing-only weakness adds 3; a weakness in both sections subtracts 5; an
              unmeasured baseline discounts the whole score by 10%.
            </p>
          </div>
        </section>

        <BandLadder />
        <Faq />

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <Reveal>
            <div className="sheet-texture elev-2 relative overflow-hidden rounded-[26px] border border-line px-6 py-14 text-center md:py-20">
              <div className="absolute inset-0 bg-surface/85" aria-hidden />
              <div className="relative">
                <h2 className="mx-auto max-w-[18ch] text-[clamp(30px,6.4vw,48px)] leading-[1.02] font-bold text-balance">
                  Five questions is a cheap way to find out.
                </h2>
                <p className="mx-auto mt-5 max-w-[46ch] text-[16.5px] leading-relaxed text-ink-2">
                  Most SAT plans fail on arithmetic, not ambition. Check yours before the calendar
                  checks it for you.
                </p>
                <div className="mt-9 flex justify-center">
                  <Button href="/check" size="lg" icon="arrowRight">Start the check</Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter checks={checks} />
    </>
  );
}
