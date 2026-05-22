import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Check mobile menu is available
    await expect(page.locator('button:has-text("Menu")')).toBeVisible();
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');

    // Check navigation is visible
    await expect(page.locator('text=Home')).toBeVisible();
  });

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');

    // Check full navigation
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Book Appointment')).toBeVisible();
  });

  test('booking page should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/booking');

    // Check consultation types are visible
    await expect(page.locator('text=Initial Consultation')).toBeVisible();
  });

  test('admin dashboard should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');

    // Check admin page loads
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('payment page should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/payment');

    // Check payment page loads
    await expect(page.locator('text=Payment')).toBeVisible();
  });
});
