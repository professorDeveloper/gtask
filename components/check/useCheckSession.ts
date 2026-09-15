"use client";

import { useEffect, useSyncExternalStore } from "react";
import { QUESTIONS } from "@/lib/readiness/questions";
import { createCheckSession } from "./checkSession";

/**
 * Browser bindings for the check session: the singleton store, and the
 * page-level side effects of an in-progress check (tab title, favicon dot,
 * return detection, unload guard).
 */

export const checkSession = createCheckSession({
  storage: () => (typeof window === "undefined" ? null : window.localStorage),
});

const COUNT = QUESTIONS.length;
/** Returns shorter than this (a quick alt-tab) do not deserve a toast. */
const RETURN_TOAST_MS = 1500;
const AWAY_ICON = "/icon-away.svg";

export const stepTitle = (index: number) => `Question ${index + 1} of ${COUNT} · GTask`;
export const awayTitle = (index: number) => `⏸ Q${index + 1}/${COUNT} · Your check is waiting`;

export function useCheckSnapshot() {
  return useSyncExternalStore(checkSession.subscribe, checkSession.getSnapshot, checkSession.getServerSnapshot);
}

/**
 * While `active`: keeps the tab title on the current step, marks the tab
 * (title + favicon dot) when hidden, books the time away, and calls
 * `onReturn(awayMs)` when the student comes back after a real absence.
 */
export function useTabAway({
  active,
  index,
  onReturn,
}: {
  active: boolean;
  index: number;
  onReturn: (awayMs: number) => void;
}) {
  useEffect(() => {
    if (!active) return;
    const icons = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    const originals = icons.map((l) => l.getAttribute("href") ?? "");
    const restore = () => {
      document.title = stepTitle(index);
      icons.forEach((l, i) => l.setAttribute("href", originals[i]));
    };

    /* Next applies the route's metadata title after hydration (and on refresh),
       which would overwrite the step title; put ours back whenever that happens. */
    const titleGuard = new MutationObserver(() => {
      const wanted = document.visibilityState === "hidden" ? awayTitle(index) : stepTitle(index);
      if (document.title !== wanted) document.title = wanted;
    });
    titleGuard.observe(document.head, { childList: true, subtree: true, characterData: true });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        checkSession.setHidden(true);
        document.title = awayTitle(index);
        icons.forEach((l) => l.setAttribute("href", AWAY_ICON));
      } else {
        const away = checkSession.setHidden(false);
        restore();
        if (away >= RETURN_TOAST_MS) onReturn(away);
      }
    };
    const onPageHide = () => checkSession.flush();

    restore();
    /* Opened (or restored) in a background tab: that already counts as away. */
    if (document.visibilityState === "hidden") onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      titleGuard.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      icons.forEach((l, i) => l.setAttribute("href", originals[i]));
    };
  }, [active, index, onReturn]);

  /* Put the page's own title back when the check unmounts. */
  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);
}

/** The browser's "Leave site?" dialog, only while `when` is true. */
export function useLeaveGuard(when: boolean) {
  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);
}
