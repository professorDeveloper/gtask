import type { Report } from "@/lib/readiness/types";
import { HEX, MESH_STRONG, TONE } from "./palette";

/**
 * An HTML twin of the portrait share card (card.tsx → PortraitCard), drawn
 * from the report already on screen. It is the preview's base layer: it
 * paints with the page, so the share block is never an empty rectangle,
 * and the rendered PNG cross-fades over it once it arrives.
 *
 * Every length is in card pixels (the PNG is 1080 wide) and scales with the
 * preview through container units: u(72) = 72/1080 of the preview width.
 * Keep the numbers in step with card.tsx.
 */

export type CardPreviewData = {
  readiness: number;
  bandName: string;
  tone: Report["band"]["tone"];
  archetype: string;
  baseline: number;
  target: number;
  gap: number;
  measured: boolean;
  countdown: string;
  site: string;
};

const u = (n: number) => `calc(var(--card-u) * ${n})`;
const DISPLAY = "var(--font-gabarito), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-manrope), ui-sans-serif, system-ui, sans-serif";

export function CardPreview({ data }: { data: CardPreviewData }) {
  return (
    <div
      aria-hidden
      className="share-card-html absolute inset-0 overflow-hidden text-white"
      style={{ backgroundColor: HEX.brand, backgroundImage: MESH_STRONG }}
    >
      {/* sunny glow, bottom right */}
      <div
        className="absolute rounded-full"
        style={{
          width: u(756), height: u(756), right: u(-302), bottom: u(-389),
          backgroundImage: "radial-gradient(circle, rgba(255,210,63,0.30) 0%, rgba(255,210,63,0) 65%)",
        }}
      />
      {/* dotted answer-sheet texture along the top */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "45%",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.16) 1px, rgba(255,255,255,0) 1.3px)",
          backgroundSize: `${u(26)} ${u(26)}`,
        }}
      />

      <div className="relative flex h-full flex-col" style={{ padding: `${u(72)} ${u(72)} ${u(64)}` }}>
        <Brand />

        <div className="relative flex flex-col items-center" style={{ marginTop: u(60) }}>
          <div style={{ transform: "rotate(-3deg)" }}>
            <ScoreCard data={data} />
          </div>
          <div className="absolute" style={{ top: u(-24), right: u(150) }}>
            <Sticker label={data.countdown} />
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: u(20), marginTop: u(56) }}>
          <Eyebrow>MY SAT ARCHETYPE</Eyebrow>
          <div
            className="whitespace-nowrap"
            style={{
              fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.98,
              fontSize: u(data.archetype.length > 16 ? 84 : 96), letterSpacing: u(-3.8),
            }}
          >
            {data.archetype}
          </div>
          <BandPill data={data} />
        </div>

        <div className="flex-1" />
        <Stats data={data} />
        <div
          className="flex items-center justify-between"
          style={{ marginTop: u(36), fontFamily: BODY, fontWeight: 700, fontSize: u(24), color: "rgba(255,255,255,0.85)" }}
        >
          <span>Five questions. One honest score.</span>
          <span>{data.site}</span>
        </div>
      </div>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: u(46), height: u(46) }}>
      <rect width="32" height="32" rx="9" fill={HEX.surface} />
      <circle
        cx="16" cy="16" r="9" stroke={HEX.brand} strokeWidth="3.2" strokeLinecap="round"
        strokeDasharray="42 57" transform="rotate(-48 16 16)" fill="none"
      />
      <circle cx="23.1" cy="20.4" r="3.2" fill={HEX.sunny} />
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex items-center" style={{ gap: u(16) }}>
      <Mark />
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: u(39), letterSpacing: u(-1.6), lineHeight: 1 }}>GTask</span>
      <span style={{ width: u(2), height: u(30), background: "rgba(255,255,255,0.35)", margin: `0 ${u(5)}` }} />
      <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: u(25), color: "rgba(255,255,255,0.82)" }}>SAT readiness report</span>
    </div>
  );
}

