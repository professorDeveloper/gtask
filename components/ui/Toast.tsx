"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "./Icon";
import { SPRING } from "./motion";

/**
 * A tiny imperative toast system. `<ToastHost/>` is mounted once in the root
 * layout; call `toast({...})` from any client code. A page with a fixed
 * bottom bar sets `--toast-offset` on <html> so toasts sit above it.
 */

export type ToastTone = "neutral" | "brand" | "ready" | "gap" | "sunny";

export type ToastAction = {
  label: string;
  onClick: () => void;
  /** "primary" renders a brand button; default is a quiet text button. */
  variant?: "primary" | "quiet";
};

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  icon?: IconName;
  /** ms before auto-dismiss. 0 keeps it until dismissed. Default 4000, or 0 when actions exist. */
  duration?: number;
  actions?: ToastAction[];
  /** Reusing an id replaces that toast instead of stacking another. */
  id?: string;
};

type ToastItem = ToastOptions & { id: string };

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, number>();
let seq = 0;

const emit = () => listeners.forEach((l) => l());

export function dismissToast(id: string) {
  const t = timers.get(id);
  if (t) window.clearTimeout(t);
  timers.delete(id);
  items = items.filter((i) => i.id !== id);
  emit();
}

/** Shows a toast and returns its id. Actions dismiss the toast after running. */
export function toast(options: ToastOptions): string {
  const id = options.id ?? `t${++seq}`;
  const item: ToastItem = { ...options, id };
  items = [...items.filter((i) => i.id !== id), item].slice(-3);
  const duration = options.duration ?? (options.actions?.length ? 0 : 4000);
  const prev = timers.get(id);
  if (prev) window.clearTimeout(prev);
  if (duration > 0) timers.set(id, window.setTimeout(() => dismissToast(id), duration));
  emit();
  return id;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const toneIcon: Record<ToastTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  brand: "bg-brand-soft text-brand",
  ready: "bg-ready-soft text-ready-ink",
  gap: "bg-gap-soft text-gap-ink",
  sunny: "bg-sunny text-ink",
};

export function ToastHost() {
  const list = useSyncExternalStore(subscribe, () => items, () => items);

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[calc(max(16px,env(safe-area-inset-bottom))+var(--toast-offset,0px))] transition-[padding] duration-300"
    >
      <AnimatePresence initial={false}>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={SPRING.soft}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border border-line bg-surface p-3.5 elev-4"
          >
            {t.icon && (
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-control ${toneIcon[t.tone ?? "neutral"]}`}>
                <Icon name={t.icon} size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-body font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-caption text-ink-3">{t.description}</p>}
              {t.actions && t.actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {t.actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => {
                        a.onClick();
                        dismissToast(t.id);
                      }}
                      className={
                        a.variant === "primary"
                          ? "focus-on-fill inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-caption font-semibold text-brand-ink hover:bg-brand-hover"
                          : "inline-flex min-h-11 items-center rounded-full px-4 text-caption font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink"
                      }
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="-m-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <Icon name="x" size={16} weight="bold" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
