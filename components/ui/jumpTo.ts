import type Lenis from "lenis";
import type { MouseEvent } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * In-page section jumps. Instead of smooth-scrolling through the page (which
 * drags every scroll-linked story through its whole timeline), the content
 * fades out, the page is placed at the section instantly, and the content
 * fades back in already in its final scroll-linked state.
 */

const OUT_MS = 140;
const IN_MS = 260;
/** Fired on window when a jump starts, so the nav can mark the destination at once. */
export const JUMP_EVENT = "gtask:jump";
/**
 * Fired on window once the page has been placed and scroll listeners have
 * settled, right before the content fades back in. Scroll-linked stories use
 * the pair to snap to their new state instead of animating from the old one.
 */
export const JUMP_LANDED_EVENT = "gtask:jump-landed";

let lenis: Lenis | null = null;
let jumpToken = 0;

/** SmoothScroll registers its Lenis instance so jumps keep Lenis state in sync. */
export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

function frame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/** Content that fades during a jump: the page body, not the sticky header. */
function fadeTargets(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("main, main ~ footer"));
}

function animateAll(els: HTMLElement[], keyframes: Keyframe[], duration: number, easing: string) {
  return Promise.all(
    els.map((el) => el.animate(keyframes, { duration, easing, fill: "forwards" }).finished.catch(() => undefined)),
  );
}

function place(el: HTMLElement) {
  const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin);
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}

function focusHeading(section: HTMLElement) {
  const heading = section.querySelector<HTMLElement>("h1, h2") ?? section;
  if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

type JumpOptions = { animate?: boolean; focus?: boolean; updateHash?: boolean };

/** Jump to the section with this id. Resolves once the destination is shown. */
export async function jumpTo(id: string, { animate = true, focus = true, updateHash = true }: JumpOptions = {}) {
  const section = document.getElementById(id);
  if (!section) return;
  const token = ++jumpToken;
  window.dispatchEvent(new CustomEvent(JUMP_EVENT, { detail: id }));
  if (updateHash && location.hash !== `#${id}`) history.replaceState(history.state, "", `#${id}`);

  const els = animate && !prefersReducedMotion() ? fadeTargets() : [];
  for (const el of els) el.getAnimations().forEach((a) => a.cancel());

  if (els.length) {
    await animateAll(els, [{ opacity: 1 }, { opacity: 0 }], OUT_MS, "ease-in");
    if (token !== jumpToken) return;
  }

  place(section);
  if (focus) focusHeading(section);
  const landed = () => {
    if (token === jumpToken) window.dispatchEvent(new CustomEvent(JUMP_LANDED_EVENT, { detail: id }));
  };
  if (!els.length) {
    void frame().then(frame).then(landed);
    return;
  }

  /* let scroll listeners (motion's useScroll, the sticky stories) settle while hidden */
  await frame();
  await frame();
  if (token !== jumpToken) return;
  landed();

  for (const el of els) el.getAnimations().forEach((a) => a.cancel());
  await animateAll(els, [{ opacity: 0 }, { opacity: 1 }], IN_MS, "cubic-bezier(0.22, 1, 0.36, 1)");
  /* drop the fill-forwards animations so no inline animated state lingers on the page */
  if (token === jumpToken) for (const el of els) el.getAnimations().forEach((a) => a.cancel());
}

/** onClick for `<a href="#id">`: plain clicks jump; modified clicks keep the browser default. */
export function onJumpClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const hash = e.currentTarget.hash;
  const id = hash.startsWith("#") ? decodeURIComponent(hash.slice(1)) : "";
  if (!id || !document.getElementById(id)) return;
  e.preventDefault();
  void jumpTo(id);
}
