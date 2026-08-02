import { test, expect } from '@playwright/test';

test.describe('Create Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/.*\/api\/auth\/me.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "admin", aceptoDescargo: true})
      });
    });

    await page.route(/.*\/api\/auth\/refresh.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "fake-jwt-token", user: { id: "user-001", email: "admin@verifinca.do", role: "admin" } })
      });
    });

    
    await page.route(/.*\/api\/v1\/subscriptions\/my-status.*/, async (route) => {
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
          planLimits: {}
        })
      });
    });

    await page.route(/.*\/api\/dashboard\/stats.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalProyectos: 0, proyectosAprobados: 0, proyectosPendientes: 0 })
      });
    });

    await page.route(/.*\/api\/dgii\/rnc\/.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ nombreRazonSocial: 'Constructora Test S.R.L.' })
      });
    });

    let created = false;
    
    const mockProject = {
      id: "proj-123",
      codigoInterno: "VF-123",
      nombre: "Test Project AutoRefresh",
      ubicacionTexto: "Distrito Nacional",
      categoriaId: 16,
      estadoProyecto: "CREADO",
      estadoIntegridad: 0,
      createdAtUtc: "2026-01-01T00:00:00Z"
    };

    await page.route('**/*/projects*', async (route) => {
      const url = route.request().url();
      if (url.includes(':3000')) {
        return route.continue();
      }
      
      const method = route.request().method();
      console.log(`API CALL: ${method} ${url}`);
      
      if (method === 'POST') {
        created = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProject)
        });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: created ? [mockProject] : [],
            totalCount: created ? 1 : 0,
            page: 1,
            pageSize: 50
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('formats RNC/Cedula and auto-refreshes project list after creation', async ({ page }) => {
    await page.goto('/#/admin/projects/new');
    
    // Wait for the form to render
    await expect(page.locator('h3', { hasText: 'Detalles del Proyecto' })).toBeVisible();

    // 1. Type in #rncDesarrollador and assert format
    const rncInput = page.locator('#rncDesarrollador');
    await rncInput.fill('40228600017');
    await expect(rncInput).toHaveValue('402-2860001-7');

    // 2. Fill the rest of the form to create a project
    await page.locator('#nombre').fill('Test Project AutoRefresh');
    
    // Select province
    await page.locator('#provincia').selectOption({ index: 1 });
    
    // Submit the form
    await page.getByRole('button', { name: /Guardar|Crear/i }).click();

    // 3. Confirm the new project appears in the projects tab without manual refresh
    await expect(page).toHaveURL(/.*\/admin\/projects/);
    
    // The new project should be visible in the list automatically
    await expect(page.getByText('Test Project AutoRefresh')).toBeVisible({ timeout: 10000 });
  });
});
