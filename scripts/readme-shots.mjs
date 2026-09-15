// Regenerates the three phone screenshots in docs/ used by the README.
// Creates exactly one new check (the report screenshot needs a saved report).
// Usage: BASE=http://localhost:3000 npm run shots:readme
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
/* 1–2 months · 1000–1190 · 6–10 hours · Math · 1300+ : a mid-band report with a real gap */
const PICKS = ["1–2 months away", "1000–1190", "6–10 hours", "Math", "1300+"];

mkdirSync("docs", { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "docs/shot-home.png" });

  await page.goto(`${BASE}/check`, { waitUntil: "networkidle" });
  /* the first question, once its options have animated in */
  await page.getByRole("radio").first().waitFor();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "docs/shot-check.png" });

  for (const label of PICKS) {
    const radio = page.getByRole("radio", { name: label });
    await radio.waitFor({ state: "visible" });
    await page.waitForTimeout(250);
    await radio.click();
  }
  await page.waitForURL(/\/r\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await page.getByRole("heading", { level: 1 }).waitFor();
  /* let the dial count up and the band unlock */
  await page.waitForTimeout(3200);
  await page.screenshot({ path: "docs/shot-report.png" });

  console.log("saved docs/shot-home.png, docs/shot-check.png, docs/shot-report.png from", page.url());
} finally {
  await browser.close();
}
