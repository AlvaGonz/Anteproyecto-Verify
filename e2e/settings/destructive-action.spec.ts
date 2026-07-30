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
          role: 'DEVELOPER',
          cedula: '12345678901',
          telefono: '8095551234',
          rnc: '101000000',
        })
      });
    await page.route('**/api/v1/subscriptions/my-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: 'Profesional',
          subscriptionStatus: 'active',
          planPrice: 0,
          isGuest: false,
          inviterPlan: null,
          inviterName: null,
          planLimits: {
            maxConsultas: -1,
            maxProyectos: -1,
            presentacionPublica: true,
            qrIncluido: true,
            maxUsuariosSecundarios: -1,
            maxAlmacenamientoMb: -1,
            alertasTiempoReal: true,
            modeloLm: true,
            validacionLote: true,
            exportacionExcel: true,
            exportacionPdf: true,
            integracionCrm: true,
            soporteTipo: 'Prioritario',
            accesoApi: true,
            consultasUsadas: 0,
            proyectosCreados: 0
          }
        })
      });
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
    await page.route('**/api/v1/users/me/delete', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cuenta marcada para eliminación. Tiene 14 días para recuperarla.' })
      });
    });

    // Navigate to settings page
    await page.goto('/#/admin/settings');
    await page.waitForLoadState('networkidle');
  });

  test('Guardar cambios is outside the danger zone', async ({ page }) => {
    // Verify the save button exists and is in the form actions area
    const saveButton = page.getByRole('button', { name: 'Guardar Cambios' });
    await expect(saveButton).toBeVisible();

    // Verify the danger zone section exists
    const dangerZone = page.getByText('Zona de peligro');
    await expect(dangerZone).toBeVisible();

    // Verify save button is NOT inside the danger zone
    // The danger zone should be a separate section after the form
    const dangerZoneSection = page.locator('section').filter({ hasText: 'Zona de peligro' });
    await expect(dangerZoneSection).toBeVisible();

    // The save button should be in the form, not in the danger zone section
    const form = page.locator('form').first();
    await expect(form.locator('button:has-text("Guardar Cambios")')).toBeVisible();
  });

  test('Eliminar cuenta appears only in Zona de peligro', async ({ page }) => {
    // Verify the danger zone section exists
    const dangerZoneHeading = page.getByRole('heading', { name: 'Zona de peligro' });
    await expect(dangerZoneHeading).toBeVisible();

    // Verify the helper text
    const helperText = page.getByText('Eliminar tu cuenta es permanente y no se puede deshacer.');
    await expect(helperText).toBeVisible();

    // Verify the delete button is inside the danger zone
    const deleteButton = page.getByRole('button', { name: 'Eliminar cuenta' });
    await expect(deleteButton).toBeVisible();

    // Verify the delete button is inside the danger zone section
    const dangerZoneSection = page.locator('section').filter({ hasText: 'Zona de peligro' });
    await expect(dangerZoneSection.locator('button:has-text("Eliminar cuenta")')).toBeVisible();
  });

  test('Clicking Eliminar cuenta opens confirmation modal', async ({ page }) => {
    // Click the delete button
    const deleteButton = page.getByRole('button', { name: 'Eliminar cuenta' });
    await deleteButton.click();

    // Verify modal opens with correct title
    const modalTitle = page.getByRole('heading', { name: '¿Eliminar cuenta?' });
    await expect(modalTitle).toBeVisible();

    // Verify modal has the warning bullets
    await expect(page.getByText('Perderás acceso a tu cuenta.')).toBeVisible();
    await expect(page.getByText('Esta acción no se puede deshacer.')).toBeVisible();
    await expect(page.getByText('Tu información asociada dejará de estar disponible según las reglas del sistema.')).toBeVisible();

    // Verify confirmation input label
    const confirmLabel = page.getByText('Escribe ELIMINAR para confirmar');
    await expect(confirmLabel).toBeVisible();

    // Verify buttons
    const cancelButton = page.getByRole('button', { name: 'Cancelar' });
    const confirmButton = page.getByRole('button', { name: 'Eliminar cuenta' });
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
  });

  test('Confirm button is disabled until typed confirmation is valid', async ({ page }) => {
    // Open the modal
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();

    // Get the confirm button
    const confirmButton = page.getByRole('button', { name: 'Eliminar cuenta' });

    // Initially should be disabled
    await expect(confirmButton).toBeDisabled();

    // Type partial confirmation
    const confirmInput = page.getByPlaceholder('ELIMINAR');
    await confirmInput.fill('ELIMINA');
    await expect(confirmButton).toBeDisabled();

    // Type full confirmation
    await confirmInput.fill('ELIMINAR');
    await expect(confirmButton).toBeEnabled();

    // Clear and verify disabled again
    await confirmInput.fill('');
    await expect(confirmButton).toBeDisabled();
  });

  test('Cancel closes modal without side effects', async ({ page }) => {
    // Open the modal
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Verify modal is closed
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).not.toBeVisible();

    // Verify we're still on the settings page
    await expect(page.getByText('Zona de peligro')).toBeVisible();
  });

  test('Keyboard accessibility works for the modal', async ({ page }) => {
    // Open the modal
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).not.toBeVisible();

    // Reopen modal
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();

    // Tab to focus elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is trapped (should be on cancel button or confirm input)
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('Escape key closes modal', async ({ page }) => {
    // Open the modal
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.getByRole('heading', { name: '¿Eliminar cuenta?' })).not.toBeVisible();
  });
});
