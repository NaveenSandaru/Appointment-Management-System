import { test, expect } from '@playwright/test';

test('client flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('gayashankdd@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Password$/ }).getByRole('button').click();
  await expect(page.getByText('Remember me')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await expect(page.getByText('Or continue with')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('logoHomeServicesDDd dilesh')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'Welcome back, dFind and book' }).nth(1)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Dentist' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Lawyer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Browse Service Providers' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Browse Service Providers' }).first().click();
  await page.goto('http://localhost:3000/serviceprovider/9747fc9e-6ca7-4f7d-8fce-e8204745981d');
  await page.getByRole('button', { name: 'Book Now' }).first().click();
  await page.pause();
 // await page.goto('http://localhost:3000/book/naveensandaru2%40gmail.com');

 
 

  await page.getByRole('button', { name: 'Confirm Appointment' }).click();
  await expect(page.getByRole('heading', { name: 'Add a Note (Optional)' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter any special requests or' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Book Without Note' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter any special requests or' }).click();
  await page.getByRole('textbox', { name: 'Enter any special requests or' }).fill('hi');
  await page.getByRole('button', { name: 'Add Note & Book' }).click();
  await expect(page.getByText('Success', { exact: true })).toBeVisible();
  await expect(page.getByText('Your appointment has been')).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
  await expect(page.locator('div').filter({ hasText: /^NSDentistNaveen Samarawickrama"hi"2025-06-2011:15:00 - 11:30:00UpcomingCancel$/ }).first()).toBeVisible();
  await expect(page.getByText('Upcoming')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Appointment cancelled')).toBeVisible();
  await expect(page.getByText('The appointment has been')).toBeVisible();
 
  await page.getByRole('button', { name: 'DD d dilesh' }).click();
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await expect(page.getByRole('heading', { name: 'd dilesh' })).toBeVisible();
  await expect(page.getByText('gayashankdd@gmail.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.locator('input[type="tel"]').click();
  await page.locator('input[type="tel"]').fill('04561237899');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Profile updated successfully')).toBeVisible();
  await expect(page.locator('input[type="tel"]')).toBeVisible();
  await page.getByRole('button', { name: 'DD d dilesh' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page.getByText('User not found')).toBeVisible();
  await expect(page.getByText('logoHomeServicesSign In')).toBeVisible();
});