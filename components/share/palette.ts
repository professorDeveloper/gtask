import type { Band } from "@/lib/readiness/types";

/**
 * Literal hex values from the token table in app/globals.css.
 * The image renderer (satori) cannot read CSS custom properties, so the
 * share card mirrors the tokens here. Keep the two in sync.
 */
export const HEX = {
  paper: "#FAFAF7",
  surface: "#FFFFFF",
  ink: "#1A1917",
  ink2: "#4A4843",
  ink3: "#66625A",
  line: "#E4E1D8",
  brand: "#1552F0",
  brandDeep: "#0B3BC4",
  brandBright: "#3B73FF",
  accent2: "#7C5CFF",
  accent2Deep: "#5A3BE0",
  sunny: "#FFD23F",
} as const;

type Tone = { fill: string; soft: string; ink: string };

/** Band tone → fill (ring, dot), soft (pill ground) and ink (pill text). */
export const TONE: Record<Band["tone"], Tone> = {
  gap: { fill: "#EF4444", soft: "#FDE8E8", ink: "#B91C1C" },
  progress: { fill: "#F59E0B", soft: "#FFF4DC", ink: "#B45309" },
  brand: { fill: "#1552F0", soft: "#E8EEFF", ink: "#1552F0" },
  ready: { fill: "#10B981", soft: "#DDF5EA", ink: "#047857" },
};

/** The .mesh-strong recipe from globals.css, as a satori background. */
export const MESH_STRONG = [
  `radial-gradient(80% 70% at 0% 0%, ${HEX.brandBright} 0%, rgba(59,115,255,0) 60%)`,
  `radial-gradient(70% 70% at 100% 10%, ${HEX.accent2} 0%, rgba(124,92,255,0) 62%)`,
  `radial-gradient(60% 60% at 85% 100%, ${HEX.accent2Deep} 0%, rgba(90,59,224,0) 60%)`,
  `radial-gradient(50% 50% at 10% 100%, ${HEX.brandDeep} 0%, rgba(11,59,196,0) 70%)`,
].join(", ");
