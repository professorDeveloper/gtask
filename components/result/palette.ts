import type { BlockKind } from "@/lib/readiness/calendar";

/** One colour per kind of study, shared by the week calendar and the study split. */
export const KIND_FILL: Record<BlockKind, string> = {
  rw: "bg-brand",
  math: "bg-accent-2",
  timed: "bg-ink",
  review: "bg-sunny",
  rest: "bg-line-strong",
};

/** "45m", "1h", "1h 30m". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Compact form for narrow calendar columns: "45m", "2h", "1:30". */
export function shortMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}h`;
}
