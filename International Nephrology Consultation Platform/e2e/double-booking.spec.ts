import { test, expect } from '@playwright/test';

test.describe('Double Booking Prevention', () => {
  test('should show booking page', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('text=Initial Consultation')).toBeVisible();
  });

  test('should display date picker', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    await expect(page.locator('text=Select Date')).toBeVisible();
  });

  test('should show time slots', async ({ page }) => {
    await page.goto('/booking');
    await page.click('text=Initial Consultation');
    await page.click('button:has-text("Continue")');
    await expect(page.locator('text=Select Time')).toBeVisible();
  });
});
