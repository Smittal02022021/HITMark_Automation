import { test, expect } from '../../fixtures/base.fixture';
import { users } from '../../utils/testData';

/**
 * SMOKE SUITE
 * Keep this suite small and fast - only the critical happy paths that
 * confirm the build is stable enough to test further (login, homepage
 * loads, core nav works, etc). This is what you'd run on every deploy.
 */
test.describe('Smoke: Login', () => {
  test('user can log in with valid credentials @smoke', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/Technossus_HITMark/);
    await loginPage.validateLoginAsText(users.validUser.username);
  });
});
