import { ImageResponse } from "next/og";
import { CARD_SIZE, SITE_HOST } from "@/components/share/card";
import { FACE, shareFonts } from "@/components/share/fonts";
import { HEX, MESH_STRONG, TONE } from "@/components/share/palette";

/**
 * The homepage link preview, in the share card's look: brand mesh, white
 * score card, sunny sticker. Static, so it renders once at build time.
 */

export const alt = "GTask: find out if your SAT plan actually adds up. 5 questions, rules not AI.";
export const size = CARD_SIZE.og;
export const contentType = "image/png";

const SAMPLE = { score: 72, band: "Sharpening", tone: TONE.brand };

function Mark({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill={HEX.surface} />
      <circle
        cx="16" cy="16" r="9" stroke={HEX.brand} strokeWidth="3.2" strokeLinecap="round"
        strokeDasharray="42 57" transform="rotate(-48 16 16)" fill="none"
      />
      <circle cx="23.1" cy="20.4" r="3.2" fill={HEX.sunny} />
    </svg>
  );
}

function SampleCard() {
  const ring = 230;
  const stroke = ring * 0.085;
  const r = (ring - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", width: 330,
        background: HEX.surface, borderRadius: 36, padding: "30px 28px 30px",
        boxShadow: "0 30px 60px -20px rgba(12,20,80,0.55), 0 0 0 1px rgba(28,25,23,0.06)",
      }}
    >
      <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 16, letterSpacing: 2.5, color: HEX.ink2, marginBottom: 18 }}>
        READINESS SCORE
      </div>
      <div style={{ display: "flex", position: "relative", width: ring, height: ring, alignItems: "center", justifyContent: "center" }}>
        <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} style={{ position: "absolute", top: 0, left: 0 }}>
          <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="#F2F1EC" strokeWidth={stroke} />
          <circle
            cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke={SAMPLE.tone.fill} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${(c * SAMPLE.score) / 100} ${c}`}
            transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
          />
        </svg>
        <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 92, lineHeight: 1, letterSpacing: -4, color: HEX.ink }}>
          {String(SAMPLE.score)}
        </div>
      </div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, marginTop: 20,
          background: SAMPLE.tone.soft, borderRadius: 999, padding: "8px 18px 8px 12px",
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 999, background: SAMPLE.tone.fill }} />
        <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 21, color: SAMPLE.tone.ink }}>
          {`${SAMPLE.band} band`}
        </div>
      </div>
    </div>
  );
}

export default async function Image() {
  const { width, height } = size;
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex", position: "relative", width, height, overflow: "hidden",
          backgroundColor: HEX.brand, backgroundImage: MESH_STRONG, color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute", width: width * 0.7, height: width * 0.7, right: -width * 0.28, bottom: -width * 0.36,
            borderRadius: 9999, backgroundImage: "radial-gradient(circle, rgba(255,210,63,0.30) 0%, rgba(255,210,63,0) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute", left: 0, top: 0, width, height: height * 0.45,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.16) 1.6px, rgba(255,255,255,0) 2px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div style={{ display: "flex", width: "100%", height: "100%", padding: "56px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Mark size={44} />
              <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 38, letterSpacing: -1.4, color: "#fff" }}>
                GTask
              </div>
              <div style={{ width: 2, height: 28, background: "rgba(255,255,255,0.35)", marginLeft: 4, marginRight: 4 }} />
              <div style={{ fontFamily: FACE.body, fontWeight: 500, fontSize: 24, color: "rgba(255,255,255,0.85)" }}>
                SAT readiness check
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              <div style={{ fontFamily: FACE.display, fontWeight: 800, fontSize: 72, lineHeight: 1.02, letterSpacing: -2.6, color: "#fff", textWrap: "balance" }}>
                Find out if your SAT plan actually adds up.
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: HEX.sunny, color: HEX.ink, borderRadius: 999, padding: "12px 26px",
                    transform: "rotate(-2deg)", boxShadow: "0 10px 24px -8px rgba(28,25,23,0.35)",
                    fontFamily: FACE.display, fontWeight: 800, fontSize: 30, letterSpacing: -0.6,
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: 999, background: HEX.ink }} />
                  5 questions · rules, not AI
                </div>
              </div>
            </div>

            <div style={{ fontFamily: FACE.body, fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.85)" }}>
              {SITE_HOST}
            </div>
          </div>

          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", transform: "rotate(4deg)" }}>
              <SampleCard />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await shareFonts() },
  );
}
