import { test, expect } from '@playwright/test';

test.describe('Subscription Plan Enforcement E2E', () => {
  // Test user IDs
  const testUserId = 'e2e-test-user';
  const guestUserId = 'e2e-guest-user';

  // Mock user data for different plan scenarios
  const mockUsers = {
    professional: {
      id: testUserId,
      nombre: 'Test',
      apellido: 'Professional',
      role: 'DEVELOPER',
      cedula: '001-0000001-1',
      telefono: '8095551234',
      rnc: '101000000',
    },
    guest: {
      id: guestUserId,
      nombre: 'Invitado',
      apellido: 'Test',
      email: 'invitado@test.com',
      role: 'user',
      plan: null,
      invitedByPlan: 'Corporativo',
      inviterPlan: 'Corporativo',
      isGuest: true,
    },
    owner: {
      id: 'owner-001',
      role: 'owner',
      plan: 'Corporativo',
      isGuest: false,
    }
  };

  const mockPlans = {
    professional: {
      plan: 'Profesional',
      planPrice: 60,
      billingCycle: 'month',
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000 * 10).toISOString(),
      isManagedByStripe: true,
      isGuest: false,
      planLimits: {
        maxConsultas: 25,
        maxProyectos: 5,
        presentacionPublica: true,
        qrIncluido: true,
        maxUsuariosSecundarios: 0,
        maxAlmacenamientoMb: 200,
        alertasTiempoReal: false,
        modeloLm: false,
        validacionLote: false,
        exportacionExcel: false,
        exportacionPdf: true,
        integracionCrm: false,
        soporteTipo: 'Email',
        accesoApi: false,
        consultasUsadas: 5,
        proyectosCreados: 2
      }
    },
    consultor: {
      plan: 'Consultor',
      planPrice: 0,
      billingCycle: 'month',
      subscriptionStatus: 'free',
      isManagedByStripe: false,
      isGuest: false,
      planLimits: {
        maxConsultas: 1,
        maxProyectos: 1,
        presentacionPublica: false,
        qrIncluido: false,
        maxUsuariosSecundarios: 0,
        maxAlmacenamientoMb: 0,
        alertasTiempoReal: false,
        modeloLm: false,
        validacionLote: false,
        exportacionExcel: false,
        exportacionPdf: false,
        integracionCrm: false,
        soporteTipo: 'Comunidad',
        accesoApi: false,
        consultasUsadas: 0,
        proyectosCreados: 0
      }
    },
    corporativoGuest: {
      subscriptionStatus: null,
      plan: null,
      isGuest: true,
      inviterPlan: 'Corporativo',
      planPrice: 500,
      planLimits: {
        maxConsultas: -1,
        maxProyectos: 50,
        presentacionPublica: true,
        qrIncluido: true,
        maxUsuariosSecundarios: -1,
        maxAlmacenamientoMb: 10240,
        alertasTiempoReal: true,
        modeloLm: true,
        validacionLote: true,
        exportacionExcel: true,
        exportacionPdf: true,
        integracionCrm: true,
        soporteTipo: 'Account Manager',
        accesoApi: true,
        consultasUsadas: 0,
        proyectosCreados: 0
      }
    }
  };

  async function setupAuth(page: import('@playwright/test').Page, userType: keyof typeof mockUsers = 'professional') {
    const user = mockUsers[userType];
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user)
      });
    });
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  }

  async function setupSubscription(page: import('@playwright/test').Page, planType: keyof typeof mockPlans) {
    const plan = mockPlans[planType];
    await page.route('**/api/v1/subscriptions/my-status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plan)
      });
    });
  }

  async function stubSettingsApis(page: import('@playwright/test').Page) {
    await page.route('**/api/v1/users*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }) });
    });
    await page.route('**/api/v1/plans*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupAuth(page, 'professional');
    await setupSubscription(page, 'professional');
    await stubSettingsApis(page);
  });

  test('User with Professional plan (exportacionPdf=true) can see PDF export option', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Check that PDF export is shown as available
    await expect(page.locator('[data-testid="export-pdf-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-pdf-btn"]')).toContainText('PDF');
  });

  test('User with Consultor plan (exportacionPdf=false) cannot see PDF export option', async ({ page }) => {
    await setupSubscription(page, 'consultor');
    
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // PDF export should not be visible or should be disabled
    await expect(page.locator('[data-testid="export-pdf-btn"]')).not.toBeVisible();
  });

  test('User with Professional plan (accesoApi=true) sees API access section', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    await expect(page.locator('[data-testid="api-access-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-access-section"]')).toContainText('API');
  });

  test('User with Consultor plan (accesoApi=false) does not see API access section', async ({ page }) => {
    await setupSubscription(page, 'consultor');
    
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    await expect(page.locator('[data-testid="api-access-section"]')).not.toBeVisible();
  });

  test('User with Professional plan (presentacionPublica=true) can publish project', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Check that public presentation is enabled
    await expect(page.locator('[data-testid="project-publication-control"]')).toBeEnabled();
  });

  test('User with Consultor plan (presentacionPublica=false) cannot enable public project presentation', async ({ page }) => {
    await setupSubscription(page, 'consultor');
    
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    await expect(page.locator('[data-testid="project-publication-control"]')).toBeDisabled();
    await expect(page.locator('[data-testid="project-publication-control"]')).toHaveAttribute('title', /no permite presentar/);
  });

  test('Usage UI displays consultasUsadas and MaxConsultas from API response', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Check consultas limit display
    await expect(page.locator('[data-testid="consultas-limit"]')).toBeVisible();
    await expect(page.locator('[data-testid="consultas-limit"]')).toContainText('5 / 25');
  });

  test('Guest user sees inviter plan limits and badge', async ({ page }) => {
    await setupAuth(page, 'guest');
    await setupSubscription(page, 'corporativoGuest');
    await stubSettingsApis(page);

    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Guest badge should be visible
    await expect(page.locator('.guest-plan-badge')).toBeVisible();
    await expect(page.locator('[data-testid="subscription-plan-card"]')).toContainText('Corporativo');

    // No cancel/modify buttons for guests
    await expect(page.getByRole('button', { name: /cancelar suscripci/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /modificar suscripci/i })).not.toBeVisible();
  });

  test('Change plan capability through isolated test seed, reload page, assert behavior changes', async ({ page }) => {
    // Start with Consultor plan
    await setupSubscription(page, 'consultor');
    await page.goto('/#/admin/settings');
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Verify Consultor limits
    await expect(page.locator('[data-testid="consultas-limit"]')).toContainText('0 / 1');
    await expect(page.locator('[data-testid="export-pdf-btn"]')).not.toBeVisible();

    // Now change to Professional plan by re-routing
    await setupSubscription(page, 'professional');
    
    // Reload page to fetch new plan limits
    await page.reload();
    await page.getByRole('button', { name: /suscripci/i }).click();

    // Verify Professional limits
    await expect(page.locator('[data-testid="consultas-limit"]')).toContainText('5 / 25');
    await expect(page.locator('[data-testid="export-pdf-btn"]')).toBeVisible();
  });
});
