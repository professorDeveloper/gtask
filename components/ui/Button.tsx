"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Icon, type IconName } from "./Icon";
import { SPRING, TAP_SCALE, usePrefersReducedMotion } from "./motion";

export type ButtonVariant = "primary" | "outline" | "ghost" | "soft" | "sunny" | "ready";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[background-color,border-color,box-shadow,color,opacity] duration-200 aria-disabled:pointer-events-none aria-disabled:opacity-45 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  /* the only element in the product that casts a coloured shadow */
  primary:
    "focus-on-fill bg-brand text-brand-ink shadow-key hover:bg-brand-hover hover:shadow-key-hover",
  outline:
    "border border-line-strong bg-surface text-ink elev-1 hover:border-brand hover:text-brand",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  soft: "bg-brand-soft text-brand hover:bg-[color-mix(in_oklab,var(--brand-soft),var(--brand)_8%)]",
  /* micro-wins: ink text on the colour fill, never white */
  sunny: "focus-on-fill bg-sunny text-ink elev-1 hover:bg-[color-mix(in_oklab,var(--sunny),#000_6%)]",
  ready: "focus-on-fill bg-ready text-ink elev-1 hover:bg-[color-mix(in_oklab,var(--ready),#000_8%)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-caption",
  md: "min-h-11 px-5 text-body",
  lg: "min-h-14 px-7 text-lede",
};

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

const MotionLink = motion.create(Link);

type Props = {
  children: React.ReactNode;
  href?: string;
  icon?: IconName;
  iconPosition?: "start" | "end";
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  /** Shows a spinner, sets aria-busy and blocks clicks. */
  loading?: boolean;
  /** Opens href in a new tab. */
  external?: boolean;
  "aria-label"?: string;
};

export function Button({
  children, href, icon, iconPosition = "end", variant = "primary", size = "md", className = "",
  type = "button", onClick, disabled = false, loading = false, external = false, ...aria
}: Props) {
  const reduce = usePrefersReducedMotion();
  /* always set, so motion renders the same tabindex on server and client */
  const tap = { scale: reduce ? 1 : TAP_SCALE };
  const inactive = disabled || loading;
  const cn = `${base} ${variants[variant]} ${sizes[size]} ${loading ? "pointer-events-none" : ""} ${className}`;

  const glyph = loading ? (
    <span aria-hidden className="anim-spin inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent" />
  ) : icon ? (
    <Icon
      name={icon}
      size={iconSize[size]}
      weight={variant === "primary" ? "bold" : "duotone"}
      className={iconPosition === "end" ? "transition-transform duration-200 group-hover:translate-x-0.5" : ""}
    />
  ) : null;

  const body = (
    <>
      {iconPosition === "start" && glyph}
      {children}
      {iconPosition === "end" && glyph}
    </>
  );

  if (href) {
    if (inactive)
      return <span role="link" aria-disabled="true" aria-busy={loading || undefined} className={cn} {...aria}>{body}</span>;
    return (
      <MotionLink
        href={href}
        className={cn}
        onClick={onClick}
        whileTap={tap}
        transition={SPRING.tap}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...aria}
      >
        {body}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      className={cn}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      whileTap={inactive ? undefined : tap}
      transition={SPRING.tap}
      {...aria}
    >
      {body}
    </motion.button>
  );
}
