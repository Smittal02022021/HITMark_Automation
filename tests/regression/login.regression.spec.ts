import { test, expect } from '../../fixtures/base.fixture';
import { readTestData } from '../../utils/dataReader';
import { users } from '../../utils/testData';

interface LoginData {
  invalidUser: { username: string; password: string };
  emptyUser: { username: string; password: string };
}

const loginData = readTestData<LoginData>('login');

test.describe('Regression: Login', () => {
  test('shows error for invalid credentials @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(loginData.invalidUser.username, loginData.invalidUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('shows validation error for empty fields @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(loginData.emptyUser.username, loginData.emptyUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('shows validation error when password is left blank @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(users.validUser.username, loginData.emptyUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('shows validation error when username is left blank @regression', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(loginData.emptyUser.username, users.validUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('user can log in with valid credentials @smoke', async ({ page, loginPage }) => {
    await loginPage.goto('');
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/Technossus_HITMark/);
    await loginPage.validateLoginAsText(users.validUser.username);
  });
});
