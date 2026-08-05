import { test, expect } from '@playwright/test';

const PROJECT_WITH_DEBT = 'proj-ipi-debt-001';
const PROJECT_WITHOUT_DEBT = 'proj-ipi-clean-001';
const PROJECT_RESOLVED = 'proj-ipi-resolved-001';

const mockProjectsPage = {
  items: [
    {
      id: PROJECT_WITH_DEBT,
      codigoInterno: 'PRJ-IPI-001',
      nombre: 'Proyecto con Deuda IPI',
      ubicacionTexto: 'Santo Domingo',
      categoriaId: 1,
      categoriaNombre: 'Residencial',
      estadoProyecto: 'CREADO',
      estadoIntegridad: 0,
      estatusIpi: 'PAGO_PENDIENTE',
      usuarioCreadorId: 'user-001',
      createdAtUtc: '2026-01-01T00:00:00Z',
      imagenUrl: null,
    },
    {
      id: PROJECT_WITHOUT_DEBT,
      codigoInterno: 'PRJ-IPI-002',
      nombre: 'Proyecto sin Deuda IPI',
      ubicacionTexto: 'Santiago',
      categoriaId: 1,
      categoriaNombre: 'Residencial',
      estadoProyecto: 'CREADO',
      estadoIntegridad: 0,
      estatusIpi: null,
      usuarioCreadorId: 'user-001',
      createdAtUtc: '2026-01-01T00:00:00Z',
      imagenUrl: null,
    },
    {
      id: PROJECT_RESOLVED,
      codigoInterno: 'PRJ-IPI-003',
      nombre: 'Proyecto IPI Resuelto',
      ubicacionTexto: 'La Romana',
      categoriaId: 1,
      categoriaNombre: 'Residencial',
      estadoProyecto: 'CREADO',
      estadoIntegridad: 0,
      estatusIpi: 'AL_DIA',
      usuarioCreadorId: 'user-001',
      createdAtUtc: '2026-01-01T00:00:00Z',
      imagenUrl: null,
    },
  ],
  totalCount: 3,
  page: 1,
  pageSize: 20,
};

test.describe('IPI Debt Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ json: [] });
    });

    await page.route('**/api/admin/dashboard/stats', async (route) => {
      await route.fulfill({
        json: {
          totalUsuarios: 5,
          totalProyectos: 3,
          proyectosPendientes: 1,
          proyectosAprobados: 1,
          proyectosRechazados: 0,
        },
      });
    });

    await page.route('**/api/admin/projects**', async (route) => {
      await route.fulfill({
        json: mockProjectsPage,
      });
    });
  });

  test('project with IPI debt shows badge in admin list', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto con Deuda IPI');

    const debtRow = page.locator('.vf-card', { hasText: 'Proyecto con Deuda IPI' });
    await expect(debtRow.locator('text=IPI Pendiente')).toBeVisible();
  });

  test('project without IPI debt does not show badge', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto sin Deuda IPI');

    const cleanRow = page.locator('.vf-card', { hasText: 'Proyecto sin Deuda IPI' });
    await expect(cleanRow.locator('text=IPI Pendiente')).not.toBeVisible();
  });

  test('project with resolved IPI does not show debt badge', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/projects');
    await page.waitForSelector('text=Proyecto IPI Resuelto');

    const resolvedRow = page.locator('.vf-card', { hasText: 'Proyecto IPI Resuelto' });
    await expect(resolvedRow.locator('text=IPI Pendiente')).not.toBeVisible();
  });
});
