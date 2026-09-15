import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StickyBar } from "@/components/ui/StickyBar";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#method", label: "The method" },
  { href: "#bands", label: "Bands" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <StickyBar>
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label="GTask home" className="shrink-0">
          <Logo />
        </Link>
        <ul className="ml-2 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <Button href="/check" icon="arrowRight" className="hidden sm:inline-flex">
            Start the check
          </Button>
        </div>
      </nav>
    </StickyBar>
  );
}
