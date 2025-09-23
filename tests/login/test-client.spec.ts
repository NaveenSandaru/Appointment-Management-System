import { test, expect } from '@playwright/test';

test('client login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  // login  with empty fields
  await page.getByRole('button', { name: 'Login' }).click();

  // login with invalid credentials
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashan');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Invalid Credentials').click();

  // login with valid credentials
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login' }).click();
});