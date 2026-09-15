// Full-page screenshots of landing, check and a fresh report at phone and desktop widths.
// Usage: BASE=http://localhost:3000 npm run shots   → shots/*.png
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(page, name) {
  // scroll the whole page so in-view reveals fire, then return to top
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log("→", name);
}

for (const [device, viewport] of [["m", { width: 390, height: 844 }], ["d", { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shoot(page, `home-${device}`);

  await page.goto(`${BASE}/check`, { waitUntil: "networkidle" });
  await shoot(page, `check-${device}`);

  // play through all five questions (a selection advances on its own)
  for (let i = 0; i < 5; i++) {
    await page.locator('[role="radio"]').nth(i === 1 ? 2 : 1).click();
    await page.waitForTimeout(900);
  }
  await page.waitForURL(/\/r\//, { timeout: 20000 });
  await page.waitForTimeout(2000);
  await shoot(page, `report-${device}`);

  if (errors.length) console.log(`!! ${device} errors:`, errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
