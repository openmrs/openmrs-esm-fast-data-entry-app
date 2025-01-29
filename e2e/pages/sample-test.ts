import { Page } from '@playwright/test';

export class FastDataEntryPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(`forms`);
  }
}
