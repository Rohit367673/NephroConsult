import { test, expect } from '@playwright/test';

test.describe('AI Doctor Page Verification', () => {
  test('should navigate to homepage, verify elements, and navigate to AI doctor page', async ({ page, isMobile }) => {
    // 1. Load Homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/NephroConsult/);

    // 2. Verify navigation header has "AI Doctor" link/button
    if (isMobile) {
      // In mobile view, click the menu button first
      const menuButton = page.locator('header button:has(svg)').first();
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for transition
    }

    const headerAiDoctor = page.locator('button:has-text("AI Doctor"), a:has-text("AI Doctor")').first();
    await expect(headerAiDoctor).toBeVisible();
    await headerAiDoctor.click();

    // 3. Verify it navigated to /ai-doctor in the same tab
    await expect(page).toHaveURL(/\/ai-doctor/);

    // 4. Verify iframe is visible
    const iframe = page.locator('iframe[src*="ai-assistant-frontend-lilac.vercel.app"]');
    await expect(iframe).toBeVisible();

    // 5. Navigate back to homepage
    await page.goto('/');

    // 6. Verify hero section "Consult AI Doctor" button and click it
    const heroConsultAiDoctor = page.locator('button:has-text("Consult AI Doctor")').first();
    await expect(heroConsultAiDoctor).toBeVisible();
    await heroConsultAiDoctor.click();

    // 7. Verify navigation to /ai-doctor
    await expect(page).toHaveURL(/\/ai-doctor/);
  });
});
