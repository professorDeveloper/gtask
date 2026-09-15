# GTask — SAT Readiness Check

[![CI](https://github.com/professorDeveloper/gtask/actions/workflows/ci.yml/badge.svg)](https://github.com/professorDeveloper/gtask/actions/workflows/ci.yml)

Answer five questions about your SAT plan. GTask turns your points gap into study hours and tells
you whether your current pace closes it before test day. The score comes from simple rules, not AI.

- **Live:** https://gtask.vercel.app
- **Repo:** https://github.com/professorDeveloper/gtask

<p align="center">
  <img src="docs/shot-home.png" alt="Landing page on a phone" width="250">
  <img src="docs/shot-check.png" alt="A question in the check" width="250">
  <img src="docs/shot-report.png" alt="A saved readiness report" width="250">
</p>

## Brief → how it's met

| The brief asks for | Where it is |
| --- | --- |
| The user answers 5 questions | [`/check`](app/check/page.tsx): test date, last practice score, weekly hours, weak section, target score. The questions and the numbers behind each answer are in [`lib/readiness/questions.ts`](lib/readiness/questions.ts). |
| A result computed by simple rules, not AI | [`lib/readiness/engine.ts`](lib/readiness/engine.ts) is plain arithmetic with no model, network or randomness. The same answers always give the same report, and the result page prints the maths. Every one of the 1,280 answer combinations is covered by [vitest](lib/readiness/engine.test.ts). |
| The answers are saved | Supabase Postgres, one `submissions` table with row-level security on and no anon access ([`schema.sql`](supabase/schema.sql), [`migrations/002`](supabase/migrations/002_session_and_refine.sql), [`lib/store`](lib/store/index.ts)). Each report has its own URL, `/r/<id>`, which loads from the database. |
| Looks right on a phone | Built mobile-first at 390px: no horizontal scroll and tap targets of at least 44px. The [e2e test](tests/e2e/check.e2e.ts) runs the whole flow at 390×844 and fails if the page overflows sideways. |
| Deployed, the link opens | Vercel: https://gtask.vercel.app |
| Open repo | This repo. [CI](.github/workflows/ci.yml) runs lint, types, unit tests, a production build and the phone e2e test on every push. |

## How the scoring works

One calibration constant: **moving 100 SAT points takes about 45 study hours** (`HOURS_PER_POINT = 0.45`).
Everything else is arithmetic on the answers.

```
gap            = target − baseline              (no practice test yet → baseline assumed 1050)
requiredHours  = max(8, gap × 0.45)
budgetHours    = weeks to test × hours per week  (weeks: 3 / 7 / 18 / 26 · hours: 1.5 / 3.5 / 8 / 12)
projected      = baseline + budgetHours ÷ 0.45, rounded to 10, capped at the target

readiness = 40 × proximity + 38 × capacity + 22 × habit + weak-section adjustment
  proximity = 1 − gap / 400                   how close you already are     (0–1)
  capacity  = budgetHours / requiredHours     does your time cover the work  (0–1)
  habit     = hoursPerWeek / 10               is there a weekly rhythm       (0–1)
  weak section: both sections −5 · "I run out of time" +3 · one section 0
  no measured baseline → × 0.9 · result clamped to 3–99
```

- **Band:** Foundation 0–39 · Building 40–64 · Sharpening 65–84 · Test-ready 85–100 ([`bands.ts`](lib/readiness/bands.ts)).
- **Archetype:** the first rule that matches wins. No baseline → *The Unknown Quantity*; gap ≥ 250 in ≤ 8 weeks
  → *The Sprinter*; gap ≥ 250 → *The Long Climb*; gap ≤ 120 at ≥ 6 h/week → *The Closer*; gap ≤ 150 at < 3 h/week
  → *The Coaster*; ≥ 18 weeks at < 3 h/week → *The Sleeper*; pacing issue → *The Clock Watcher*; otherwise *The Builder*.
- **Plan:** fixed rules over the same numbers: phases (Measure / Close the gap / Rehearse), up to four next steps,
  and a Mon–Sun calendar ([`calendar.ts`](lib/readiness/calendar.ts)).

**Optional refinement** ([`refine.ts`](lib/readiness/refine.ts)). Three extra questions on the result page adjust
the same engine:

- **Practice tests taken:** the ×0.9 no-baseline discount becomes 0.93 / 0.96 / 0.98. A measured baseline
  gets +1 or +2, and the Rehearse phase is shortened.
- **Weakest sub-topic:** the gap costs 5% fewer hours, and the plan names the skill.
- **Running out of time:** never +2 · sometimes 0 · almost always −4, which also switches on timed practice.

The "accuracy" meter is 70% after the five answers and goes up 10% for each refinement.

## Features

- **Five-question check.** One question per screen, with a progress rail and keyboard support (`A`–`E` / `1`–`5`,
  arrow keys, `Backspace`). Progress survives a refresh, and a double tap never creates two rows.
- **Saved report at `/r/<id>`.** Score dial, band, archetype, gap chart, the maths behind the score, phased plan
  and next steps.
- **Refine card.** Answer three optional questions to re-score the report live. The answers are saved to the
  same row.
- **Weekly plan.** A Mon–Sun calendar with minutes per day for each section, timed blocks and review.
- **Countdown.** Days to test day, based on the timeline answer.
- **Session stats.** Total time, time per question, answers changed, tab leaves and time away, plus a
  Focused / A bit distracted / Distracted badge. They are saved but **never change the score**.
- **Leaving the tab.** While you are away the tab title and favicon change. When you return, a toast offers
  Continue or Start over.
- **Share card.** Each report has its own Open Graph image and a portrait card at `/r/<id>/card`, with buttons to
  save the image, copy the link, share to Telegram or use the native share sheet. The homepage has its own preview
  image ([`app/opengraph-image.tsx`](app/opengraph-image.tsx)).
- **Motion that respects `prefers-reduced-motion`.** The score counts up, and higher bands get confetti.

## Stack

Next.js 16 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS v4 · motion ·
Supabase (Postgres) · `next/og` for share images · vitest · Playwright · GitHub Actions · Vercel

## Project layout

```
app/
  page.tsx                landing page
  check/                  the five questions
  r/[id]/                 saved report, its OG/Twitter image and /card route
  actions.ts              server actions: score + save, save refinements
  opengraph-image.tsx     homepage link preview
lib/
  readiness/              the rules: questions, engine, bands, refine, calendar, countdown,
                          session stats. Pure TypeScript with unit tests next to each file.
  store/                  save/read a submission: Supabase, or in-memory when unconfigured
components/               landing/ check/ result/ share/ ui/ viz/
supabase/                 schema.sql (fresh DB) · migrations/002 (existing DB)
tests/e2e/                Playwright: the full flow at 390×844
scripts/                  README screenshots, full-page shots, Supabase connection check
.github/workflows/ci.yml  lint · tsc · vitest · next build · e2e
```

## Running locally

```bash
npm install
npm run dev              # http://localhost:3000
npm test                 # rule-engine unit tests (vitest)
npx playwright install chromium   # once
npm run test:e2e         # builds, starts on :3200 and runs the phone e2e test
BASE_URL=http://localhost:3000 npm run test:e2e   # or run it against your dev server
npm run lint && npm run typecheck
```

No setup is needed. Without Supabase variables the app keeps submissions in memory, so a fresh clone works
end to end (data is lost when the server restarts).

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | server | Supabase project URL. If it is unset, the in-memory store is used. |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Used for reads and writes from server actions. Never shipped to the browser. |
| `NEXT_PUBLIC_SITE_URL` | build | Absolute base for share links and OG images (defaults to `https://gtask.vercel.app`). |

Put them in `.env.local` for local development.

## Deploying

1. **Supabase:** create a project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. For
   a database created by an earlier version, run
   [`supabase/migrations/002_session_and_refine.sql`](supabase/migrations/002_session_and_refine.sql) instead
   (it is safe to run twice).
2. **Vercel:** import the repo and set the three variables above, then deploy.

Or run `./deploy.sh`, an interactive wizard that walks through both steps. It checks the Supabase credentials
with a real insert ([`scripts/verify-supabase.mjs`](scripts/verify-supabase.mjs)), pushes the env vars with the
Vercel CLI and deploys to production.

RLS is enabled and no anon policy exists, so the table can't be read from the browser. The app stores no
names, emails or accounts.
