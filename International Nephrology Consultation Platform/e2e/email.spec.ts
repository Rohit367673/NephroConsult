import { test, expect } from '@playwright/test';

test.describe('Email Confirmation', () => {
  test('should show payment success page', async ({ page }) => {
    await page.goto('/payment/success');
    await expect(page.locator('text=Payment Successful')).toBeVisible();
  });

  test('should display confirmation message', async ({ page }) => {
    await page.goto('/payment/success');
    await expect(page.locator('text=Confirmation')).toBeVisible();
  });

  test('should show appointment details on success', async ({ page }) => {
    await page.goto('/payment/success');
    await expect(page.locator('text=Appointment')).toBeVisible();
  });
});
