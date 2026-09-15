import { BANDS } from "@/lib/readiness/bands";
import { SectionHead } from "@/components/ui/Surface";
import { Reveal } from "@/components/ui/Reveal";

const swatch = { gap: "bg-gap", progress: "bg-progress", brand: "bg-brand", ready: "bg-ready" } as const;

export function BandLadder() {
  return (
    <section id="bands" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <SectionHead
          eyebrow="The four bands"
          title="A score of 100 is not the goal. Landing on target is."
          lede="Readiness measures one thing: whether your current plan gets you to your target score by your test date."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {BANDS.map((band, i) => {
            const from = i === 0 ? 0 : BANDS[i - 1].max + 1;
            return (
              <Reveal key={band.key} delay={i * 70}>
                <article className="h-full rounded-[18px] border border-line bg-paper p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[21px] font-bold">{band.name}</h3>
                    <span className="tnum shrink-0 font-mono text-[11.5px] text-ink-3">
                      {from}–{band.max}
                    </span>
                  </div>
                  {/* the bands drawn to scale, this one filled */}
                  <div className="mt-4 flex gap-1" aria-hidden>
                    {BANDS.map((b, j) => (
                      <span
                        key={b.key}
                        style={{ flexGrow: b.max - (j === 0 ? 0 : BANDS[j - 1].max) }}
                        className={`h-1.5 rounded-full ${j === i ? swatch[band.tone] : "bg-surface-2"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{band.blurb}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
