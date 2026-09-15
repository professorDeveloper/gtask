"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useInView, type MotionValue, type Transition } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/components/ui/motion";

/* ------------------------------------------------------------------
   The gap bar: GTask's one score visualization.
   One recessed track, filled in stacked layers that all start at the
   left edge, so only widths ever move (no seams between segments):
     short  soft gap tint + hairline, 0 → target   (what is still missing)
     pace   light brand→violet, 0 → projected      (what this pace earns)
     today  solid brand, 0 → baseline              (where the student is)
   A met target turns the flag green; a baseline past the target shows
   the surplus as a ready-green stretch.
   ------------------------------------------------------------------ */

export const SCALE_MIN = 400;
export const SCALE_MAX = 1600;

export const scalePct = (score: number, min = SCALE_MIN, max = SCALE_MAX) =>
  ((Math.min(max, Math.max(min, score)) - min) / (max - min)) * 100;

export type GapModel = {
  /** today already clears the target */
  surplus: boolean;
  /** the pace reaches the target (includes surplus) */
  met: boolean;
  /** where the pace lands (never below today) */
  pace: number;
  /** points still missing after the pace */
  short: number;
  /** points past the target (pace or today) */
  over: number;
};

export function gapModel(baseline: number, projected: number, target: number): GapModel {
  const surplus = baseline >= target;
  const pace = surplus ? baseline : Math.max(projected, baseline);
  return {
    surplus,
    met: pace >= target,
    pace,
    short: Math.max(0, target - pace),
    over: Math.max(0, pace - target),
  };
}

/* ---- geometry ----------------------------------------------------- */

type Size = "sm" | "md" | "lg";
const GEO: Record<Size, { lane: number; track: number; gapToTrack: number; knob: number }> = {
  sm: { lane: 0, track: 8, gapToTrack: 4, knob: 14 },
  md: { lane: 22, track: 10, gapToTrack: 8, knob: 16 },
  lg: { lane: 24, track: 14, gapToTrack: 10, knob: 20 },
};
export const gapGeometry = (size: Size) => {
  const g = GEO[size];
  const trackTop = g.lane + g.gapToTrack;
  return { ...g, trackTop, height: trackTop + g.track + (size === "sm" ? 4 : 6) };
};

/** JetBrains Mono advance at 12px, plus pill padding. Deterministic, so SSR and client agree. */
const pinWidth = (text: string, icon: boolean) => Math.ceil(text.length * 7.3 + 14 + (icon ? 15 : 0));

/**
 * Places pill labels on one lane without overlaps: each wants to sit centred
 * on its value, is pushed right past its left neighbour, then pulled back
 * inside the track. Returns each pill's left edge in px, in input order.
 */
export function layoutPins(pins: { x: number; w: number }[], width: number, gap = 6): number[] {
  const order = pins.map((_, i) => i).sort((a, b) => pins[a].x - pins[b].x || a - b);
  const left = new Array<number>(pins.length);
  let edge = 0;
  for (const i of order) {
    left[i] = Math.max(pins[i].x - pins[i].w / 2, edge);
    edge = left[i] + pins[i].w + gap;
  }
  edge = width;
  for (const i of [...order].reverse()) {
    left[i] = Math.min(left[i], edge - pins[i].w);
    edge = left[i] - gap;
  }
  return left.map((l) => Math.max(0, l));
}

/**
 * Lays out pins by priority (input order = priority, highest first): a pin
 * that cannot sit over its own value without being pushed off it is dropped,
 * lowest priority first, so no label ever floats away from its mark. The
 * legend still carries every value. Returns left edges and visibility.
 */
export function resolvePins(pins: { x: number; w: number }[], width: number) {
  const shown = pins.map(() => true);
  if (!width) return { lefts: pins.map((p) => p.x - p.w / 2), shown };
  for (;;) {
    const idx = pins.map((_, i) => i).filter((i) => shown[i]);
    const placed = layoutPins(idx.map((i) => pins[i]), width);
    const lefts = pins.map((p) => p.x - p.w / 2);
    idx.forEach((i, k) => (lefts[i] = placed[k]));
    /* keep the anchor within the pill, minus the rounded corner */
    const off = idx.filter((i) => pins[i].x < lefts[i] + 5 || pins[i].x > lefts[i] + pins[i].w - 5);
    if (!off.length || idx.length <= 2) return { lefts, shown };
    shown[idx[idx.length - 1]] = false;
  }
}

