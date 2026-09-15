import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { describeAnswers } from "@/lib/readiness/engine";
import { SUBTOPIC } from "@/lib/readiness/refine";
import type { Answers, Refinements, Report } from "@/lib/readiness/types";
import { breakdownFor } from "./breakdown";

const BAR: Record<string, string> = { proximity: "bg-brand", capacity: "bg-accent-2", habit: "bg-ready" };
const signed = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/**
 * The score's arithmetic, line by line, behind a disclosure. Every term
 * shown is a term the engine added; the last line is the report's own score.
 */
export function Transparency({
  report, answers, refinements,
}: { report: Report; answers: Answers; refinements: Refinements }) {
  const b = breakdownFor(report, refinements);

  return (
    <div className="rounded-card border border-line bg-surface elev-1">
      <Disclosure title="Show the arithmetic" icon="function" defaultOpen={false}>
        <ul className="flex flex-col gap-4">
          {b.rows.map((r) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-body font-semibold text-ink">{r.label}</span>
                <span className="tnum shrink-0 font-mono text-caption font-semibold text-ink">
                  {fmt(r.points)} <span className="text-ink-3">/ {r.weight}</span>
                </span>
              </div>
              <div className="well mt-2 h-2 overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${BAR[r.key] ?? "bg-brand"}`} style={{ width: `${r.value * 100}%` }} />
              </div>
              <p className="mt-1.5 text-caption text-ink-3">{r.why}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 overflow-x-auto rounded-control bg-surface-2 p-4">
          <table className="w-full min-w-[280px] font-mono text-caption">
            <tbody className="[&_td]:py-1">
              {b.rows.map((r) => (
                <tr key={r.key}>
                  <td className="pr-3 text-ink-2">{r.weight} × {r.value.toFixed(2)}</td>
                  <td className="tnum text-right text-ink">{fmt(r.points)}</td>
                </tr>
              ))}
              {b.adjustments.map((a) => (
                <tr key={a.label}>
                  <td className="pr-3 font-sans text-ink-2">{a.label}</td>
                  <td className={`tnum text-right ${a.points > 0 ? "text-ready-ink" : "text-gap-ink"}`}>{signed(a.points)}</td>
                </tr>
              ))}
              <tr className="border-t border-line-strong">
                <td className="pr-3 pt-2 text-ink-2">Subtotal</td>
                <td className="tnum pt-2 text-right text-ink">{fmt(b.subtotal)}</td>
              </tr>
              {b.discount && (
                <tr>
                  <td className="pr-3 font-sans text-ink-2">× {b.discount.factor} · {b.discount.why}</td>
                  <td className="tnum text-right text-ink">{fmt(Math.round(b.subtotal * b.discount.factor * 10) / 10)}</td>
                </tr>
              )}
              {b.clamped && (
                <tr>
                  <td className="pr-3 font-sans text-ink-2">
                    {b.clamped === "cap" ? "Capped at 99 — no plan is a guarantee" : "Floored at 3"}
                  </td>
                  <td className="text-right text-ink-3">↦</td>
                </tr>
              )}
              <tr className="border-t border-line-strong">
                <td className="pr-3 pt-2 font-sans font-bold text-ink">Readiness</td>
                <td className="tnum pt-2 text-right text-title font-bold text-ink">{b.readiness}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {refinements.subtopic && (
          <p className="mt-3 text-caption text-ink-3">
            Naming {SUBTOPIC[refinements.subtopic].label} also trims the hours the gap costs by 5% when it sits in your weak section.
          </p>
        )}
      </Disclosure>

      <div className="border-t border-line">
        <Disclosure title="What you answered" icon="listChecks" defaultOpen={false}>
          <dl className="flex flex-col gap-3">
            {describeAnswers(answers).map((a) => (
              <div key={a.question}>
                <dt className="text-caption text-ink-3">{a.question}</dt>
                <dd className="text-body font-semibold text-ink">{a.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-caption text-ink-3">
            Want the reasoning behind the weights?{" "}
            <Link href="/#method" className="inline-flex min-h-11 items-center font-semibold text-brand underline-offset-4 hover:underline">
              See the method
            </Link>
          </p>
        </Disclosure>
      </div>
    </div>
  );
}

function Disclosure({
  title, icon, children, defaultOpen,
}: { title: string; icon: "function" | "listChecks"; children: React.ReactNode; defaultOpen: boolean }) {
  return (
    <details className="result-details group" open={defaultOpen}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 text-body font-semibold text-ink marker:content-none hover:text-brand sm:px-6 [&::-webkit-details-marker]:hidden">
        <Icon name={icon} size={20} className="text-brand" />
        <span className="flex-1">{title}</span>
        <Icon name="chevron" size={18} className="text-ink-3 transition-transform duration-300 group-open:-rotate-180" />
      </summary>
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
    </details>
  );
}
