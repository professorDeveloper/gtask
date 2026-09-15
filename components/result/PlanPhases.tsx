import { Icon } from "@/components/ui/Icon";
import { SectionReveal as Reveal } from "./SectionReveal";
import type { Report } from "@/lib/readiness/types";

/** The phases as a timeline starting "Now", each with its hours against today's. */
export function PlanPhases({ report }: { report: Report }) {
  return (
    <ol className="relative flex flex-col gap-3">
      <span className="absolute top-8 bottom-8 left-[15px] w-0.5 rounded-full bg-line" aria-hidden />
      {report.phases.map((p, i) => {
        const diff = Math.round((p.hoursPerWeek - report.hoursPerWeek) * 10) / 10;
        return (
          <li key={p.name} className="relative flex gap-3">
            <span
              className={`relative z-10 mt-5 grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-caption font-bold ring-4 ring-paper ${
                i === 0 ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-2"
              }`}
              aria-hidden
            >
              {i + 1}
            </span>
            <Reveal delay={i * 80} className="min-w-0 flex-1">
              <div className="rounded-card border border-line bg-surface p-4 elev-1 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {i === 0 && (
                    <span className="inline-flex min-h-6 items-center rounded-full bg-brand px-2 text-micro font-bold text-brand-ink">
                      Now
                    </span>
                  )}
                  <h3 className="font-display text-title font-bold">{p.name}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-surface-2 px-2 text-micro font-semibold text-ink-2">
                    <Icon name="calendar" size={13} />
                    {p.weeks} {p.weeks === 1 ? "week" : "weeks"}
                  </span>
                  <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-surface-2 px-2 text-micro font-semibold text-ink-2">
                    <Icon name="clock" size={13} />
                    {p.hoursPerWeek} h / week
                  </span>
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 text-micro font-semibold ${
                      diff > 0 ? "bg-gap-soft text-gap-ink" : "bg-ready-soft text-ready-ink"
                    }`}
                  >
                    {diff > 0 ? `+${diff} h vs now` : "within your hours"}
                  </span>
                </div>
                <p className="mt-2.5 text-body text-pretty text-ink-2">{p.detail}</p>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

/** The next moves, numbered, first one highlighted. */
export function NextMoves({ report }: { report: Report }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {report.moves.map((m, i) => (
        <li key={m.head}>
          <Reveal delay={i * 70}>
            <div
              className={`flex gap-3.5 rounded-card border p-4 sm:p-5 ${
                i === 0 ? "border-brand/30 bg-brand-soft/60" : "border-line bg-surface elev-1"
              }`}
            >
              <span
                className={`tnum grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-caption font-bold ${
                  i === 0 ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-2"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-body leading-snug font-bold text-ink">{m.head}</p>
                <p className="mt-1 text-caption text-pretty text-ink-2">{m.body}</p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