/** Width of an element in px, kept current. 0 until measured. */
export function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ---- building blocks (shared with the scroll story) --------------- */

export type PinTone = "today" | "pace" | "target" | "met";
const PIN_TONE: Record<PinTone, string> = {
  today: "bg-brand text-brand-ink",
  pace: "bg-accent-2-soft text-accent-2-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-2)_22%,transparent)]",
  target: "bg-ink text-surface",
  met: "bg-ready-ink text-surface",
};
const STEM_TONE: Record<PinTone, string> = {
  today: "bg-brand",
  pace: "bg-accent-2/60",
  target: "bg-ink",
  met: "bg-ready-ink",
};

export type PinSpec = { key: string; tone: PinTone; value: number; label: string; icon?: "flag" | "check" };

export const pinSpec = (p: PinSpec) => ({ ...p, w: pinWidth(p.label, !!p.icon) });

/** A value pill in the lane above the track. `x` is the resolved left edge in px. */
export function Pin({
  spec, pct, offset, width, visible = true, transition, opacity,
}: {
  spec: PinSpec & { w: number };
  pct: number;
  /** resolved left edge (px) minus the anchor (px) */
  offset: number;
  width: number;
  visible?: boolean;
  transition?: Transition;
  opacity?: MotionValue<number>;
}) {
  return (
    <motion.span
      className={`tnum absolute top-0 flex h-[22px] items-center justify-center gap-1 rounded-[7px] font-mono text-micro font-semibold whitespace-nowrap ${PIN_TONE[spec.tone]}`}
      style={{ width: spec.w, opacity }}
      initial={false}
      animate={{ left: `${pct}%`, x: width ? offset : -spec.w / 2, ...(opacity ? {} : { opacity: visible ? 1 : 0 }) }}
      transition={transition}
    >
      {spec.icon && <Icon name={spec.icon} size={12} weight={spec.icon === "check" ? "bold" : "fill"} className="shrink-0" />}
      {spec.label}
    </motion.span>
  );
}

/** Hairline from the lane down to (or through) the track at the exact value. */
export function Stem({
  tone, pct, top, height, visible = true, transition, opacity, strong = false,
}: {
  tone: PinTone; pct: number; top: number; height: number; visible?: boolean;
  transition?: Transition; opacity?: MotionValue<number>; strong?: boolean;
}) {
  return (
    <motion.span
      className={`absolute rounded-full ${strong ? "w-0.5 -ml-px" : "w-px -ml-[0.5px]"} ${STEM_TONE[tone]}`}
      style={{ top, height, opacity }}
      initial={false}
      animate={{ left: `${pct}%`, ...(opacity ? {} : { opacity: visible ? 1 : 0 }) }}
      transition={transition}
    />
  );
}

/** The "you are here" knob sitting on the end of today's fill. */
export function Knob({
  pct, top, size, ready = false, visible = true, transition, opacity,
}: {
  pct: number; top: number; size: number; ready?: boolean; visible?: boolean;
  transition?: Transition; opacity?: MotionValue<number>;
}) {
  return (
    <motion.span
      className={`absolute rounded-full bg-surface elev-1 ${ready ? "border-ready" : "border-brand"}`}
      style={{ top, width: size, height: size, marginLeft: -size / 2, borderWidth: size >= 18 ? 4 : 3, opacity }}
      initial={false}
      animate={{ left: `${pct}%`, ...(opacity ? {} : { scale: visible ? 1 : 0.4, opacity: visible ? 1 : 0 }) }}
      transition={transition}
    />
  );
}

export type SwatchKind = "today" | "pace" | "short" | "ready";
/** Legend chip: a tiny piece of the track, painted with the same class. */
export function Swatch({ kind, className = "" }: { kind: SwatchKind; className?: string }) {
  return <span aria-hidden className={`inline-block h-2.5 w-4 shrink-0 rounded-full gapbar-${kind} ${className}`} />;
}

