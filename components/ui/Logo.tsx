import Link from "next/link";

/**
 * The mark is the product: a ring drawn most of the way round, with the
 * remaining arc left open. The open arc is the gap; the sunny dot is the
 * target sitting at its far edge. At small sizes it reads as a G.
 * The same drawing lives in app/icon.svg (and public/icon-away.svg).
 */
export function LogoMark({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <circle
        data-logo-ring
        cx="16" cy="16" r="9"
        stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round"
        strokeDasharray="42 57" transform="rotate(-48 16 16)" fill="none"
      />
      <circle cx="23.1" cy="20.4" r="3.2" fill="var(--sunny)" />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-title font-bold tracking-[-0.045em]">GTask</span>
    </span>
  );
}

/** The logo as a home link with a 44px tap target. */
export function LogoLink({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <Link href="/" aria-label="GTask home" className={`inline-flex min-h-11 shrink-0 items-center rounded-control ${className}`}>
      <Logo size={size} />
    </Link>
  );
}
