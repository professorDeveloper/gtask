// End-to-end smoke at 390px: landing, a full check, one refinement, the share image.
// Usage: BASE=http://localhost:3000 node scripts/smoke.mjs   (exits 1 on failure)
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const fail = (msg) => { console.error("FAIL:", msg); process.exitCode = 1; };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
});
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
console.log("landing: console errors", errors.length, "overflow", overflow);
if (errors.length) fail(`landing console errors: ${errors.slice(0, 3).join(" | ")}`);
if (overflow) fail("landing overflows horizontally");

errors.length = 0;
await p.goto(`${BASE}/check`, { waitUntil: "networkidle" });
for (let i = 0; i < 5; i++) {
  await p.locator('[role="radio"]').nth(i === 1 ? 2 : 1).click();
  await p.waitForTimeout(900);
}
await p.waitForURL(/\/r\/[0-9a-f-]{36}/, { timeout: 20000 });
const id = p.url().split("/r/")[1];
console.log("check: saved report", id);
await p.waitForTimeout(1500);

const option = p.locator('[role="group"] [aria-pressed]').first();
await option.scrollIntoViewIfNeeded();
await option.click();
await p.waitForTimeout(2500);
console.log("refine: pressed", await option.getAttribute("aria-pressed"));

await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const persisted = await p.locator('[role="group"] [aria-pressed="true"]').count();
console.log("refine: selections after reload", persisted);
if (persisted < 1) fail("refinement not persisted");

const og = await p.locator('meta[property="og:image"]').getAttribute("content");
const ogPath = new URL(og).pathname + new URL(og).search;
const res = await p.request.get(`${BASE}${ogPath}`);
console.log("share: og:image", ogPath, res.status(), res.headers()["content-type"]);
if (res.status() !== 200 || !res.headers()["content-type"]?.startsWith("image/png")) fail("og image");

if (errors.length) fail(`result console errors: ${errors.slice(0, 3).join(" | ")}`);
console.log(process.exitCode ? "SMOKE FAILED" : "SMOKE OK");
await b.close();
