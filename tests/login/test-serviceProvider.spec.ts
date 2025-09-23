import { test, expect } from '@playwright/test';

test('service provider login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123123123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto('http://localhost:3000/serviceproviderdashboard');
  await page.getByRole('tab', { name: 'Upcoming' }).click();
  await page.getByRole('tab', { name: 'Past' }).click();
  await page.getByRole('tab', { name: 'Today' }).click();
  await page.getByRole('button').first().click();
  await page.getByText('Logout').click();
});