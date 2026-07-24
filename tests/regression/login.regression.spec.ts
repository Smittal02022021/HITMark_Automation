import { test, expect } from '../../fixtures/base.fixture';

/**
 * REGRESSION SUITE
 * Broader coverage - edge cases, negative paths, validation rules,
 * less-frequently-touched flows. Run this on a schedule or before
 * releases rather than on every single build.
 */
test.describe('Regression: Login', () => {
  test('shows error for invalid credentials @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login('invalid', 'invalid');
    await expect(loginPage.errorMessage).toContainText('The account name and password you entered cannot be used to open this file.');
    //await expect(loginPage.errorMessage).toBeVisible();
  });

  test('shows validation error for empty fields @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('The account name and password you entered cannot be used to open this file.');
  });
});
