import { refine } from "@/lib/readiness/refine";
import { daysToTest } from "@/lib/readiness/countdown";
import type { Submission } from "@/lib/store";
import type { Band } from "@/lib/readiness/types";
import { FACE } from "./fonts";
import { HEX, MESH_STRONG, TONE } from "./palette";

/**
 * The share card: a Wrapped-style poster of one report, drawn for the
 * image renderer (satori). Satori speaks a flexbox subset of CSS with
 * inline styles only, so this file uses no Tailwind and no CSS vars.
 *
 *   og       1200×630  link previews (opengraph-image, twitter-image)
 *   portrait 1080×1350 "Save image" / native share
 */

export type CardFormat = "og" | "portrait";

export const CARD_SIZE: Record<CardFormat, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
};

export type CardData = {
  readiness: number;
  bandName: string;
  tone: Band["tone"];
  archetype: string;
  baseline: number;
  target: number;
  gap: number;
  measured: boolean;
  countdown: string;
  site: string;
};

export const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gtask.vercel.app").host;
  } catch {
    return "gtask.vercel.app";
  }
})();

/** The card shows the refined report, exactly as the result page does. */
export function cardDataFor(submission: Submission): CardData {
  const { report } = refine(submission.answers, submission.refinements);
  const countdown = daysToTest({ weeks: report.weeks, booked: !report.flags.unbooked }, submission.createdAt);
  return {
    readiness: report.readiness,
    bandName: report.band.name,
    tone: report.band.tone,
    archetype: report.archetype,
    baseline: report.baseline,
    target: report.target,
    gap: report.target - report.baseline,
    measured: report.measured,
    countdown: countdown.label,
    site: SITE_HOST,
  };
}

/* ---- pieces ----------------------------------------------------------- */

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill={HEX.surface} />
      <circle
        cx="16" cy="16" r="9" stroke={HEX.brand} strokeWidth="3.2" strokeLinecap="round"
        strokeDasharray="42 57" transform="rotate(-48 16 16)" fill="none"
      />
      <circle cx="23.1" cy="20.4" r="3.2" fill={HEX.sunny} />
    </svg>
  );
}

function Brand({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * scale }}>
      <Mark size={40 * scale} />
      <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 34 * scale, letterSpacing: -1.4 * scale, color: "#fff" }}>
        GTask
      </div>
      <div style={{ width: 2, height: 26 * scale, background: "rgba(255,255,255,0.35)", marginLeft: 4 * scale, marginRight: 4 * scale }} />
      <div style={{ fontFamily: FACE.body, fontWeight: 500, fontSize: 22 * scale, color: "rgba(255,255,255,0.82)" }}>
        SAT readiness report
      </div>
    </div>
  );
}

/** Score ring. A minimum 4% arc keeps very low scores reading as an arc. */
function Ring({ data, size }: { data: CardData; size: number }) {
  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const share = Math.max(0.04, Math.min(1, data.readiness / 100));
  const tone = TONE[data.tone];
  return (
    <div style={{ display: "flex", position: "relative", width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F2F1EC" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.fill} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${c * share} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: size * 0.4, lineHeight: 1, letterSpacing: -size * 0.02, color: HEX.ink }}>
          {String(data.readiness)}
        </div>
        <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: size * 0.07, color: HEX.ink3, marginTop: size * 0.02, letterSpacing: 1 }}>
          OUT OF 100
        </div>
      </div>
    </div>
  );
}

function BandPill({ data, scale = 1 }: { data: CardData; scale?: number }) {
  const tone = TONE[data.tone];
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12 * scale, alignSelf: "flex-start",
        background: tone.soft, borderRadius: 999, padding: `${10 * scale}px ${22 * scale}px ${10 * scale}px ${16 * scale}px`,
      }}
    >
      <div style={{ width: 16 * scale, height: 16 * scale, borderRadius: 999, background: tone.fill }} />
      <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 24 * scale, color: tone.ink }}>
        {`${data.bandName} band`}
      </div>
    </div>
  );
}

function Sticker({ label, scale = 1, rotate = 6 }: { label: string; scale?: number; rotate?: number }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10 * scale,
        background: HEX.sunny, color: HEX.ink, borderRadius: 999,
        padding: `${12 * scale}px ${24 * scale}px`, transform: `rotate(${rotate}deg)`,
        boxShadow: "0 10px 24px -8px rgba(28,25,23,0.35)",
        fontFamily: FACE.display, fontWeight: 800, fontSize: 28 * scale, letterSpacing: -0.6 * scale,
      }}
    >
      <div style={{ width: 14 * scale, height: 14 * scale, borderRadius: 999, background: HEX.ink }} />
      {label}
    </div>
  );
}

function Stat({ label, value, note, scale = 1 }: { label: string; value: string; note?: string; scale?: number }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", flex: 1,
        background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.22)",
        borderRadius: 22 * scale, padding: `${16 * scale}px ${20 * scale}px`,
      }}
    >
      <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 16 * scale, letterSpacing: 2 * scale, color: "rgba(255,255,255,0.78)" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 * scale, marginTop: 4 * scale }}>
        <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 44 * scale, lineHeight: 1.1, letterSpacing: -1.2 * scale, color: "#fff" }}>
          {value}
        </div>
        {note && (
          <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 18 * scale, color: "rgba(255,255,255,0.78)" }}>{note}</div>
        )}
      </div>
    </div>
  );
}

