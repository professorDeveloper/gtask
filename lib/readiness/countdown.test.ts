import { describe, expect, it } from "vitest";
import { daysToTest } from "./countdown";

describe("daysToTest", () => {
  const from = "2026-09-01T00:00:00Z";

  it("counts whole days from the check to the estimated test date", () => {
    const c = daysToTest({ weeks: 7, booked: true }, from, new Date(from));
    expect(c.days).toBe(49);
    expect(c.testDate).toBe("2026-10-20");
    expect(c.label).toBe("49 days left");
  });

  it("counts down as time passes and never goes negative", () => {
    expect(daysToTest({ weeks: 1, booked: true }, from, new Date("2026-09-07T00:00:00Z")).label).toBe("1 day left");
    expect(daysToTest({ weeks: 1, booked: true }, from, new Date("2027-01-01T00:00:00Z")).days).toBe(0);
  });

  it("words an unbooked timeline as runway", () => {
    expect(daysToTest({ weeks: 26, booked: false }, from, new Date(from)).label).toBe("182 days of runway");
  });
});
