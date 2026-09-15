import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'shots/sec'; mkdirSync(OUT, { recursive: true });
const theme = process.env.T ?? 'light';
const w = Number(process.env.W ?? 390);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, colorScheme: theme });
await ctx.addInitScript((t) => localStorage.setItem('gtask-theme', t), theme);
const p = await ctx.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
    window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 100));
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await p.waitForTimeout(900);
const targets = [
  ['hero', 'main > section:nth-of-type(1)'],
  ['how', '#how'],
  ['what', 'main > section:nth-of-type(3)'],
  ['method', '#method'],
  ['bands', '#bands'],
  ['cta', 'main > section:last-of-type'],
  ['footer', 'footer'],
];
for (const [name, sel] of targets) {
  const el = p.locator(sel).first();
  if (!(await el.count())) { console.log('missing', name); continue; }
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(350);
  await el.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png` });
  console.log('→', name);
}
await b.close();
