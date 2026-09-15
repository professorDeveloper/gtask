import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter({ checks }: { checks: number }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-body text-ink-2">
              A rule-based readiness check for the Digital SAT. Five questions, one honest report, no account.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-3">
              <Icon name="lock" size={15} />
              Answers stored anonymously
              {checks > 0 && <span className="tnum">· {checks.toLocaleString("en-US")} checks completed</span>}
            </p>
          </div>
          <a
            href="https://github.com/professorDeveloper/gtask"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line px-4 text-body font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            Source code on GitHub
            <Icon name="arrowUpRight" size={17} />
          </a>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-micro text-ink-3">
          GTask · SAT Readiness Check · not affiliated with the College Board
        </p>
      </div>
    </footer>
  );
}
