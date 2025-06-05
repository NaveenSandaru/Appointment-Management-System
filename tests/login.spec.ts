import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('http://localhost:3000/auth/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should show error with empty fields', async ({ page }) => {
    // Click login without entering any data
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error with invalid email format', async ({ page }) => {
    // Enter invalid email format
    await page.getByLabel(/email/i).fill('invalidemail');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for validation message
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should show error with incorrect credentials', async ({ page }) => {
    // Enter incorrect credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  
  test('should maintain login state after page refresh', async ({ page }) => {
    // Login with valid credentials
    await page.getByLabel(/email/i).fill('gayashankdd@gmail.com');
    await page.getByLabel(/password/i).fill('12345678');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Verify login successful
    await expect(page).toHaveURL(/dashboard/);
    
    // Refresh the page
    await page.reload();
    
    // Verify still logged in
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should be able to logout', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Find and click logout button/link
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/login/);
  });
}); 