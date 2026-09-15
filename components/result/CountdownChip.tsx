import { Icon } from "@/components/ui/Icon";
import type { Countdown } from "@/lib/readiness/countdown";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "15 Sep" / "15 Sep 2026" in UTC. Not Intl: engines disagree on short months
 * (Node and Chrome say "Sept", Safari "Sep"), which breaks hydration on iOS.
 */
export function formatDay(iso: string, withYear = false) {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${withYear ? ` ${d.getUTCFullYear()}` : ""}`;
}

/** "47 days left · test ~3 Nov", as a white pill that sits on the hero mesh. */
export function CountdownChip({ countdown, className = "" }: { countdown: Countdown; className?: string }) {
  const date = formatDay(countdown.testDate);
  return (
    <p
      className={`inline-flex min-h-9 items-center gap-2 rounded-full bg-surface py-1 pr-3.5 pl-1.5 text-caption font-semibold text-ink elev-2 ${className}`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-sunny text-ink">
        <Icon name={countdown.booked ? "hourglass" : "calendarDots"} size={15} weight="bold" />
      </span>
      <span className="tnum">{countdown.label}</span>
      <span className="text-ink-3">· {countdown.booked ? "" : "est. "}{date}</span>
    </p>
  );
}
