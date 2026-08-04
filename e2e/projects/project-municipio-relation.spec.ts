import { test, expect } from '@playwright/test';

test.describe('Project-Municipio relation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ id: 'user-001', email: 'admin@verifinca.do', nombre: 'Admin', apellido: 'User', role: 'admin', aceptoDescargo: true }),
      });
    });
    await page.route('**/api/auth/refresh**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'fake-jwt-token' }) });
    });
    await page.route('**/api/auth/logout', (route) => route.fulfill({ json: {} }));
    await page.route('**/api/v1/subscriptions/my-status**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ plan: 'Profesional', subscriptionStatus: 'active', planPrice: 0, isGuest: false, inviterPlan: null, inviterName: null, planLimits: {} }),
      });
    });
    await page.route('**/api/notifications**', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/admin/dashboard/**', (route) => route.fulfill({ json: { totalProyectos: 1, proyectosAprobados: 0, proyectosPendientes: 1 } }));
    await page.route('**/api/dgii/rnc/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ nombreRazonSocial: 'Constructora Test S.R.L.' }) });
    });
    await page.route('**/api/projects/categories**', async (route) => {
      await route.fulfill({ json: [{ id: 16, nombre: 'VIVIENDAS' }, { id: 3, nombre: 'APARTAMENTOS' }] });
    });
    await page.route('**/api/provinces**', async (route) => {
      await route.fulfill({ json: [{ id: 'prov-dn', nombre: 'Distrito Nacional', latitud: 18.485, longitud: -69.93 }] });
    });

    const mockProject = {
      id: 'proj-123', codigoInterno: 'VF-123', nombre: 'Test Municipio Project',
      ubicacionTexto: 'Distrito Nacional', categoriaId: 16,
      municipioId: 'muni-dn-001', municipioNombre: 'Distrito Nacional',
      provinciaNombre: 'Distrito Nacional',
      estadoProyecto: 'CREADO', estadoIntegridad: 0, createdAtUtc: '2026-01-01T00:00:00Z',
    };

    let created = false;
    await page.route('**/api/projects**', async (route) => {
      const url = route.request().url();
      if (url.includes('@vite') || url.includes('&t=') || url.includes('__x00__') || url.match(/\.(tsx|ts|css|js)\?/))
        return route.continue();
      const method = route.request().method();
      if (method === 'POST') {
        created = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProject) });
      } else if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ items: created ? [mockProject] : [], totalCount: created ? 1 : 0, page: 1, pageSize: 50 }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('project form has municipio selector after provincia selection', async ({ page }) => {
    await page.goto('/#/projects/new');
    await expect(page.locator('#nombre')).toBeEnabled({ timeout: 25000 });
    await page.selectOption('#provincia', 'Distrito Nacional');

    // RED: municipio selector does not exist yet
    await expect(page.locator('#municipio')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#municipio')).toBeEnabled();
  });

  test('saved project shows municipio and provincia in detail view', async ({ page }) => {
    await page.goto('/#/projects/new');
    await expect(page.locator('#nombre')).toBeEnabled({ timeout: 25000 });
    await page.locator('#nombre').fill('Test Municipio Project');
    await page.selectOption('#provincia', 'Distrito Nacional');
    await page.getByRole('button', { name: /Guardar|Crear/i }).click();

    await expect(page.getByText('Test Municipio Project')).toBeVisible({ timeout: 15000 });
    await page.getByText('Test Municipio Project').click();

    // RED: detail view does not render municipio/provincia labels yet
    await expect(page.getByText(/Municipio:/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Distrito Nacional/)).toBeVisible();
  });
});
