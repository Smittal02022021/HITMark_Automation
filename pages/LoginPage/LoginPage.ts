import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Example Page Object. Replace the locators below with the real ones
 * from your new web application once it's available for testing.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginAsUsernameText: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'Account Name' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.loginAsUsernameText = page.locator('#c0layoutcontainer');
    this.errorMessage = page.locator('#login_error_msg')
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async validateLoginAsText(username: string) {
    await this.page.waitForLoadState('load');
    await expect(this.loginAsUsernameText).toContainText(username);
    console.log(`Login successful for user: ${username}`);
  }
}
