import { test, expect } from '@playwright/test';

test('admin flow', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await expect(page.getByText('Admin Portal')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter admin ID' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login to Admin Panel' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter admin ID' }).click();
  await page.getByRole('textbox', { name: 'Enter admin ID' }).fill('A001');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('n');
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('naveen123');
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.getByRole('button', { name: 'Login to Admin Panel' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Welcome back! Here\'s what\'s')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Appointments' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Service Providers' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
  await page.getByRole('link', { name: 'Appointments' }).click();
  await expect(page.getByRole('link', { name: 'Appointments' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Appointments' })).toBeVisible();
  await page.getByRole('link', { name: 'Service Providers' }).click();
  
  await expect(page.getByRole('heading', { name: 'Service Providers' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Provider' })).toBeVisible();
  
  
  await page.getByRole('textbox', { name: 'Provider Email' }).click();
  await expect(page.getByText('Provider Email')).toBeVisible();
  await page.getByRole('textbox', { name: 'Provider Email' }).click();
  await page.getByRole('textbox', { name: 'Provider Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await page.getByRole('link', { name: 'Clients' }).click();
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Client' }).click();
  await expect(page.getByText('Add New ProviderClient')).toBeVisible();
  await expect(page.getByText('Client Email')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Client Email' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Client Email' }).click();
  await page.getByRole('textbox', { name: 'Client Email' }).fill('gayashandile@gmail.com');
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page.getByRole('button', { name: 'Add Service' })).toBeVisible();
  await page.getByRole('heading', { name: 'Services' }).click();
  await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Service' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Service' })).toBeVisible();
  await expect(page.getByText('Service Name')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Service Name' })).toBeVisible();
  await expect(page.getByText('Description')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
  await expect(page.getByText('Service Image')).toBeVisible();
  await page.getByRole('textbox', { name: 'Service Name' }).click();
  await page.getByRole('textbox', { name: 'Service Name' }).fill('saloon');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('abc');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Add Service' }).click();
  await expect(page.getByText('saloonabc')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  
  await expect(page.getByText('Admin Portal')).toBeVisible();
});