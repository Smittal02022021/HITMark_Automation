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

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
