import { Page } from '@playwright/test';

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
}
