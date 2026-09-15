import { Card, Eyebrow, SectionHead } from "@/components/ui/Surface";
import { Reveal } from "@/components/ui/Reveal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { GapScale } from "@/components/viz/GapScale";
import type { Report } from "@/lib/readiness/types";

const barTone: Record<string, string> = {
  proximity: "bg-brand",
  capacity: "bg-progress",
  habit: "bg-ready",
};

/** Three cards, each showing a real piece of the report it describes. */
export function WhatYouGet({ sample }: { sample: Report }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-24">
      <SectionHead
        eyebrow="What comes back"
        title="One page, three answers."
        lede="Not a grade. A projection, a schedule, and the arithmetic that produced both — for the sample plan below."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Panel
            icon="target"
            title="Where your pace lands"
            body={`This plan buys ${sample.projected - sample.baseline} points — ${sample.shortfall} short of ${sample.target}.`}
          >
            <GapScale
              baseline={sample.baseline}
              projected={sample.projected}
              target={sample.target}
              compact
            />
          </Panel>
        </Reveal>

        <Reveal delay={90}>
          <Panel
            icon="calendar"
            title="A schedule in phases"
            body={`${sample.weeks} weeks split by what each week is for, at ${sample.weeklyNeed} hours a week.`}
          >
            <ol className="flex flex-col gap-2">
              {sample.phases.map((p, i) => (
                <li
                  key={p.name}
                  className="well flex items-center justify-between rounded-xl px-3.5 py-2.5"
                >
                  <span className="flex items-center gap-2.5 text-[13.5px] font-semibold">
                    <span
                      className={`h-2 w-2 rounded-full ${i === 0 ? "bg-brand" : "bg-line-strong"}`}
                    />
                    {p.name}
                  </span>
                  <span className="tnum font-mono text-[11.5px] text-ink-3">
                    {p.weeks} {p.weeks === 1 ? "wk" : "wks"}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </Reveal>

        <Reveal delay={180}>
          <Panel
            icon="layers"
            title="The arithmetic, shown"
            body="Every point of the score is attributable. Nothing is hidden behind a model."
          >
            <ul className="flex flex-col gap-3">
              {sample.components.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="truncate text-ink-2">{c.label}</span>
                    <span className="tnum shrink-0 font-mono text-ink-3">
                      {c.points}/{c.weight}
                    </span>
                  </div>
                  <div className="well mt-1.5 h-1.5 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full ${barTone[c.key]}`}
                      style={{ width: `${c.value * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </section>
  );
}

function Panel({
  icon, title, body, children,
}: { icon: IconName; title: string; body: string; children: React.ReactNode }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon name={icon} size={19} />
      </span>
      <h3 className="mt-4 text-[19px] leading-tight font-bold">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{body}</p>
      <div className="mt-6 border-t border-line pt-5">{children}</div>
      <Eyebrow className="mt-5">From the sample report</Eyebrow>
    </Card>
  );
}
