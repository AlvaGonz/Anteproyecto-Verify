import { test, expect } from '@playwright/test';

test('Profesional plan project limit is enforced', async ({ page }) => {
  // Setup: The user limit@test.com is already seeded with the Profesional plan 
  // and has 5 projects (the maximum for this plan).
  
  await page.goto('/#/login');
  await page.fill('input[name="email"]', 'limit@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/dashboard');
  await page.click('text=NUEVO EXPEDIENTE');
  
  // This 6th project creation should fail because the limit is 5.
  await page.fill('input[name="nombre"]', 'Proyecto 6 (Sobre Limite)');
  await page.fill('input[name="ubicacionTexto"]', 'Test Location');
  await page.click('button:has-text("Guardar y Continuar")');

  // Verify the quota exceeded error appears (adjust text to match actual frontend UI)
  await expect(page.locator('text=límite')).toBeVisible({ timeout: 5000 });
});
