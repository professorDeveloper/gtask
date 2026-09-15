import type { Band } from "./types";

/** Four readiness bands. A score falls in the first band it does not exceed. */
export const BANDS: Band[] = [
  {
    key: "foundation",
    name: "Foundation",
    max: 39,
    tone: "gap",
    blurb: "The plan does not add up yet. Something has to change — the date, the hours, or the target.",
  },
  {
    key: "building",
    name: "Building",
    max: 64,
    tone: "progress",
    blurb: "The pieces are there but the maths is tight. Most of the gap is still ahead of you.",
  },
  {
    key: "sharpening",
    name: "Sharpening",
    max: 84,
    tone: "brand",
    blurb: "You are close enough that precision beats volume. Protect the habit and fix the leaks.",
  },
  {
    key: "ready",
    name: "Test-ready",
    max: 100,
    tone: "ready",
    blurb: "Your pace already lands you on target. From here it is rehearsal, not learning.",
  },
];

export const bandFor = (readiness: number): Band =>
  BANDS.find((b) => readiness <= b.max) ?? BANDS[BANDS.length - 1];
