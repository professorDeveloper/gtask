import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const themes = (process.env.THEMES ?? 'light,dark').split(',');
const browser = await chromium.launch();

async function shoot(page, name) {
  // scroll the whole page so IntersectionObserver reveals fire, then return to top
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log('→', name);
}

for (const theme of themes) {
  for (const [device, viewport] of [['m', { width: 390, height: 844 }], ['d', { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: theme });
    await ctx.addInitScript((t) => localStorage.setItem('gtask-theme', t), theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await shoot(page, `home-${device}-${theme}`);

    await page.goto(`${BASE}/check`, { waitUntil: 'networkidle' });
    await shoot(page, `check-${device}-${theme}`);

    // play through all five questions
    for (let i = 0; i < 5; i++) {
      await page.locator('button[aria-pressed]').nth(i === 1 ? 2 : 1).click();
      await page.waitForTimeout(420);
    }
    await page.waitForURL(/\/r\//, { timeout: 15000 });
    await page.waitForTimeout(1600);
    await shoot(page, `report-${device}-${theme}`);

    if (errors.length) console.log(`!! ${device}-${theme} errors:`, errors.slice(0, 5));
    await ctx.close();
  }
}
await browser.close();
