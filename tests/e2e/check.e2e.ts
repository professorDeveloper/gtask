import { expect, test, type Page } from "@playwright/test";
import { evaluate } from "../../lib/readiness/engine";
import { QUESTIONS } from "../../lib/readiness/questions";
import type { Answers } from "../../lib/readiness/types";

/**
 * The brief, end to end, on a 390×844 phone: open the landing page, answer the
 * five questions, land on a saved report, and reload it to prove it was stored.
 *
 * The expected score, band and archetype come from the rule engine itself, so
 * the test checks that the page shows exactly what the rules compute.
 */

/* 1–2 months · 1000–1190 · 6–10 h/week · Math · 1300+ */
const PICKS = ["t_2m", "b_mid", "h_high", "f_math", "g_1300"] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, "page scrolls horizontally").toBeLessThanOrEqual(innerWidth);
}

test("five answers produce a saved, rule-based report that fits a phone", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  const expected = evaluate([...PICKS] as unknown as Answers);

  await page.goto("/");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: /start the check/i }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/check$/);

  for (const [i, question] of QUESTIONS.entries()) {
    const option = question.options.find((o) => o.id === PICKS[i]);
    if (!option) throw new Error(`unknown option ${PICKS[i]} for ${question.id}`);
    const radio = page.getByRole("radio", { name: option.label });
    await expect(radio).toBeVisible();
    if (i === 0) await expectNoHorizontalOverflow(page);
    await radio.click();
  }

  await page.waitForURL(/\/r\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  const reportUrl = page.url();

  const assertReport = async () => {
    await expect(page.getByRole("heading", { level: 1, name: expected.archetype })).toBeVisible();
    await expect(
      page.getByRole("img", { name: `Readiness ${expected.readiness} out of 100, ${expected.band.name}` }).first(),
    ).toBeVisible();
    await expect(page.getByText(expected.band.name, { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  };

  await assertReport();

  /* the answers were stored: the same URL still resolves after a full reload */
  await page.reload();
  expect(page.url()).toBe(reportUrl);
  await assertReport();

  expect(pageErrors, "uncaught page errors").toEqual([]);
});
