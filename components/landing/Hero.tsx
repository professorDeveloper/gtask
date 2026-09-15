import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Surface";
import { Icon } from "@/components/ui/Icon";
import { GapScale } from "@/components/viz/GapScale";
import { ScoreDial } from "@/components/viz/ScoreDial";
import type { Report } from "@/lib/readiness/types";

export function Hero({ sample }: { sample: Report }) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-texture fade-edges pointer-events-none absolute inset-0 opacity-45" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--brand), transparent 65%)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pt-14 pb-12 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-24 lg:pb-24">
        <div>
          <div className="anim-rise elev-1 inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-[13px] font-medium">
            <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-ink uppercase">
              Free
            </span>
            <span className="text-ink-2">5 questions · 60 seconds · no sign-up</span>
          </div>

          <h1 className="anim-rise mt-7 text-[clamp(40px,9vw,68px)] leading-[0.98] font-bold text-balance" style={{ ["--i" as string]: 1 }}>
            Find out if your SAT plan actually adds up.
          </h1>

          <p className="anim-rise mt-6 max-w-[54ch] text-[17px] leading-relaxed text-ink-2" style={{ ["--i" as string]: 2 }}>
            Tell GTask your test date, your last practice score and the hours you really study.
            It works out what your points gap costs in study hours — and whether your current pace
            closes it before test day.
          </p>

          <div className="anim-rise mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5" style={{ ["--i" as string]: 3 }}>
            <Button href="/check" size="lg" icon="arrowRight" className="w-full sm:w-auto">
              Start the check
            </Button>
            <a
              href="#method"
              className="group inline-flex items-center gap-2 px-1 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              See how it is scored
              <Icon name="chevron" size={17} className="transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
          </div>

          <ul className="anim-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13.5px] text-ink-3" style={{ ["--i" as string]: 4 }}>
            <li className="flex items-center gap-2"><Icon name="shield" size={17} className="text-ink-3" /> No account, no email</li>
            <li className="flex items-center gap-2"><Icon name="layers" size={17} className="text-ink-3" /> Three rules, all shown</li>
            <li className="flex items-center gap-2"><Icon name="gauge" size={17} className="text-ink-3" /> Same answers, same score</li>
          </ul>
        </div>

        <div className="anim-rise relative lg:pl-4" style={{ ["--i" as string]: 3 }}>
          <Card elevation={3} className="relative z-10 overflow-hidden p-5 sm:p-7 lg:p-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">Sample report</p>
              <Badge tone={sample.band.tone}>{sample.band.name}</Badge>
            </div>

            <div className="mt-4 flex items-center gap-5">
              <ScoreDial score={sample.readiness} band={sample.band} size={140} />
              <div className="min-w-0">
                <p className="font-display text-[24px] leading-tight font-bold tracking-[-0.035em]">
                  {sample.archetype}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-snug text-ink-2">
                  {sample.gap} points to climb, {sample.weeks} weeks left.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <GapScale
                baseline={sample.baseline}
                projected={sample.projected}
                target={sample.target}
                compact
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { v: `${sample.requiredHours} h`, l: "gap costs" },
                { v: `${sample.weeklyNeed} h`, l: "per week" },
                { v: `${sample.shortfall}`, l: "points short" },
              ].map((s) => (
                <div key={s.l} className="well rounded-xl px-3 py-3">
                  <p className="tnum font-display text-[20px] font-bold tracking-[-0.03em]">{s.v}</p>
                  <p className="text-[11.5px] text-ink-3">{s.l}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="elev-4 absolute -bottom-5 -left-1 z-20 hidden items-center gap-2 rounded-2xl border border-line px-4 py-3 sm:flex lg:-left-6">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ready-soft text-ready">
              <Icon name="check" size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[13px] leading-tight">
              <b className="font-semibold">Rules, not guesses.</b>
              <br />
              <span className="text-ink-3">Every number is shown on the report.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
