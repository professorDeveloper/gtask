import Link from "next/link";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2.5 rounded-full font-semibold tracking-[-0.01em] transition-[transform,background-color,border-color,box-shadow] duration-200 active:translate-y-0 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  /* the only element in the product that casts a coloured shadow */
  primary:
    "bg-brand text-brand-ink shadow-[var(--elev-key)] hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[var(--elev-key-hover)] active:shadow-[var(--elev-key)]",
  outline:
    "border border-line-strong bg-surface text-ink elev-1 hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-[var(--elev-2)] active:shadow-[var(--elev-1)]",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-14 px-7 text-[16px]",
};

type Props = {
  children: React.ReactNode;
  href?: string;
  icon?: IconName;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children, href, icon, variant = "primary", size = "md", className = "", ...rest
}: Props) {
  const cn = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const body = (
    <>
      {children}
      {icon && (
        <Icon
          name={icon}
          size={size === "lg" ? 19 : 17}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );
  return href ? (
    <Link href={href} className={cn}>{body}</Link>
  ) : (
    <button className={cn} {...rest}>{body}</button>
  );
}
