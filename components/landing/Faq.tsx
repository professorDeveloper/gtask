"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Surface";
import { SPRING } from "@/components/ui/motion";

const ITEMS = [
  {
    q: "Is this an AI tool?",
    a: "No. The score comes from three weighted rules and one calibration constant: about 45 study hours to move 100 SAT points. Nothing is generated. The same answers always return the same report, and the arithmetic is printed on it.",
  },
  {
    q: "Do I have to answer more than five questions?",
    a: "No. Five answers produce the full report. On the report, three optional questions (practice tests taken, weakest sub-topic, running out of time) each apply one more rule and raise the accuracy meter from 70% by 10%. Skip them and nothing is missing.",
  },
  {
    q: "What happens to my answers?",
    a: "They are saved anonymously in a database: the five answers, the report, any optional answers, and how you took the check (time per question, tab switches). No name, no email, no account. The timing is shown back to you as a focus badge and never changes the score.",
  },
  {
    q: "How accurate is the projection?",
    a: "It is a planning estimate, not a prediction. It assumes your reported hours hold and that practice is deliberate. Its job is to show whether the plan is even arithmetically possible, which is where most SAT plans quietly fail.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHead
          eyebrow="Questions"
          title="Before you start."
          lede="Short answers. The arithmetic is printed on the report."
          className="lg:sticky lg:top-24 lg:self-start"
        />
        <ul className="flex flex-col gap-3">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li
                key={it.q}
                className={`rounded-card border border-line bg-surface transition-shadow duration-300 ${isOpen ? "elev-2" : "elev-1"}`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 rounded-card px-5 py-3 text-left text-body font-semibold sm:text-lede"
                  >
                    {it.q}
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={SPRING.soft}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isOpen ? "bg-brand-soft text-brand" : "bg-surface-2 text-ink-2"}`}
                    >
                      <Icon name="chevron" size={17} />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: SPRING.soft, opacity: { duration: 0.2 } }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-body text-ink-2">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
