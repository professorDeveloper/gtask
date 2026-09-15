import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Surface";

const items = [
  {
    q: "Is this an AI tool?",
    a: "No. The score comes from three weighted rules and a single calibration constant — about 45 study hours to move 100 SAT points. Nothing is generated; the same five answers always return the same report, and every step of the arithmetic is printed on it.",
  },
  {
    q: "How accurate is the projection?",
    a: "It is a planning estimate, not a prediction. It assumes your reported hours hold and that practice is deliberate. Its job is to show whether the plan is even arithmetically possible — which is where most SAT plans quietly fail.",
  },
  {
    q: "What happens to my answers?",
    a: "They are stored anonymously so the check can be calibrated against real usage. No name, no email, no account — just the five answers and the report they produced.",
  },
  {
    q: "I have never taken a practice test. Can I still use it?",
    a: "Yes, and the report will say so. A conservative baseline is assumed, the score is discounted, and the first action you get is to sit one full timed test.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHead eyebrow="Questions" title="Before you start." />
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="group elev-1 rounded-[18px] border border-line bg-surface px-5 transition-shadow duration-300 open:shadow-[var(--elev-2)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16.5px] font-semibold marker:content-none">
                {it.q}
                <Icon
                  name="chevron"
                  size={19}
                  className="shrink-0 text-ink-3 transition-transform duration-300 group-open:-rotate-180"
                />
              </summary>
              <p className="pb-5 text-[14.5px] leading-relaxed text-ink-2">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
