/**
 * Days to test day, derived from the timeline answer. The answer is a range,
 * so the date is the rule's representative number of weeks after the check.
 */

const DAY_MS = 86_400_000;

export type Countdown = {
  /** Whole days left, never negative. */
  days: number;
  booked: boolean;
  /** Estimated test date, YYYY-MM-DD (UTC). */
  testDate: string;
  /** "47 days left" or "182 days of runway" when no date is booked. */
  label: string;
};

/**
 * @param from When the check was taken (defaults to `now`). Pass the submission's createdAt.
 * @param now  Injected clock for determinism.
 */
export function daysToTest(
  plan: { weeks: number; booked: boolean },
  from?: string | Date,
  now: Date = new Date(),
): Countdown {
  const start = from ? new Date(from) : now;
  const test = new Date(start.getTime() + plan.weeks * 7 * DAY_MS);
  const days = Math.max(0, Math.ceil((test.getTime() - now.getTime()) / DAY_MS - 1e-9));
  const unit = days === 1 ? "day" : "days";
  return {
    days,
    booked: plan.booked,
    testDate: test.toISOString().slice(0, 10),
    label: plan.booked ? `${days} ${unit} left` : `${days} ${unit} of runway`,
  };
}