function ScoreCard({ data }: { data: CardPreviewData }) {
  const ring = 370;
  const stroke = ring * 0.085;
  const r = (ring - stroke) / 2;
  const c = 2 * Math.PI * r;
  const share = Math.max(0.04, Math.min(1, data.readiness / 100));
  const tone = TONE[data.tone];
  return (
    <div
      className="flex flex-col items-center"
      style={{
        width: u(500), background: HEX.surface, borderRadius: u(40), color: HEX.ink,
        padding: `${u(50)} ${u(40)} ${u(40)}`,
        boxShadow: "0 1.5em 3em -1em rgba(12,20,80,0.55), 0 0 0 1px rgba(28,25,23,0.06)",
        fontSize: u(20),
      }}
    >
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(24), letterSpacing: u(2.5), color: HEX.ink2, marginBottom: u(26) }}>
        READINESS SCORE
      </div>
      <div className="relative grid place-items-center" style={{ width: u(ring), height: u(ring) }}>
        <svg viewBox={`0 0 ${ring} ${ring}`} className="absolute inset-0 h-full w-full">
          <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="#F2F1EC" strokeWidth={stroke} />
          <circle
            cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke={tone.fill} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${c * share} ${c}`}
            transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="tnum" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: u(148), lineHeight: 1, letterSpacing: u(-7.4) }}>
            {data.readiness}
          </span>
          <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(26), color: HEX.ink3, marginTop: u(7), letterSpacing: u(1) }}>
            OUT OF 100
          </span>
        </div>
      </div>
    </div>
  );
}

function Sticker({ label }: { label: string }) {
  return (
    <div
      className="flex items-center whitespace-nowrap"
      style={{
        gap: u(10), background: HEX.sunny, color: HEX.ink, borderRadius: 999,
        padding: `${u(13)} ${u(25)}`, transform: "rotate(6deg)",
        boxShadow: `0 ${u(10)} ${u(24)} ${u(-8)} rgba(28,25,23,0.35)`,
        fontFamily: DISPLAY, fontWeight: 800, fontSize: u(29), letterSpacing: u(-0.6), lineHeight: 1.2,
      }}
    >
      <span className="rounded-full" style={{ width: u(15), height: u(15), background: HEX.ink }} />
      {/* derived from the clock in the browser; the PNG carries the exact server figure */}
      <span suppressHydrationWarning>{label}</span>
    </div>
  );
}

function BandPill({ data }: { data: CardPreviewData }) {
  const tone = TONE[data.tone];
  return (
    <div
      className="flex items-center self-start rounded-full"
      style={{ gap: u(14), background: tone.soft, padding: `${u(11.5)} ${u(25)} ${u(11.5)} ${u(18)}` }}
    >
      <span className="rounded-full" style={{ width: u(18), height: u(18), background: tone.fill }} />
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(27.6), color: tone.ink, lineHeight: 1.3 }}>
        {`${data.bandName} band`}
      </span>
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(22), letterSpacing: u(3.3), color: "rgba(255,255,255,0.78)" }}>
      {children}
    </div>
  );
}

function Stats({ data }: { data: CardPreviewData }) {
  const met = data.gap <= 0;
  return (
    <div className="flex w-full" style={{ gap: u(16) }}>
      <Stat label="TODAY" value={String(data.baseline)} note={data.measured ? undefined : "est."} />
      <Stat label="TARGET" value={String(data.target)} />
      <Stat label={met ? "TARGET MET" : "GAP"} value={met ? `+${Math.abs(data.gap)}` : String(data.gap)} note="pts" />
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      style={{
        background: "rgba(255,255,255,0.12)", border: `${u(2)} solid rgba(255,255,255,0.22)`,
        borderRadius: u(25), padding: `${u(18)} ${u(23)}`,
      }}
    >
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(18.4), letterSpacing: u(2.3), color: "rgba(255,255,255,0.78)" }}>
        {label}
      </span>
      <span className="flex items-baseline" style={{ gap: u(9), marginTop: u(4.6) }}>
        <span className="tnum" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: u(50.6), lineHeight: 1.1, letterSpacing: u(-1.4) }}>
          {value}
        </span>
        {note && (
          <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: u(20.7), color: "rgba(255,255,255,0.78)" }}>{note}</span>
        )}
      </span>
    </div>
  );
}
