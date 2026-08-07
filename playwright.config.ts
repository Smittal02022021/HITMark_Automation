import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Loads .env.<TEST_ENV> - defaults to .env.dev if TEST_ENV is not set.
 * Run with e.g.  TEST_ENV=staging npm run test:smoke
 */
const env = process.env.TEST_ENV || 'qa';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

/**
 * One timestamp generated when the config loads (i.e. once per test run,
 * shared by every worker) - not regenerated per test, per worker, or per
 * file. Used to give each run's HTML report and JUnit file their own path
 * instead of overwriting the previous run's results.
 * Format: 2026-07-24_14-05-30 (sortable, filesystem-safe on macOS).
 */
function runTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`;
}
const runId = runTimestamp();

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Each run gets its own HTML report folder and JUnit file, named by
  // runId, so nothing gets overwritten. The HTML report folder is fully
  // self-contained (screenshots/videos/traces are copied into it), so old
  // report folders stay viewable even after test-results/ is cleared by
  // a later run.
  reporter: [
    ['html', { outputFolder: `playwright-report/${runId}`, open: 'never' }],
    ['list'],
    ['junit', { outputFile: `test-reports/junit-results-${runId}.xml` }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
