import { test, expect } from '@playwright/test';

test.describe('Settings Page - Profile Extension', () => {
  test.beforeEach(async ({ page }) => {
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
          razonSocial: 'Test Company SRL',
          nombreComercial: 'Test Commercial',
          actividadEconomica: '6201 - Software Development',
          direccion: '',
          provincia: '',
          nickname: '',
        })
      });
    });
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/#/admin/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
  });

  test('TC-01: Fields direccion, provincia, nickname render on settings page', async ({ page }) => {
    await expect(page.locator('#mp-direccion')).toBeVisible();
    await expect(page.locator('#mp-provincia')).toBeVisible();
    await expect(page.locator('#mp-nickname')).toBeVisible();
  });

  test('TC-02: Submit with empty optional fields succeeds (they are optional)', async ({ page }) => {
    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Perfil actualizado exitosamente.' })
      });
    });

    // Make the form dirty by modifying an existing field
    await page.locator('#mp-nombre').fill('Test Mod');

    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await expect(saveButton).toBeEnabled({ timeout: 2000 });
    await saveButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });
  });

  test('TC-03: Submit fills, saves and persists all optional fields', async ({ page }) => {
    let fetchCount = 0;
    await page.route('**/api/auth/me', async route => {
      fetchCount++;
      if (fetchCount > 1) {
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
            razonSocial: 'Test Company SRL',
            nombreComercial: 'Test Commercial',
            actividadEconomica: '6201 - Software Development',
            direccion: 'Calle Principal 123',
            provincia: 'Santo Domingo',
            nickname: 'testnick',
          })
        });
      } else {
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
            direccion: '',
            provincia: '',
            nickname: '',
          })
        });
      }
    });

    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Perfil actualizado exitosamente.' })
      });
    });

    await page.locator('#mp-direccion').fill('Calle Principal 123');
    await page.locator('#mp-provincia').selectOption('Santo Domingo');
    await page.locator('#mp-nickname').fill('testnick');

    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });
  });

  test('TC-04: User WITH rnc shows badge Vendedor Verificado DGII', async ({ page }) => {
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id', nombre: 'Test', apellido: 'User', email: 'test@example.com',
          role: 'DEVELOPER', cedula: '12345678901', telefono: '8095551234',
          rnc: '131000000', razonSocial: 'Verified Company SRL',
          direccion: '', provincia: '', nickname: '',
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
    await expect(page.locator('text=Vendedor Verificado DGII')).toBeVisible();
  });

  test('TC-05: User WITHOUT rnc shows badge Vendedor Particular', async ({ page }) => {
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id', nombre: 'Test', apellido: 'User', email: 'test@example.com',
          role: 'DEVELOPER', cedula: '12345678901', telefono: '8095551234',
          rnc: null, razonSocial: null,
          direccion: '', provincia: '', nickname: '',
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
    await expect(page.locator('text=Vendedor Particular')).toBeVisible();
  });

  test('TC-06: Nickname already taken shows API 409 error', async ({ page }) => {
    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'El apodo ya está en uso por otro usuario.' })
      });
    });

    await page.locator('#mp-direccion').fill('Calle Principal 123');
    await page.locator('#mp-provincia').selectOption('Santo Domingo');
    await page.locator('#mp-nickname').fill('takennick');

    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    await expect(page.locator('text=El apodo ya está en uso por otro usuario.')).toBeVisible({ timeout: 5000 });
  });
});
