import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { REPO_URL } from "./BuiltToBrief";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-body text-ink-2">
              A rule-based readiness check for the Digital SAT. Five questions, one report, no AI and no account.
            </p>
            <p className="mt-4 flex items-center gap-2 text-caption text-ink-3">
              <Icon name="lock" size={15} />
              Answers saved anonymously
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line px-4 text-body font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink md:self-auto"
            >
              Open source on GitHub
              <Icon name="arrowUpRight" size={17} />
            </a>
            <p className="font-mono text-micro text-ink-3">Next.js 16 · TypeScript · Supabase · Vercel</p>
          </div>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-micro text-ink-3">
          GTask · SAT Readiness Check · not affiliated with the College Board
        </p>
      </div>
    </footer>
  );
}
