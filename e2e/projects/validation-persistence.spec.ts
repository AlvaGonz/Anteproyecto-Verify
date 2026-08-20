import { test, expect } from '@playwright/test';

test.describe('Persistencia de Resultado de Validación Documental (% Match)', () => {
  test('el resultado de validación y porcentaje de match permanece visible tras recargar la página', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');

    // Fill credentials if on login page
    if (page.url().includes('/login')) {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@verifinca.com');
        await passwordInput.fill('Admin123*');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 10000 });
      }
    }

    // Go to first project edit/documents page or specific project
    await page.goto('/#/admin/projects');
    await page.waitForLoadState('networkidle');

    const firstProjectLink = page.locator('table tbody tr a, [data-testid="project-row"] a, a[href*="/admin/projects/"]').first();
    if (await firstProjectLink.isVisible()) {
      await firstProjectLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Find any validation button in the required documents checklist
    const validateBtn = page.getByRole('button', { name: /Validar contra/i }).first();
    if (await validateBtn.isVisible()) {
      await validateBtn.click();
      
      // If discrepancy modal appears, proceed
      const proceedBtn = page.getByRole('button', { name: /Proceder|Continuar/i });
      if (await proceedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await proceedBtn.click();
      }

      // Check that match feedback card or % Match badge is visible
      const matchBadge = page.locator('text=/% Match|Validación Exitosa|Coincidencia Parcial/i').first();
      await expect(matchBadge).toBeVisible({ timeout: 10000 });

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // The match percentage / feedback card MUST remain visible after reload without clicking validate again
      await expect(matchBadge).toBeVisible({ timeout: 10000 });
    }
  });
});
