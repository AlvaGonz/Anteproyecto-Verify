import { test, expect } from '@playwright/test';

const PROJECT_WITH_DEBT = 'proj-ipi-debt-001';
const PROJECT_WITHOUT_DEBT = 'proj-ipi-clean-001';
const PROJECT_RESOLVED = 'proj-ipi-resolved-001';

test.describe('IPI Debt Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ id: 'user-001', email: 'admin@test.com', nombre: 'Admin', apellido: 'Test', role: 'admin', aceptoDescargo: true, cedula: '', telefono: '', plan: 'Profesional', subscriptionStatus: 'active' }) });
    });

    await page.route('**/api/v1/subscriptions/my-status', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ plan: 'Profesional', subscriptionStatus: 'active', planPrice: 0, isGuest: false, planLimits: { maxConsultas: -1, maxProyectos: -1, presentacionPublica: true, qrIncluido: true, consultasUsadas: 0, proyectosCreados: 0 } }) });
    });

    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });

    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/admin/dashboard**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ totalProyectos: 3, proyectosPendientes: 1, proyectosAprobados: 1, proyectosRechazados: 0, totalUsuarios: 5 }) });
    });

    await page.route(/\/api\/projects(\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({
            items: [
              { id: PROJECT_WITH_DEBT, codigoInterno: 'PRJ-IPI-001', nombre: 'Proyecto con Deuda IPI', ubicacionTexto: 'Santo Domingo', categoriaId: 1, categoriaNombre: 'Residencial', estadoProyecto: 'CREADO', estadoIntegridad: 0, estatusIpi: 'PAGO_PENDIENTE', usuarioCreadorId: 'user-001', createdAtUtc: '2026-01-01T00:00:00Z' },
              { id: PROJECT_WITHOUT_DEBT, codigoInterno: 'PRJ-IPI-002', nombre: 'Proyecto sin Deuda IPI', ubicacionTexto: 'Santiago', categoriaId: 1, categoriaNombre: 'Residencial', estadoProyecto: 'CREADO', estadoIntegridad: 0, estatusIpi: null, usuarioCreadorId: 'user-001', createdAtUtc: '2026-01-01T00:00:00Z' },
              { id: PROJECT_RESOLVED, codigoInterno: 'PRJ-IPI-003', nombre: 'Proyecto IPI Resuelto', ubicacionTexto: 'La Romana', categoriaId: 1, categoriaNombre: 'Residencial', estadoProyecto: 'CREADO', estadoIntegridad: 0, estatusIpi: 'AL_DIA', usuarioCreadorId: 'user-001', createdAtUtc: '2026-01-01T00:00:00Z' },
            ],
            totalCount: 3, page: 1, pageSize: 20
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('project with IPI debt shows badge', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto con Deuda IPI', { timeout: 15000 });

    const debtRow = page.locator('.vf-card', { hasText: 'Proyecto con Deuda IPI' });
    await expect(debtRow.locator('text=IPI Pendiente')).toBeVisible();
  });

  test('project without IPI debt does not show badge', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto sin Deuda IPI', { timeout: 15000 });

    const cleanRow = page.locator('.vf-card', { hasText: 'Proyecto sin Deuda IPI' });
    await expect(cleanRow.locator('text=IPI Pendiente')).not.toBeVisible();
  });

  test('project with resolved IPI does not show debt badge', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto IPI Resuelto', { timeout: 15000 });

    const resolvedRow = page.locator('.vf-card', { hasText: 'Proyecto IPI Resuelto' });
    await expect(resolvedRow.locator('text=IPI Pendiente')).not.toBeVisible();
  });
});
