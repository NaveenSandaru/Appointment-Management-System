import { test, expect } from '@playwright/test';

test('client login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await page.getByRole('link', { name: 'Sign In' }).click();
  // login  with empty fields

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login Failed')).toBeVisible();
  await expect(page.getByText('Invalid Credentials')).toBeVisible();
  // login with invalid credentials
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashan');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login Failed')).toBeVisible();
  await page.getByText('Invalid Credentials').click();
  await expect(page.getByText('Invalid Credentials')).toBeVisible();

  // login with valid credentials
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page.getByRole('button', { name: 'DG d gayashan' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured Services' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Dentist' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Lawyer' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Bookings' })).toBeVisible();
  await expect(page.locator('.max-w-7xl > div:nth-child(2) > .bg-card')).toBeVisible();
});