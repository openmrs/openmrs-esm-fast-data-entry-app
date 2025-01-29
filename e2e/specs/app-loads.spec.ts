import { test, expect } from '@playwright/test';
import { FastDataEntryPage } from '../pages';

// This test is a sample E2E test. You can delete it.

test('app-loads', async ({ page }) => {
  const fastDataEntryPage = new FastDataEntryPage(page);
  await fastDataEntryPage.goto();
  await expect(page).toHaveTitle('Fast Data Entry');
});