function Stats({ data, scale = 1 }: { data: CardData; scale?: number }) {
  const met = data.gap <= 0;
  return (
    <div style={{ display: "flex", gap: 14 * scale, width: "100%" }}>
      <Stat label="TODAY" value={String(data.baseline)} note={data.measured ? undefined : "est."} scale={scale} />
      <Stat label="TARGET" value={String(data.target)} scale={scale} />
      <Stat label={met ? "TARGET MET" : "GAP"} value={met ? `+${Math.abs(data.gap)}` : String(data.gap)} note="pts" scale={scale} />
    </div>
  );
}

function Eyebrow({ children, scale = 1 }: { children: string; scale?: number }) {
  return (
    <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 20 * scale, letterSpacing: 3 * scale, color: "rgba(255,255,255,0.78)" }}>
      {children}
    </div>
  );
}

function Frame({ children, format }: { children: React.ReactNode; format: CardFormat }) {
  const { width, height } = CARD_SIZE[format];
  return (
    <div
      style={{
        display: "flex", position: "relative", width, height, overflow: "hidden",
        backgroundColor: HEX.brand, backgroundImage: MESH_STRONG, color: "#fff",
      }}
    >
      {/* soft sunny glow: the celebration colour, kept to one corner */}
      <div
        style={{
          position: "absolute", width: width * 0.7, height: width * 0.7, right: -width * 0.28, bottom: -width * 0.36,
          borderRadius: 9999, backgroundImage: "radial-gradient(circle, rgba(255,210,63,0.30) 0%, rgba(255,210,63,0) 65%)",
        }}
      />
      {/* dotted "answer sheet" texture along the top edge */}
      <div
        style={{
          position: "absolute", left: 0, top: 0, width, height: height * 0.45,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.16) 1.6px, rgba(255,255,255,0) 2px)",
          backgroundSize: "26px 26px",
        }}
      />
      {children}
    </div>
  );
}

function ScoreCard({ data, width, ringSize }: { data: CardData; width: number; ringSize: number }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", width,
        background: HEX.surface, borderRadius: 40, padding: `${width * 0.1}px ${width * 0.08}px ${width * 0.08}px`,
        boxShadow: "0 30px 60px -20px rgba(12,20,80,0.55), 0 0 0 1px rgba(28,25,23,0.06)",
      }}
    >
      <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: ringSize * 0.065, letterSpacing: 2.5, color: HEX.ink2, marginBottom: ringSize * 0.07 }}>
        READINESS SCORE
      </div>
      <Ring data={data} size={ringSize} />
    </div>
  );
}

/* ---- layouts ---------------------------------------------------------- */

function OgCard({ data }: { data: CardData }) {
  return (
    <Frame format="og">
      <div style={{ display: "flex", width: "100%", height: "100%", padding: "56px 64px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <Brand />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Eyebrow>MY SAT ARCHETYPE</Eyebrow>
            <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 76, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
              {data.archetype}
            </div>
            <BandPill data={data} />
          </div>
          <Stats data={data} />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
          <div style={{ display: "flex", transform: "rotate(-3deg)" }}>
            <ScoreCard data={data} width={380} ringSize={290} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: 8, right: -8 }}>
            <Sticker label={data.countdown} scale={0.85} />
          </div>
          <div style={{ display: "flex", position: "absolute", bottom: -6, right: 8, fontFamily: FACE.body, fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.85)" }}>
            {`Check yours · ${data.site}`}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PortraitCard({ data }: { data: CardData }) {
  return (
    <Frame format="portrait">
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "72px 72px 64px" }}>
        <Brand scale={1.15} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 60, position: "relative" }}>
          <div style={{ display: "flex", transform: "rotate(-3deg)" }}>
            <ScoreCard data={data} width={500} ringSize={370} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: -24, right: 150 }}>
            <Sticker label={data.countdown} scale={1.05} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
          <Eyebrow scale={1.1}>MY SAT ARCHETYPE</Eyebrow>
          <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: data.archetype.length > 16 ? 84 : 96, lineHeight: 0.98, letterSpacing: -3.8, color: "#fff" }}>
            {data.archetype}
          </div>
          <BandPill data={data} scale={1.15} />
        </div>
        <div style={{ display: "flex", flex: 1 }} />
        <Stats data={data} scale={1.15} />
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36,
            fontFamily: FACE.body, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.85)",
          }}
        >
          <div>Five questions. One honest score.</div>
          <div>{data.site}</div>
        </div>
      </div>
    </Frame>
  );
}

/** Shown when a report id does not resolve: still on-brand, never a broken preview. */
function FallbackCard({ format }: { format: CardFormat }) {
  const portrait = format === "portrait";
  return (
    <Frame format={format}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: portrait ? 72 : "56px 64px" }}>
        <Brand scale={portrait ? 1.15 : 1} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: portrait ? 110 : 84, lineHeight: 0.98, letterSpacing: -3.5, color: "#fff", maxWidth: portrait ? 900 : 780 }}>
            How ready are you for the SAT?
          </div>
          <div style={{ display: "flex" }}>
            <Sticker label="Five questions · 60 seconds" rotate={-3} scale={portrait ? 1.1 : 0.9} />
          </div>
        </div>
        <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.85)" }}>{SITE_HOST}</div>
      </div>
    </Frame>
  );
}

export function ShareCard({ data, format }: { data: CardData | null; format: CardFormat }) {
  if (!data) return <FallbackCard format={format} />;
  return format === "og" ? <OgCard data={data} /> : <PortraitCard data={data} />;
}
