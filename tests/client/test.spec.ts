import { test, expect } from '@playwright/test';

test('client flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Browse Service Providers' }).first().click();
  await page.goto('http://localhost:3000/serviceprovider/9747fc9e-6ca7-4f7d-8fce-e8204745981d');
  await page.getByRole('button', { name: 'Book Now' }).first().click();
  await page.goto('http://localhost:3000/book/naveensandaru2%40gmail.com');
  
  await page.getByRole('gridcell', { name: '20' }).click();
  await page.getByRole('button', { name: '11:15' }).click();
  await page.getByRole('button', { name: 'Confirm Appointment' }).click();
  await page.getByRole('textbox', { name: 'Enter any special requests or' }).click();
  await page.getByRole('textbox', { name: 'Enter any special requests or' }).fill('hi');
  await page.getByRole('button', { name: 'Add Note & Book' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  
  await page.getByRole('button', { name: 'DD d dilesh' }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.locator('input[type="tel"]').click();
  await page.locator('input[type="tel"]').fill('04561237800');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'DD d dilesh' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
});