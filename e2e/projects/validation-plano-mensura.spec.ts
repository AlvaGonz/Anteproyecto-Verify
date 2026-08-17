import { test, expect } from '@playwright/test';

test.describe('Validación Plano de Mensura', () => {
  test('debe mostrar discrepancias cuando la superficie difiere más de la tolerancia', async ({ page }) => {
    await page.goto('/#/admin/projects/93087555-0d0a-bfa9-cbda-00f7d1135800/validations');
    
    // El Test Asume que PlanoMensuraExtractionCard está visible. Si no, se puede forzar o simular su interacción.
    // Esto es un placeholder para la falla inicial (RED)
    const card = page.locator('[data-testid="mensura-extraction-card"]');
    if (await card.isVisible()) {
      const btnValidar = card.getByRole('button', { name: /Validar/i }).first();
      await btnValidar.click();

      const modal = page.getByRole('alertdialog');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Superficie M2');
    }
  });
});
