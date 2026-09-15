import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('docs', { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
await p.screenshot({ path: 'docs/shot-home.png' });
await p.goto('http://localhost:3000/check', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
await p.screenshot({ path: 'docs/shot-check.png' });
for (let i = 0; i < 5; i++) { await p.locator('button[aria-pressed]').nth(i === 1 ? 3 : 2).click(); await p.waitForTimeout(420); }
await p.waitForURL(/\/r\//); await p.waitForTimeout(1800);
await p.screenshot({ path: 'docs/shot-report.png' });
console.log('done');
await b.close();
