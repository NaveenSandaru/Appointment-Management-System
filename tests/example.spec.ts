import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to your application's URL (update this with your actual URL)
  await page.goto('http://localhost:3000');
  
  // Basic assertion to check if the page loads
  await expect(page).toHaveTitle("Appointment Booking System");
});

test('screenshot example', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshots/homepage.png' });
});