/** Scale labels with hairline ticks, the ends pinned inside the track. */
export function TickScale({ ticks, min, max }: { ticks: number[]; min: number; max: number }) {
  return (
    <div className="relative mt-1.5 h-5 font-mono text-micro text-ink-3" aria-hidden>
      {ticks.map((tick, i) => {
        const at = scalePct(tick, min, max);
        const align = i === 0 ? "translate-x-0" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2";
        return (
          <span key={tick} className="absolute top-0 h-full" style={{ left: `${at}%` }}>
            <span className={`absolute top-0 h-1 w-px bg-line-strong ${i === 0 ? "left-0" : i === ticks.length - 1 ? "right-0" : "left-0"}`} />
            <span className={`tnum absolute top-1.5 leading-none ${align}`}>{tick}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ---- the bar ------------------------------------------------------ */

const DRAW = { type: "spring", stiffness: 110, damping: 22 } as const;
const LIVE = { type: "spring", stiffness: 260, damping: 32 } as const;

export function GapBar({
  baseline, projected, target, drawn = true, assumed = false, size = "md", pins = true,
  ticks, min = SCALE_MIN, max = SCALE_MAX, className = "",
}: {
  baseline: number;
  projected: number;
  target: number;
  drawn?: boolean;
  assumed?: boolean;
  size?: Size;
  pins?: boolean;
  ticks?: number[];
  min?: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const reduce = usePrefersReducedMotion();
  const m = gapModel(baseline, projected, target);
  const g = gapGeometry(pins ? size : "sm");

  /* stagger only the first draw; later changes (the method lab) move together */
  const [settled, setSettled] = useState(drawn);
  useEffect(() => {
    if (!drawn || settled) return;
    const id = setTimeout(() => setSettled(true), 1600);
    return () => clearTimeout(id);
  }, [drawn, settled]);
  const tr = (delay: number): Transition =>
    reduce ? { duration: 0 } : settled ? LIVE : { ...DRAW, delay };

  const b = scalePct(baseline, min, max);
  const p = scalePct(m.pace, min, max);
  const t = scalePct(target, min, max);
  const w = (v: number) => (drawn ? `${v}%` : "0%");

  /* A stretch that exists always peeks past the knob, so every legend swatch has
     a visible match on the track; the markers follow the visible ends. */
  const px = (n: number) => (width ? (n / width) * 100 : 0);
  const half = g.knob / 2;
  const bAt = m.surplus && m.over > 0 ? Math.min(100, Math.max(b, t + px(half + 5))) : b;
  const pAt = !m.surplus && m.pace > baseline ? Math.min(100, Math.max(p, b + px(half + 5))) : b;
  const tAt = m.surplus ? t : m.met ? pAt : Math.min(100, Math.max(t, (pAt > b ? pAt : b + px(half)) + px(7)));

  const specs = [
    /* priority order: resolvePins drops from the end when labels crowd */
    pinSpec({ key: "today", tone: "today", value: baseline, label: `${assumed ? "~" : ""}${baseline}` }),
    pinSpec({ key: "target", tone: m.met ? "met" : "target", value: target, label: `${target}`, icon: m.met ? "check" : "flag" }),
    ...(!m.surplus && m.pace > baseline && m.pace < target
      ? [pinSpec({ key: "pace", tone: "pace", value: m.pace, label: `${m.pace}` })]
      : []),
  ];
  const at = (key: string) => (key === "today" ? bAt : key === "pace" ? pAt : tAt);
  const anchors = specs.map((s) => ({ x: (at(s.key) / 100) * width, w: s.w }));
  const { lefts, shown } = resolvePins(anchors, width);

  const trackTop = g.trackTop;
  return (
    <div ref={ref} className={`relative select-none ${className}`} style={{ height: g.height }} aria-hidden>
      {/* track */}
      <div className="well absolute inset-x-0 overflow-hidden rounded-full" style={{ top: trackTop, height: g.track }}>
        {!m.met && (
          <motion.div className="gapbar-short absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: w(tAt) }} transition={tr(0.5)} />
        )}
        {m.surplus ? (
          <motion.div className="gapbar-ready absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: w(bAt) }} transition={tr(0.3)} />
        ) : (
          <motion.div className="gapbar-pace absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: w(pAt) }} transition={tr(0.25)} />
        )}
        <motion.div
          className="gapbar-today absolute inset-y-0 left-0 rounded-full"
          initial={false}
          animate={{ width: w(m.surplus ? t : b) }}
          transition={tr(0)}
        />
      </div>

      {/* target: a crisp rule through the track, flagged in the lane */}
      <Stem
        tone={m.met ? "met" : "target"}
        pct={tAt}
        top={pins ? g.lane : trackTop - 4}
        height={(pins ? trackTop - g.lane : 4) + g.track + 4}
        strong
        visible={drawn}
        transition={tr(0.7)}
      />

      {pins &&
        specs.map((s, i) => {
          const pct = at(s.key);
          return (
            <span key={s.key}>
              {s.key !== "target" && (
                <Stem tone={s.tone} pct={pct} top={g.lane} height={trackTop - g.lane} visible={drawn && shown[i]} transition={tr(0.6 + i * 0.08)} />
              )}
              <Pin
                spec={s}
                pct={pct}
                offset={lefts[i] - anchors[i].x}
                width={width}
                visible={drawn && shown[i]}
                transition={tr(0.6 + i * 0.08)}
              />
            </span>
          );
        })}

      <Knob
        pct={bAt}
        top={trackTop + g.track / 2 - g.knob / 2}
        size={g.knob}
        ready={m.surplus}
        visible={drawn}
        transition={reduce ? { duration: 0 } : settled ? LIVE : { type: "spring", stiffness: 420, damping: 20, delay: 0.35 }}
      />

      {ticks && (
        <div className="absolute inset-x-0" style={{ top: g.height }}>
          <TickScale ticks={ticks} min={min} max={max} />
        </div>
      )}
    </div>
  );
}

/** One sentence for screen readers; the drawing itself is aria-hidden. */
export function gapSummary(baseline: number, projected: number, target: number, assumed = false) {
  const m = gapModel(baseline, projected, target);
  const today = `Today ${baseline}${assumed ? " (estimated)" : ""}`;
  if (m.surplus) return `${today}, already ${m.over} above the target of ${target}.`;
  return `${today}. On this pace ${m.pace}. Target ${target}${m.short ? `, ${m.short} points short` : ", on target"}.`;
}

/* ---- legend ------------------------------------------------------- */

export type LegendItem = { key: string; swatch: ReactNode; label: string; value: string; tone?: string };

export function gapLegendItems(baseline: number, projected: number, target: number, assumed = false): LegendItem[] {
  const m = gapModel(baseline, projected, target);
  const today: LegendItem = { key: "today", swatch: <Swatch kind="today" />, label: assumed ? "Today (est.)" : "Today", value: `${baseline}` };
  if (m.surplus) {
    return [
      today,
      { key: "over", swatch: <Swatch kind="ready" />, label: "Above target", value: `+${m.over}`, tone: "text-ready-ink" },
      { key: "target", swatch: <FlagSwatch met />, label: "Target", value: `${target}` },
    ];
  }
  return [
    today,
    { key: "pace", swatch: <Swatch kind="pace" />, label: "On this pace", value: `${m.pace}` },
    m.met
      ? { key: "target", swatch: <FlagSwatch met />, label: `Clears ${target}`, value: m.over ? `+${m.over}` : "On target", tone: "text-ready-ink" }
      : { key: "short", swatch: <Swatch kind="short" />, label: `Short of ${target}`, value: `−${m.short}`, tone: "text-gap-ink" },
  ];
}

function FlagSwatch({ met = false }: { met?: boolean }) {
  return (
    <span aria-hidden className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] text-surface ${met ? "bg-ready-ink" : "bg-ink"}`}>
      <Icon name={met ? "check" : "flag"} size={10} weight={met ? "bold" : "fill"} />
    </span>
  );
}

export function GapLegend({ items, size = "md", className = "" }: { items: LegendItem[]; size?: "md" | "lg"; className?: string }) {
  return (
    <dl className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`} aria-hidden>
      {items.map((it) => (
        <div key={it.key} className="min-w-0">
          <dt className={`flex items-center gap-1.5 text-ink-3 ${size === "lg" ? "text-caption" : "text-micro"}`}>
            {it.swatch}
            <span className="truncate">{it.label}</span>
          </dt>
          <dd className={`tnum mt-1 font-display text-title font-bold tracking-[-0.03em] ${it.tone ?? "text-ink"}`}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---- result page -------------------------------------------------- */

/** The result page's gap: draws once when scrolled into view. */
export function GapScale({
  baseline, projected, target, assumed = false,
}: {
  baseline: number;
  projected: number;
  target: number;
  assumed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <div ref={ref}>
      <p className="sr-only-text">{gapSummary(baseline, projected, target, assumed)}</p>
      <GapBar
        baseline={baseline}
        projected={projected}
        target={target}
        assumed={assumed}
        drawn={reduce || inView}
        ticks={[400, 800, 1200, 1600]}
      />
      <GapLegend className="mt-10" size="lg" items={gapLegendItems(baseline, projected, target, assumed)} />
    </div>
  );
}
