import { test, expect } from '@playwright/test';

test('gest user flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'Welcome!Find and book the' }).nth(1)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured Services' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Dentist' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Lawyer' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Bookings', exact: true })).toBeVisible();
  await expect(page.locator('.max-w-7xl > div:nth-child(2) > .bg-card')).toBeVisible();
  await expect(page.getByText('NameYour trusted partner for')).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Services' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'logo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View all' }).getByRole('button')).toBeVisible();
  await page.getByRole('button', { name: 'Browse Service Providers' }).first().click();
  await page.getByRole('button', { name: 'Book Now' }).first().click();
  await expect(page.getByText('Authentication Required')).toBeVisible();
  await expect(page.getByText('Please log in to book an')).toBeVisible();
});