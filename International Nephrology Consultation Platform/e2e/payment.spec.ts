import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('should navigate to payment page', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('text=Payment')).toBeVisible();
  });

  test('should display payment information', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('text=Payment Information')).toBeVisible();
  });

  test('should show consultation type in payment', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('text=Consultation Type')).toBeVisible();
  });

  test('should display payment amount', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('text=₹')).toBeVisible();
  });
});
