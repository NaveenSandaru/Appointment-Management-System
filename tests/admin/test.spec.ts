import { test, expect } from '@playwright/test';

test('admin flow', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await page.getByRole('textbox', { name: 'Enter admin ID' }).click();
  await page.getByRole('textbox', { name: 'Enter admin ID' }).fill('A001');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('n');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('naveen123');
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'Login to Admin Panel' }).click();
  await page.getByRole('link', { name: 'Appointments' }).click();
  await page.getByRole('link', { name: 'Service Providers' }).click();
  
  await page.pause();
  
  await page.getByRole('textbox', { name: 'Provider Email' }).click();
  await page.getByRole('textbox', { name: 'Provider Email' }).click();
  await page.getByRole('textbox', { name: 'Provider Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await page.getByRole('link', { name: 'Clients' }).click();
  await page.pause();
  
  await page.getByRole('textbox', { name: 'Client Email' }).click();
  await page.getByRole('textbox', { name: 'Client Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await page.getByRole('link', { name: 'Services' }).click();
  await page.getByRole('heading', { name: 'Services' }).click();
  await page.getByRole('button', { name: 'Add Service' }).click();
  await page.getByRole('textbox', { name: 'Service Name' }).click();
  await page.getByRole('textbox', { name: 'Service Name' }).fill('saloon');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('abc');
  
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  
  await page.getByRole('button', { name: 'Add Service' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});