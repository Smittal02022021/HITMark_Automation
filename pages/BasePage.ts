import { Locator, Page } from '@playwright/test';

/**
 * Every page object extends this. Keep truly generic, cross-page
 * behaviour here (navigation, common waits, shared assertions helpers).
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async waitForVisible(locator: Locator, timeoutMs = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async isVisible(locator: Locator, timeoutMs = 3000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }
}
