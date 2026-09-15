import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter({ checks }: { checks: number }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
              A rule-based readiness check for the Digital SAT. Five questions, one honest report,
              no account.
            </p>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
              <Icon name="lock" size={15} />
              Answers stored anonymously
              {checks > 0 && <span className="tnum">· {checks} checks completed</span>}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Button href="/check" icon="arrowRight">Start the check</Button>
            <a
              href="https://github.com/professorDeveloper/gtask"
              className="text-[14px] text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              Source code on GitHub
            </a>
          </div>
        </div>
        <p className="mt-12 border-t border-line pt-6 font-mono text-[11px] tracking-[0.06em] text-ink-3">
          GTask · SAT Readiness Check · not affiliated with the College Board
        </p>
      </div>
    </footer>
  );
}
