import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should navigate to admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('should display appointments list', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Appointments')).toBeVisible();
  });

  test('should have navigation tabs', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Upcoming')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('should show consultation details', async ({ page }) => {
    await page.goto('/admin');
    // Should have consultation cards
    await expect(page.locator('text=Patient')).toBeVisible();
  });
});
