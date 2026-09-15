import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Surface";
import { Reveal } from "@/components/ui/Reveal";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "Answer five questions",
    body: "Test date, last practice score, weekly hours, weakest section, target score. Nothing else is asked, and nothing else is needed.",
  },
  {
    icon: "gauge",
    title: "The rules do the arithmetic",
    body: "Your gap is converted into study hours, compared against the hours you actually have, and scored out of 100. The same answers always produce the same score.",
  },
  {
    icon: "flag",
    title: "Leave with a plan, not a mood",
    body: "A readiness band, where your current pace really lands you, a phased schedule, and the four things to do next — in order.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHead
        eyebrow="How it works"
        title="Sixty seconds in, a score report out."
        lede="No sign-up wall, no email capture, no waiting for a consultant to call you back."
      />
      <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 90}>
            <li className="elev-1 relative flex h-full flex-col rounded-[18px] border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name={s.icon} size={21} />
                </span>
                <span className="tnum font-mono text-[11px] tracking-[0.16em] text-ink-3">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-[21px] leading-tight font-bold">{s.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-2">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
