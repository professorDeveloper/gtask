"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { LogoLink } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { StickyBar } from "@/components/ui/StickyBar";
import { SPRING } from "@/components/ui/motion";
import { JUMP_EVENT, onJumpClick } from "@/components/ui/jumpTo";

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
                onClick={onJumpClick}
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

/**
 * The linked section under a probe line 40% down the viewport, or null when the
 * line is over anything else (the hero, the gap story, the share preview, the
 * "under the hood" section, the final CTA), so the pill never claims a section
 * the reader has already left.
 */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    /* which linked sections currently cross the probe line, in page order */
    const crossing = new Map<string, boolean>(LINKS.map((l) => [l.id, false]));
    const current = () => LINKS.find((l) => crossing.get(l.id))?.id ?? null;

    /* a jump names its destination up front; observer updates wait until it has landed */
    let heldUntil = 0;
    let release = 0;
    const onJump = (e: Event) => {
      setActive((e as CustomEvent<string>).detail);
      heldUntil = performance.now() + 600;
      window.clearTimeout(release);
      release = window.setTimeout(() => setActive(current()), 620);
    };
    window.addEventListener(JUMP_EVENT, onJump);

    const els = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) crossing.set(e.target.id, e.isIntersecting);
        if (performance.now() >= heldUntil) setActive(current());
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(release);
      window.removeEventListener(JUMP_EVENT, onJump);
    };
  }, []);
  return active;
}
