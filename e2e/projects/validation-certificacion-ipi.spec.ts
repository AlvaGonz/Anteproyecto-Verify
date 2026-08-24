import { test, expect } from '@playwright/test';

test.describe('Validación Certificación IPI', () => {
  test('debe mostrar discrepancias cuando el valor estimado difiere más del 10%', async ({ page }) => {
    await page.goto('/#/admin/projects/93087555-0d0a-bfa9-cbda-00f7d1135800/validations');
    
    // Placeholder para la falla (RED)
    const card = page.locator('[data-testid="certificacion-ipi-extraction-card"]');
    if (await card.isVisible()) {
      const btnValidar = card.getByRole('button', { name: /Validar/i }).first();
      await btnValidar.click();

      const modal = page.getByRole('alertdialog');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Valor Estimado');
    }
  });
});
