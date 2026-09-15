// Regenerates the three phone screenshots in docs/ used by the README.
// Usage: BASE=http://localhost:3000 node scripts/readme-shots.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
mkdirSync("docs", { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();

await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
await p.waitForTimeout(1600);
await p.screenshot({ path: "docs/shot-home.png" });

await p.goto(`${BASE}/check`, { waitUntil: "networkidle" });
await p.waitForTimeout(900);
await p.screenshot({ path: "docs/shot-check.png" });

for (let i = 0; i < 5; i++) {
  await p.locator('[role="radio"]').nth(i === 1 ? 3 : 2).click();
  await p.waitForTimeout(900);
}
await p.waitForURL(/\/r\//, { timeout: 20000 });
await p.waitForTimeout(2200);
await p.screenshot({ path: "docs/shot-report.png" });

console.log("done");
await b.close();
