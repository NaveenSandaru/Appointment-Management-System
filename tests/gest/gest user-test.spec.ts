import { test, expect } from '@playwright/test';

test('gest user flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Browse Service Providers' }).first().click();
  await page.getByRole('button', { name: 'Book Now' }).first().click();
});