import { Icon, type IconName } from "./Icon";

/**
 * A card states its height once, through the elevation scale, and never
 * carries an ad-hoc shadow.
 *   0 flush · 1 resting · 2 raised (the page's focal object) · 3 floating
 * variant "mesh" is the brand moment (hero, result score): white text on the
 * brand→violet mesh. Use it at most once per screen.
 */
export function Card({
  children, className = "", as: As = "div", elevation = 1, variant = "surface",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  elevation?: 0 | 1 | 2 | 3;
  variant?: "surface" | "mesh" | "well";
}) {
  const elev = `elev-${elevation}`;
  const skin =
    variant === "mesh"
      ? `mesh-strong grain ${elev}`
      : variant === "well"
        ? "well"
        : `border border-line bg-surface ${elev}`;
  return <As className={`rounded-card ${skin} ${className}`}>{children}</As>;
}

/**
 * Section label. Default: small caps in ink-2. `pill`: brand-soft pill with
 * an optional duotone icon, for the playful areas.
 */
export function Eyebrow({
  children, className = "", icon, variant = "plain",
}: { children: React.ReactNode; className?: string; icon?: IconName; variant?: "plain" | "pill" }) {
  if (variant === "pill")
    return (
      <p className={`inline-flex min-h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-micro font-semibold text-brand ${className}`}>
        {icon && <Icon name={icon} size={14} />}
        {children}
      </p>
    );
  return (
    <p className={`inline-flex items-center gap-1.5 text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase ${className}`}>
      {icon && <Icon name={icon} size={14} className="text-brand" />}
      {children}
    </p>
  );
}

export type BadgeTone = "brand" | "progress" | "gap" | "ready" | "neutral" | "sunny" | "accent";

const toneStyles: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand",
  progress: "bg-progress-soft text-progress-ink",
  gap: "bg-gap-soft text-gap-ink",
  ready: "bg-ready-soft text-ready-ink",
  neutral: "bg-surface-2 text-ink-2",
  sunny: "bg-sunny text-ink",
  accent: "bg-accent-2-soft text-accent-2-ink",
};

export function Badge({
  children, tone = "neutral", icon, className = "",
}: { children: React.ReactNode; tone?: BadgeTone; icon?: IconName; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold ${toneStyles[tone]} ${className}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow, title, lede, icon, className = "",
}: { eyebrow: string; title: React.ReactNode; lede?: string; icon?: IconName; className?: string }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-h2 font-bold text-balance">{title}</h2>
      {lede && <p className="mt-4 text-lede text-ink-2">{lede}</p>}
    </div>
  );
}
