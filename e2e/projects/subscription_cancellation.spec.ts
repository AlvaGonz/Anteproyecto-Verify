import { test, expect } from '@playwright/test';

test.describe('Subscription Cancellation and Reactivation UX', () => {
  const mockSubscription = {
    plan: 'profesional',
    planPrice: 60,
    billingCycle: 'month',
    subscriptionStatus: 'active',
    currentPeriodEnd: new Date(Date.now() + 86400000 * 10).toISOString(),
    isManagedByStripe: true,
  };

  test.beforeEach(async ({ page }) => {
    // Mock user login
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          nombre: 'Test',
          apellido: 'User',
          correoElectronico: 'test@example.com',
          rol: 'DEVELOPER'
        })
      });
    });

    // Mock initial subscription state
    await page.route('**/api/v1/subscriptions/my-status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSubscription)
      });
    });

    await page.route('**/api/v1/users*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/v1/plans*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });

  test('User can cancel active subscription and UI reflects canceling status', async ({ page }) => {
    await page.goto('/#/admin/settings');
    
    // Click the Suscripción tab
    await page.locator('text=Suscripción').click();

    // Wait for the active status to appear
    await expect(page.locator('text=Suscripción Activa')).toBeVisible();
    await expect(page.locator('text=Cancelar Suscripción')).toBeVisible();

    // Mock the cancel API response
    await page.route('**/api/v1/subscriptions/cancel', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cancelación programada.' })
      });
    });

    // Mock the subsequent fetch of subscription
    await page.route('**/api/v1/subscriptions/my-status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockSubscription,
          subscriptionStatus: 'canceling'
        })
      });
    });

    // Click cancel button to open modal
    await page.locator('text=Cancelar Suscripción').first().click();

    // Verify modal appears and click confirmation button
    await expect(page.locator('text=¿Estás seguro de que deseas cancelar tu suscripción?')).toBeVisible();
    await page.locator('text=Sí, cancelar suscripción').click();

    // Verify the status updates to canceling and reactivate button appears
    await expect(page.locator('text=Cancelación Programada')).toBeVisible();
    await expect(page.locator('text=Reactivar Suscripción')).toBeVisible();
  });

  test('User can reactivate canceling subscription', async ({ page }) => {
    // Override initial state for this test
    await page.route('**/api/v1/subscriptions/my-status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockSubscription,
          subscriptionStatus: 'canceling'
        })
      });
    });

    await page.goto('/#/admin/settings');
    
    // Click the Suscripción tab
    await page.locator('text=Suscripción').click();

    // Wait for canceling status
    await expect(page.locator('text=Cancelación Programada')).toBeVisible();
    
    // Mock reactivate API
    await page.route('**/api/v1/subscriptions/reactivate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Suscripción reactivada.' })
      });
    });

    // Mock the subsequent fetch of subscription
    await page.route('**/api/v1/subscriptions/my-status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockSubscription,
          subscriptionStatus: 'active'
        })
      });
    });

    // Click reactivate button
    await page.locator('text=Reactivar Suscripción').click();

    // Verify the status updates back to active
    await expect(page.locator('text=Suscripción Activa')).toBeVisible();
    await expect(page.locator('text=Cancelar Suscripción')).toBeVisible();
  });
});
