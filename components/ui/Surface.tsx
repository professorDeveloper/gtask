/**
 * A card states its height once, through the elevation scale, and never
 * carries an ad-hoc shadow.
 *   1 resting · 2 raised (the page's focal object) · 3 floating
 */
export function Card({
  children, className = "", as: As = "div", elevation = 1,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  elevation?: 1 | 2 | 3;
}) {
  const elev = elevation === 3 ? "elev-3" : elevation === 2 ? "elev-2" : "elev-1";
  return (
    <As className={`rounded-[18px] border border-line bg-surface ${elev} ${className}`}>
      {children}
    </As>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3 ${className}`}>
      {children}
    </p>
  );
}

const toneStyles = {
  brand: "bg-brand-soft text-brand",
  progress: "bg-progress-soft text-progress",
  gap: "bg-gap-soft text-gap",
  ready: "bg-ready-soft text-ready",
  neutral: "bg-surface-2 text-ink-2",
} as const;

export function Badge({
  children, tone = "neutral", className = "",
}: { children: React.ReactNode; tone?: keyof typeof toneStyles; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow, title, lede, className = "",
}: { eyebrow: string; title: React.ReactNode; lede?: string; className?: string }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[clamp(30px,6vw,44px)] leading-[1.05] font-bold text-balance">{title}</h2>
      {lede && <p className="mt-4 text-[16.5px] leading-relaxed text-ink-2">{lede}</p>}
    </div>
  );
}
