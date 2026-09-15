import Link from "next/link";
import { Badge, Card, Eyebrow } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ScoreDial } from "@/components/viz/ScoreDial";
import { GapScale } from "@/components/viz/GapScale";
import { CopyLink } from "./CopyLink";
import { describeAnswers } from "@/lib/readiness/engine";
import type { Answers, Report } from "@/lib/readiness/types";

const barTone: Record<string, string> = {
  proximity: "bg-brand",
  capacity: "bg-progress",
  habit: "bg-ready",
};

export function ReportView({
  report, answers, createdAt,
}: { report: Report; answers: Answers; createdAt: string }) {
  const date = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-20">
      {/* headline */}
      <section className="anim-rise">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Readiness report · {date}</Eyebrow>
          <Badge tone={report.band.tone}>{report.band.name}</Badge>
        </div>

        <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
          <ScoreDial score={report.readiness} band={report.band} size={196} />
          <div className="text-center sm:text-left">
            <h1 className="text-[clamp(30px,7vw,42px)] leading-[1.03] font-bold text-balance">
              {report.archetype}
            </h1>
            <p className="mt-3.5 text-[16px] leading-relaxed text-ink-2">{report.verdict}</p>
          </div>
        </div>
        <p className="elev-1 mt-7 rounded-2xl border border-line bg-surface px-5 py-4 text-[14.5px] leading-relaxed text-ink-2">
          {report.band.blurb}
        </p>
      </section>

      {/* the gap */}
      <Section title="Where your pace lands you" eyebrow="The gap" delay={1}>
        <Card elevation={2} className="p-5 sm:p-7">
          <GapScale
            baseline={report.baseline}
            projected={report.projected}
            target={report.target}
            assumed={!report.measured}
          />
          <p className="mt-6 border-t border-line pt-5 text-[15px] leading-relaxed text-ink-2">
            {report.shortfall > 0 ? (
              <>
                At <b className="font-semibold text-ink">{report.hoursPerWeek} hours a week</b> for{" "}
                <b className="font-semibold text-ink">{report.weeks} weeks</b>, your pace buys about{" "}
                {report.projected - report.baseline} points. That lands near{" "}
                <b className="font-semibold text-ink">{report.projected}</b> —{" "}
                <b className="font-semibold text-gap">{report.shortfall} short</b> of {report.target}.
              </>
            ) : (
              <>
                Your pace covers the whole {report.gap}-point gap with room to spare. The work now is
                keeping the habit intact until test day.
              </>
            )}
          </p>
        </Card>
      </Section>

      {/* numbers */}
      <Section title="The numbers behind it" eyebrow="Breakdown" delay={2}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={report.gap} label="points to climb" />
          <Stat value={report.weeks} label={report.flags.unbooked ? "weeks (estimated)" : "weeks to test day"} />
          <Stat value={`${report.requiredHours}h`} label="the gap costs" />
          <Stat value={`${report.weeklyNeed}h`} label="needed per week" tone={report.weeklyNeed > report.hoursPerWeek ? "gap" : "ready"} />
        </div>

        <Card className="mt-3 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[16px] font-semibold">Study split</h3>
            <span className="text-[13.5px] text-ink-3">{report.focus.label}</span>
          </div>
          <div className="well mt-4 flex h-3 overflow-hidden rounded-full">
            <span className="bg-brand" style={{ width: `${report.focus.rw}%` }} />
            <span className="bg-progress" style={{ width: `${report.focus.math}%` }} />
          </div>
          <div className="mt-2.5 flex justify-between text-[12.5px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Reading &amp; Writing {report.focus.rw}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-progress" /> Math {report.focus.math}%
            </span>
          </div>
        </Card>
      </Section>

      {/* plan */}
      <Section title="Your schedule, in phases" eyebrow="The plan" delay={3}>
        <ol className="relative flex flex-col gap-3 pl-7">
          <span className="absolute top-3 bottom-3 left-[9px] w-px bg-line-strong/60" aria-hidden />
          {report.phases.map((p, i) => (
            <li key={p.name} className="relative">
              <span
                className={`absolute top-6 -left-[25px] h-[13px] w-[13px] rounded-full border-[3px] border-paper ${
                  i === 0 ? "bg-brand" : "bg-line-strong"
                }`}
                aria-hidden
              />
              <Card className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[18px] font-bold">{p.name}</h3>
                  <span className="tnum font-mono text-[12px] text-ink-3">
                    {p.weeks} {p.weeks === 1 ? "week" : "weeks"} · {p.hoursPerWeek} h / week
                  </span>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{p.detail}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* moves */}
      <Section title="Do these next, in this order" eyebrow="Actions" delay={4}>
        <Card className="divide-y divide-line">
          {report.moves.map((m, i) => (
            <div key={m.head} className="flex gap-4 p-5">
              <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft font-mono text-[12px] font-semibold text-brand">
                {i + 1}
              </span>
              <div>
                <p className="text-[16px] leading-snug font-semibold">{m.head}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{m.body}</p>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {/* how it was scored */}
      <Section title="How this score was calculated" eyebrow="Transparency" delay={5}>
        <Card className="p-5 sm:p-6">
          <ul className="flex flex-col gap-4">
            {report.components.map((c) => (
              <li key={c.key}>
                <div className="flex items-baseline justify-between gap-3 text-[14px]">
                  <span className="font-medium">{c.label}</span>
                  <span className="tnum shrink-0 font-mono text-[12.5px] text-ink-3">
                    {c.points} / {c.weight}
                  </span>
                </div>
                <div className="well mt-2 h-2 overflow-hidden rounded-full">
                  <div className={`h-full rounded-full ${barTone[c.key]}`} style={{ width: `${c.value * 100}%` }} />
                </div>
                <p className="mt-1.5 font-mono text-[11.5px] text-ink-3">{c.explain}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 font-mono text-[12px] leading-relaxed text-ink-2">
            {report.components.map((c) => `${c.weight}×${c.value.toFixed(2)}`).join(" + ")}
            {report.flags.pacingIssue ? " + 3" : ""}
            {!report.measured ? " × 0.9" : ""} = <b className="text-ink">{report.readiness}</b> / 100
          </p>
          <details className="group mt-5 border-t border-line pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13.5px] font-medium text-ink-2 marker:content-none hover:text-ink">
              What you answered
              <Icon
                name="chevron"
                size={17}
                className="text-ink-3 transition-transform duration-300 group-open:-rotate-180"
              />
            </summary>
            <dl className="mt-3 flex flex-col gap-2.5">
              {describeAnswers(answers).map((a) => (
                <div key={a.question} className="text-[13.5px]">
                  <dt className="text-ink-3">{a.question}</dt>
                  <dd className="font-medium">{a.answer}</dd>
                </div>
              ))}
            </dl>
          </details>
        </Card>
      </Section>

      <div className="anim-rise mt-12 flex flex-wrap items-center gap-3" style={{ ["--i" as string]: 6 }}>
        <Button href="/check" icon="refresh" variant="outline" size="md">Run it again</Button>
        <CopyLink />
      </div>

      <p className="mt-8 flex items-center gap-2 text-[13px] text-ink-3">
        <Icon name="lock" size={15} />
        Saved anonymously. This link is the only way back to this report.
      </p>

      <p className="mt-10 border-t border-line pt-6 text-[13.5px] text-ink-3">
        GTask is a planning tool, not a prediction. Want the reasoning?{" "}
        <Link href="/#method" className="text-brand underline-offset-4 hover:underline">
          See the method
        </Link>
        .
      </p>
    </div>
  );
}

function Section({
  title, eyebrow, children, delay,
}: { title: string; eyebrow: string; children: React.ReactNode; delay: number }) {
  return (
    <section className="anim-rise mt-12" style={{ ["--i" as string]: delay }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2.5 mb-5 text-[24px] font-bold tracking-[-0.035em]">{title}</h2>
      {children}
    </section>
  );
}

function Stat({
  value, label, tone = "neutral",
}: { value: string | number; label: string; tone?: "neutral" | "gap" | "ready" }) {
  const color = tone === "gap" ? "text-gap" : tone === "ready" ? "text-ready" : "text-ink";
  return (
    <div className="elev-1 rounded-2xl border border-line bg-surface p-4">
      <p className={`tnum font-display text-[28px] leading-none font-bold tracking-[-0.045em] ${color}`}>
        {value}
      </p>
      <p className="mt-2 text-[12.5px] leading-snug text-ink-3">{label}</p>
    </div>
  );
}
