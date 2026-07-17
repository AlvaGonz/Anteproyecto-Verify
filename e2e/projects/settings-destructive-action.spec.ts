import { test, expect } from '@playwright/test';

test.describe('Settings Page - Destructive Action Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user login
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          nombre: 'Test',
          apellido: 'User',
          email: 'test@example.com',
          cedula: '123-4567890-1',
          role: 'DEVELOPER',
          telefono: '8095551234',
          rnc: '101000000',
          razonSocial: 'Test Company SRL',
          nombreComercial: 'Test Commercial',
          actividadEconomica: '6201 - Software Development',
        })
      });
    });
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock profile update
    await page.route('**/api/v1/users/me/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Perfil actualizado correctamente' })
        });
      } else {
        await route.continue();
      }
    });

    // Mock delete account
    await page.route('**/account/delete', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Cuenta marcada para eliminación. Tiene 14 días para recuperarla.' })
        });
      } else {
        await route.continue();
      }
    });

    // Mock DGII lookup
    await page.route('**/api/v1/dgii/lookup*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          rnc: '101000000',
          nombreRazonSocial: 'Test Company SRL',
          nombreComercial: 'Test Commercial',
          actividadEconomica: '6201 - Software Development',
          estado: 'ACTIVO'
        })
      });
    });
  });

  test('Guardar cambios is outside the danger zone', async ({ page }) => {
    await page.goto('/#/admin/settings');

    // Wait for the page to load
    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Find the save button - it should be in the main form area
    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await expect(saveButton).toBeVisible();

    // The save button should NOT be inside the danger zone
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await expect(dangerZone).toBeVisible();

    // Verify save button is not a descendant of danger zone
    const saveButtonInDangerZone = dangerZone.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await expect(saveButtonInDangerZone).toHaveCount(0);
  });

  test('Eliminar cuenta appears only in Zona de Peligro', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Find the danger zone section
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await expect(dangerZone).toBeVisible();

    // The delete account trigger should be inside the danger zone
    const deleteTrigger = dangerZone.locator('button:has-text("Eliminar Cuenta")');
    await expect(deleteTrigger).toBeVisible();

    // There should be no other "Eliminar Cuenta" buttons outside the danger zone
    const allDeleteButtons = page.locator('button:has-text("Eliminar Cuenta")');
    await expect(allDeleteButtons).toHaveCount(1);
  });

  test('Clicking Eliminar Cuenta opens confirmation modal', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Click the delete account trigger in the danger zone
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    const deleteTrigger = dangerZone.locator('button:has-text("Eliminar Cuenta")');
    await deleteTrigger.click();

    // Verify modal opens with correct title
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).toBeVisible();

    // Verify modal has the required helper text
    await expect(page.locator('text=Esta acción es permanente y no se puede deshacer.')).toBeVisible();

    // Verify bullet points
    await expect(page.locator('text=Perderás acceso a tu cuenta.')).toBeVisible();
    await expect(page.locator('text=Esta acción no se puede deshacer.')).toBeVisible();
    await expect(page.locator('text=Tu información asociada dejará de estar disponible según las reglas del sistema.')).toBeVisible();

    // Verify confirmation input label
    await expect(page.locator('label:has-text("Escribe ELIMINAR para confirmar")')).toBeVisible();

    // Verify buttons in modal
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
    // The confirm button in modal should be visible (but disabled initially)
    const modalConfirmButton = page.locator('[aria-labelledby="delete-account-modal-title"] button:has-text("Eliminar cuenta")');
    await expect(modalConfirmButton).toBeVisible();
  });

  test('Confirm button is disabled until typed confirmation is valid', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Open the modal
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();

    // Get the confirm button in the modal specifically
    const modalConfirmButton = page.locator('[aria-labelledby="delete-account-modal-title"] button:has-text("Eliminar cuenta")');

    // Initially should be disabled
    await expect(modalConfirmButton).toBeDisabled();

    // Type partial confirmation - should still be disabled
    const confirmInput = page.locator('input[placeholder="ELIMINAR"]');
    await confirmInput.fill('ELIMINA');
    await expect(modalConfirmButton).toBeDisabled();

    // Type full confirmation - should still be disabled (password not filled)
    await confirmInput.fill('ELIMINAR');
    await expect(modalConfirmButton).toBeDisabled();

    // Fill password - should now be enabled
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpassword123');
    await expect(modalConfirmButton).toBeEnabled();

    // Clear confirmation - should be disabled again
    await confirmInput.fill('');
    await expect(modalConfirmButton).toBeDisabled();
  });

  test('Cancel closes modal without side effects', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Open the modal
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).toBeVisible();

    // Click cancel
    await page.locator('button:has-text("Cancelar")').click();

    // Modal should be closed
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).not.toBeVisible();

    // Page should still be functional
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
  });

  test('Keyboard accessibility works for the modal', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Open the modal
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).not.toBeVisible();

    // Re-open modal
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).toBeVisible();

    // Tab navigation should work - focus should be trapped
    await page.keyboard.press('Tab');
    // First focusable element should be the cancel button or confirmation input
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('Escape key closes modal', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Open the modal
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.locator('h2:has-text("¿Eliminar cuenta?")')).not.toBeVisible();
  });

  test('Full delete flow works when confirmed', async ({ page }) => {
    await page.goto('/#/admin/settings');

    await expect(page.locator('text=Mi Perfil')).toBeVisible();

    // Open the modal
    const dangerZone = page.locator('section:has(h2:has-text("Zona de Peligro"))');
    await dangerZone.locator('button:has-text("Eliminar Cuenta")').click();

    // Fill confirmation
    const confirmInput = page.locator('input[placeholder="ELIMINAR"]');
    await confirmInput.fill('ELIMINAR');

    // Fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpassword123');

    // Click confirm button in modal
    const modalConfirmButton = page.locator('[aria-labelledby="delete-account-modal-title"] button:has-text("Eliminar cuenta")');
    await modalConfirmButton.click();

    // Should redirect to login page (logout is called after successful deletion)
    await expect(page).toHaveURL(/.*#\/login/, { timeout: 10000 });
  });
});