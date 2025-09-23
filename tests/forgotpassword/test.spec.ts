import { test, expect } from '@playwright/test';

test('forgot password', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('link', { name: 'Forgot Password?' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('link', { name: 'Forgot Password?' }).click();
 
  await page.getByRole('button', { name: 'Client' }).click();

  await page.getByRole('combobox').first().selectOption('1');
  await page.getByRole('textbox', { name: 'Enter your answer' }).first().click();
  await page.getByRole('textbox', { name: 'Enter your answer' }).first().fill('cat');
  await page.getByRole('combobox').nth(1).selectOption('2');
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(1).fill('mom');
  await page.getByRole('combobox').nth(2).selectOption('8');
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(2).fill('popp');
  await page.getByRole('button', { name: 'Verify Security Questions' }).click();
  
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(2).press('ArrowLeft');
  await page.getByRole('textbox', { name: 'Enter your answer' }).nth(2).fill('pop');
  await page.getByRole('button', { name: 'Verify Security Questions' }).click();


  await page.getByRole('textbox', { name: 'New Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'New Password', exact: true }).fill('12344');
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('textbox', { name: 'New Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'New Password', exact: true }).fill('12345678');
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('textbox', { name: 'Confirm New Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  
  await page.getByRole('button', { name: 'Back to Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'DD d dilesh' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
});