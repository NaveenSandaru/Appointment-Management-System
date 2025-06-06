import { test, expect } from '@playwright/test';

test('service provider flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123123123');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:3000/serviceproviderdashboard');
  await page.getByRole('tab', { name: 'Upcoming' }).click();
  await page.getByRole('tab', { name: 'Past' }).click();
  await page.getByRole('tab', { name: 'Today' }).click();
  await page.getByRole('tab', { name: 'Upcoming' }).click();
  await page.locator('input[type="date"]').fill('2025-06-06');
  await page.getByRole('button', { name: 'Block Time' }).click();
  await page.getByRole('textbox', { name: 'Date' }).fill('2025-06-12');
  await page.getByRole('button', { name: 'Block Time Slot' }).click();
  await page.getByRole('tab', { name: 'Today' }).click();
  await page.getByRole('button', { name: 'Cancel Block' }).click();
  await page.getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.locator('input[type="tel"]').click();
  await page.locator('input[type="tel"]').fill('0775146745');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('button', { name: 'Back to Dashboard' }).click();
  await page.getByRole('button').first().click();
  await page.getByText('Logout').click();
});