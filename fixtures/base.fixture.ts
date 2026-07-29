import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage/LoginPage';

/**
 * Extend this type as you add more page objects, so every test file
 * just imports { test, expect } from here instead of instantiating
 * page objects manually in every spec.
 */
type Pages = {
  loginPage: LoginPage;
};

type AutoFixtures = {
  finalScreenshot: void;
};

export const test = base.extend<Pages & AutoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /**
   * Auto fixture - runs for every test automatically, no test needs to
   * request it. After all of a test's own steps finish (whether it
   * passed or failed), this captures one screenshot of the final page
   * state as its own named step, so it shows up in the HTML report
   * directly after the test's last step rather than buried in a
   * generic Attachments section.
   *
   * { auto: true } is what makes this apply framework-wide with zero
   * per-test changes - any test using this fixture file's `test`
   * export gets it automatically.
   */
  finalScreenshot: [
    async ({ page }, use, testInfo) => {
      await use();

      try {
        if (!page.isClosed()) {
          const url = page.url();
          await test.step(`Capture final screenshot - ${url}`, async () => {
            const screenshot = await page.screenshot({ fullPage: true });
            await testInfo.attach('final-state', {
              body: screenshot,
              contentType: 'image/png',
            });
            // await testInfo.attach('final-url', {
            //   body: url,
            //   contentType: 'text/plain',
            // });
          });
        }
      } catch {
        // Deliberately swallowed - a screenshot capture failure (page
        // already closed/navigated away) should never flip an
        // otherwise-passing test to failed, or mask the real failure.
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';