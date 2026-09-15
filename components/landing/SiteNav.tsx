"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { LogoLink } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { StickyBar } from "@/components/ui/StickyBar";
import { SPRING } from "@/components/ui/motion";

const LINKS = [
  { id: "how", label: "How it works" },
  { id: "method", label: "The method" },
  { id: "bands", label: "Bands" },
  { id: "faq", label: "FAQ" },
];

/** Hero CTA is visible above this scroll position, so the header one waits. */
const CTA_AFTER = 520;

export function SiteNav() {
  const { scrollY, scrollYProgress } = useScroll();
  const [showCta, setShowCta] = useState(false);
  const active = useActiveSection();
  useMotionValueEvent(scrollY, "change", (y) => setShowCta(y > CTA_AFTER));

  return (
    <StickyBar>
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5" aria-label="Main">
        <LogoLink size={30} />
        <ul className="ml-2 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id} className="relative">
              {active === l.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-surface-2" transition={SPRING.soft} />
              )}
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "location" : undefined}
                className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-body font-medium transition-colors hover:text-ink ${
                  active === l.id ? "text-ink" : "text-ink-2"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex min-h-11 items-center">
          <AnimatePresence initial={false}>
            {showCta && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                transition={SPRING.pop}
              >
                <Button href="/check" size="sm" icon="arrowRight">
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Start the check</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <motion.div aria-hidden className="h-0.5 origin-left bg-brand/70" style={{ scaleX: scrollYProgress }} />
    </StickyBar>
  );
}

/** The section currently crossing the upper part of the viewport. */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}
