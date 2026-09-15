import { defineConfig } from "@playwright/test";

/**
 * End-to-end check at a phone viewport.
 *
 *   npm run test:e2e                              builds, starts on :3200, runs
 *   BASE_URL=http://localhost:3000 npm run test:e2e   runs against a server you already have
 *
 * CI builds once in an earlier step and sets E2E_PREBUILT=1 so the web server
 * only starts. With no Supabase variables the app uses its in-memory store.
 */
const PORT = 3200;
const external = process.env.BASE_URL;
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /.*\.e2e\.ts$/,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: ci ? 1 : 0,
  forbidOnly: ci,
  reporter: ci ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: external ?? `http://localhost:${PORT}`,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    /* the app honours reduced motion, which makes every animation settle at once */
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: external
    ? undefined
    : {
        command: process.env.E2E_PREBUILT
          ? `npm run start -- -p ${PORT}`
          : `npm run build && npm run start -- -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !ci,
        timeout: 300_000,
        stdout: "pipe",
      },
});
