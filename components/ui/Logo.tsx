/**
 * The mark is the product: a ring drawn most of the way round, with the
 * remaining arc left open. The open arc is the gap; the dot is the target
 * sitting at its far edge. At small sizes it reads as a G.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand" />
      <circle
        cx="16" cy="16" r="9"
        stroke="var(--brand-ink)" strokeWidth="3.2" strokeLinecap="round"
        strokeDasharray="42 57" transform="rotate(-48 16 16)" fill="none"
      />
      <circle cx="23.1" cy="20.4" r="2.5" className="fill-progress" />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-[19px] font-bold tracking-[-0.045em]">GTask</span>
    </span>
  );
}
