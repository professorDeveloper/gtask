# GTask — SAT Readiness Check

Five questions, sixty seconds, one honest report. GTask measures the gap between the
score a student has today and the score their target university expects, converts that
gap into study hours, and says whether the current pace closes it before test day.

**The score is computed by rules, not by a model.** The same answers always produce
the same report, and every step of the arithmetic is printed on the result page.

- **Live:** _see the deployment section below_
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · motion · Supabase · Vercel

<p align="center">
  <img src="docs/shot-home.png" alt="Landing page on a phone" width="260">
  <img src="docs/shot-check.png" alt="A question in the check" width="260">
  <img src="docs/shot-report.png" alt="A finished readiness report" width="260">
</p>

---

## What you get

- **The check.** Five required questions: timeline, baseline, weekly effort, weak section,
  target. The result appears right after question 5.
- **Refine your report (optional).** The result page asks three more questions: how many
  full practice tests you have taken, your weakest sub-topic, and whether you run out of
  time. Each one is a fixed rule. Answering re-scores the report live and raises an
  accuracy meter from 70% (five answers) by 10% per refinement. Refinements are saved to
  the same report.
- **Weekly plan.** A Mon–Sun calendar with hours per day and what to study each day
  (Reading & Writing, Math, a timed full test, review). It is built by rules from the
  weekly hours needed, the study split, your sub-topic and your pacing.
- **Countdown.** Days left until test day, based on the timeline you chose.
- **Session stats.** Measured during the check and shown on the result: total time, time
  per question, tab leaves and time away, answers changed, and a Focus badge (Focused /
  A bit distracted / Distracted). They are saved, but **never affect the score**.
- **Leaving the tab mid-check.** While the tab is hidden, its title reads
  "⏸ Q3/5 · Your check is waiting" and the favicon changes. When you come back, a toast
  offers Continue or Start over. Progress survives a refresh (localStorage), and closing
  the page mid-check asks for confirmation.
- **Share card.** Each report has its own Open Graph image (`app/r/[id]/opengraph-image.tsx`)
  and a portrait card at `/r/<id>/card` (`?download=1` to save it). The result page has
  Save image, Copy link, Telegram and the native share sheet.
- **Celebration.** The score counts up, the band unlocks, and Sharpening and Test-ready
  bands get confetti. Lower bands get a warm, motivating animation instead.

The landing page is a scroll story: hero with a live sample report, a pinned phone showing
the five questions, a gap chart that draws as you scroll, a method lab running the real
engine in the browser, the band ladder, a share and stats preview, FAQ, and a final CTA.

## How the scoring works

One calibration constant: **moving 100 SAT points costs roughly 45 study hours.**
Everything else is arithmetic on the student's own answers.

| Input | Where it comes from |
| --- | --- |
| `gap` | target score − last practice score |
| `requiredHours` | `gap × 0.45` |
| `budgetHours` | weeks to test day × hours studied per week |
| `projected` | baseline + `budgetHours ÷ 0.45`, capped at the target |

The readiness score out of 100 is three weighted components:

```
readiness = 40 × proximity + 38 × capacity + 22 × habit  ± modifiers

proximity = 1 − gap / 400                 how close the baseline already is
capacity  = budgetHours / requiredHours   does the time cover the work
habit     = hoursPerWeek / 10             is there a weekly rhythm
```

Modifiers: a pacing-only weakness adds 3, a weakness in both sections subtracts 5, and an
unmeasured baseline discounts the whole score by 10% (and assumes 1050). The optional
refinements adjust these same knobs. Practice tests soften the discount and shorten the
Rehearse phase. A named sub-topic makes the gap cheaper in hours. Timing trouble adds or
subtracts pacing points. See [`lib/readiness/refine.ts`](lib/readiness/refine.ts).

Four bands follow from the score: **Foundation** (0–39), **Building** (40–64),
**Sharpening** (65–84), **Test-ready** (85–100). The archetype (“The Sprinter”, “The
Sleeper”, …), the phased plan and the weekly calendar are rule tables over the same
numbers. See [`lib/readiness/engine.ts`](lib/readiness/engine.ts) and
[`lib/readiness/calendar.ts`](lib/readiness/calendar.ts).

## Project layout

```
app/
  page.tsx              landing page (scroll story)
  check/                the five questions
  r/[id]/               a saved report, plus its OG/Twitter image and /card route
  actions.ts            server actions: score and store, save refinements
lib/
  readiness/            the domain: questions, bands, engine, refine, calendar,
                        countdown, session stats — pure and covered by vitest
  store/                save and read a submission (Supabase, memory fallback)
components/
  ui/                   buttons, icons, surfaces, toast, motion vocabulary
  viz/                  GapScale and ScoreDial
  landing/ check/ result/ share/
supabase/
  schema.sql            the table, for a fresh database
  migrations/           002_session_and_refine.sql for an existing one
scripts/                Playwright smoke test, screenshots, QA probes
```

`lib/readiness` has no React, no network and no environment in it. It is pure input to
output, which is why the whole rule set is covered by tests, including a sweep over all
400 possible answer combinations.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run verify   # typecheck, lint and the rule-engine tests
npm run build
BASE=http://localhost:3000 node scripts/smoke.mjs   # landing → check → refine → share image
```

Without Supabase credentials the app runs against an in-memory store, so a fresh clone
works with no setup.

## Storage

One table, `submissions`. Each row holds the five answers, the full report, the session
stats, the refinements, and a few flattened columns (focus, total time, tab leaves,
accuracy) so the Supabase table view is readable.

- **New database:** run [`supabase/schema.sql`](supabase/schema.sql).
- **Existing database from an earlier version:** run
  [`supabase/migrations/002_session_and_refine.sql`](supabase/migrations/002_session_and_refine.sql).
  It is safe to run twice. Until it runs, the app keeps session stats and refinements
  inside the report JSON.

Row-level security is on and no anon policy is granted. Reads and writes go through the
server with the service-role key, so nothing is readable from the browser. No names, no
emails, no accounts.

## Deploying

```bash
./deploy.sh       # guided: Supabase keys, Vercel env, production deploy
```

The wizard checks the connection with a real insert before deploying, so a green run
means the deployed site can actually write. Set `NEXT_PUBLIC_SITE_URL` to the production
URL so share images get absolute links.

## Accessibility and mobile

Built mobile-first at 390px and up, with no horizontal scrolling and tap targets of at
least 44px. Keyboard: `A`–`E` or `1`–`5` answer a question, arrow keys move between options,
`Backspace` goes back. Every interactive element has a visible focus ring, and every
animation respects `prefers-reduced-motion` (content shows in its final state).
