import { test, expect } from '@playwright/test';

test.describe('Create Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", nombre: "Admin", apellido: "User", role: "admin", aceptoDescargo: true})
      });
    });

    await page.route('**/api/auth/refresh**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "fake-jwt-token" })
      });
    });

    await page.route('**/api/auth/logout**', route => route.fulfill({ json: {} }));
    
    await page.route('**/api/v1/subscriptions/my-status**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: 'Profesional', subscriptionStatus: 'active', planPrice: 0,
          isGuest: false, inviterPlan: null, inviterName: null,
          planLimits: {}
        })
      });
    });

    await page.route('**/api/notifications**', route => route.fulfill({ json: [] }));
    await page.route('**/api/admin/dashboard/**', route => route.fulfill({ json: { totalProyectos: 1, proyectosAprobados: 0, proyectosPendientes: 1 } }));
    await page.route('**/api/dgii/rnc/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ nombreRazonSocial: 'Constructora Test S.R.L.' }) });
    });

    await page.route('**/api/projects/categories**', async (route) => {
      await route.fulfill({ json: [{ id: 16, nombre: "VIVIENDAS" }, { id: 3, nombre: "APARTAMENTOS" }, { id: 8, nombre: "COMERCIAL Y OFICINAS" }] });
    });
    let created = false;
    const mockProject = {
      id: "proj-123", codigoInterno: "VF-123",
      nombre: "Test Project AutoRefresh",
      ubicacionTexto: "Distrito Nacional", categoriaId: 16,
      estadoProyecto: "CREADO", estadoIntegridad: 0,
      createdAtUtc: "2026-01-01T00:00:00Z"
    };

    await page.route('**/api/projects**', async (route) => {
      const url = route.request().url();
      // ponytail: only bypass vite HMR/asset requests; mock all API calls through the proxy
      if (url.includes('@vite') || url.includes('&t=') || url.includes('__x00__') || url.match(/\.(tsx|ts|css|js)\?/)) {
        return route.continue();
      }
      
      const method = route.request().method();
      if (method === 'POST') {
        created = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProject) });
      } else if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ items: created ? [mockProject] : [], totalCount: created ? 1 : 0, page: 1, pageSize: 50 })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('creates a project and it appears in the list after submission', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/#/admin/projects/new');
    
    // Wait for React hydration — lazy-loaded chunks in Vite Docker take time
    await expect(page.locator('#nombre')).toBeEnabled({ timeout: 25_000 });
    await page.locator('#nombre').fill('Test Project AutoRefresh');
    
    if (await page.locator('#ubicacionTexto').isVisible()) {
      await page.locator('#ubicacionTexto').fill('Distrito Nacional');
    }
    if (await page.locator('#categoriaId').isVisible()) {
      await page.locator('#categoriaId').selectOption({ index: 1 });
    }
    
    await page.getByRole('button', { name: /Guardar|Crear/i }).click();
    await expect(page.getByText('Test Project AutoRefresh')).toBeVisible({ timeout: 15_000 });
  });
});
