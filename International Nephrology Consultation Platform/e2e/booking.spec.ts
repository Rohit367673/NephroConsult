import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Book Appointment');
    await expect(page).toHaveURL(/\/booking/);
  });

  test('should display consultation types', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Initial Consultation')).toBeVisible();
    await expect(page.locator('text=Follow-up Consultation')).toBeVisible();
  });

  test('should select consultation type', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    // Should proceed to next step
    await expect(page.locator('text=Select Date')).toBeVisible();
  });

  test('should show date picker', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    await expect(page.locator('text=Select Date')).toBeVisible();
  });

  test('should show patient information form', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    // Select a date
    await page.click('button:has-text("Continue")');
    // Should show patient info form
    await expect(page.locator('text=Patient Information')).toBeVisible();
  });

  test('should show medical information form', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Continue")');
    // Should show medical info form
    await expect(page.locator('text=Medical Information')).toBeVisible();
  });

  test('should show review and confirmation', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Continue")');
    // Should show review step
    await expect(page.locator('text=Review & Confirm')).toBeVisible();
  });

  test('should have navigation buttons', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    // Should have back button
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
  });
});
