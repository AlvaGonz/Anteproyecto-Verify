import { test, expect } from '@playwright/test';

// Performance budgets per route (milliseconds)
const ROUTE_BUDGETS: Record<string, { cold: number; cached: number }> = {
  '/': { cold: 300, cached: 100 },
  '/#/projects': { cold: 300, cached: 100 },
  '/#/plans': { cold: 300, cached: 100 },
  '/#/legal': { cold: 300, cached: 100 },
  '/#/admin/dashboard': { cold: 300, cached: 100 },
  '/#/admin/projects': { cold: 300, cached: 100 },
  '/#/admin/rules': { cold: 300, cached: 100 },
  '/#/admin/audit-log': { cold: 300, cached: 100 },
  '/#/admin/settings': { cold: 300, cached: 100 },
};

// Use getByText for reliable text matching - returns Locator
function getInteractiveLocator(page: any, route: string) {
  if (route === '/') return page.getByText('VeriFinca').first();
  if (route === '/#/projects') return page.getByText('Residencial').first();
  if (route === '/#/plans') return page.getByText('Planes').first();
  if (route === '/#/legal') return page.getByText('Términos').first();
  if (route === '/#/admin/dashboard') return page.getByText('Dashboard').first();
  if (route === '/#/admin/projects') return page.getByRole('heading', { name: /Proyectos/i }).first();
  if (route === '/#/admin/rules') return page.getByText('Reglas').first();
  if (route === '/#/admin/audit-log') return page.getByText('Auditoría').first();
  if (route === '/#/admin/settings') return page.getByText('Configuración').first();
  return page.locator('body');
}

// Auth mock helper (matches project-crud.spec.ts pattern)
async function setupAuthMock(page: any) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({
        id: "user-001", email: "test@example.com", nombre: "Test", apellido: "User",
        role: "admin", cedula: "", telefono: "", plan: "Profesional", subscriptionStatus: "active"
      })
    });
  });
  await page.route('**/api/v1/subscriptions/my-status', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        plan: 'Profesional', subscriptionStatus: 'active', planPrice: 0, isGuest: false,
        inviterPlan: null, inviterName: null,
        planLimits: { maxConsultas: -1, maxProyectos: -1, presentacionPublica: true, qrIncluido: true,
          maxUsuariosSecundarios: -1, maxAlmacenamientoMb: -1, alertasTiempoReal: true, modeloLm: true,
          validacionLote: true, exportacionExcel: true, exportacionPdf: true, integracionCrm: true,
          soporteTipo: 'Prioritario', accesoApi: true, consultasUsadas: 0, proyectosCreados: 0 }
      })
    });
  });
  await page.route("**/api/notifications*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
  });

  // Mock projects data
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify([{ id: "proj-001", codigoInterno: "VF-001-2026", nombre: "Residencial Las Palmas",
          ubicacionTexto: "La Romana, RD", categoria: 1, estadoProyecto: "PUBLICADO", estadoIntegridad: 0,
          usuarioCreadorId: "user-001", createdAtUtc: "2026-01-01T00:00:00Z" }])
      });
    }
  });

  // Mock audit data
  await page.route("**/api/admin/audit", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify([{ id: "audit-001", proyectoId: "proj-001", usuarioId: "user-001",
        tipoEvento: "ProjectCreated", accion: "CREATE", entidad: "Proyecto", entidadId: "proj-001",
        detalle: "Proyecto creado", ipOrigen: "127.0.0.1", userAgent: "Playwright", fechaEventoUtc: new Date().toISOString() }])
    });
  });

  // Mock rules data
  await page.route("**/api/admin/rules", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify([{ id: "rule-001", nombre: "Validar RNC", descripcion: "Validar RNC del desarrollador",
        condicionLogica: "RNC != null", tipoDocumentoAplicable: "TITULO_PROPIEDAD", nivelAlerta: "WARNING",
        tipoProyecto: "RESIDENCIAL", activa: true, version: 1, fechaCreacionUtc: new Date().toISOString() }])
    });
  });

  // Mock dashboard stats
  await page.route("**/api/admin/dashboard", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ totalProjects: 10, publishedProjects: 5, pendingValidations: 3, activeUsers: 25 })
    });
  });

  // Mock public projects list (for /#/projects)
  await page.route("**/api/projects?public*", async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify([{ id: "proj-001", codigoInterno: "VF-001-2026", nombre: "Residencial Las Palmas",
        ubicacionTexto: "La Romana, RD", estadoProyecto: "PUBLICADO" }])
    });
  });
}

test.describe('Route Performance Budgets', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMock(page);
  });

  for (const [route, budgets] of Object.entries(ROUTE_BUDGETS)) {
    const isAdminRoute = route.startsWith('/#/admin');

    test(`COLD: ${route} TTFI < ${budgets.cold}ms`, async ({ page }) => {
      if (!isAdminRoute) {
        await page.context().clearCookies();
        await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
      }

      const start = Date.now();
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      
      // Wait for interactive content
      await expect(getInteractiveLocator(page, route)).toBeVisible({ timeout: budgets.cold });
      
      const ttfi = Date.now() - start;
      console.log(`[PERF] COLD ${route}: ${ttfi}ms (budget: ${budgets.cold}ms)`);
      expect(ttfi).toBeLessThan(budgets.cold);
    });

    test(`CACHED: ${route} revisit < ${budgets.cached}ms`, async ({ page }) => {
      // First visit (populates cache)
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(getInteractiveLocator(page, route)).toBeVisible({ timeout: budgets.cold });
      
      // Navigate away
      await page.goto('/#/');
      await expect(page.getByText('VeriFinca').first()).toBeVisible({ timeout: 3000 });
      
      // Revisit - should be instant from TanStack Query cache
      const start = Date.now();
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(getInteractiveLocator(page, route)).toBeVisible({ timeout: budgets.cached });
      
      const ttfi = Date.now() - start;
      console.log(`[PERF] CACHED ${route}: ${ttfi}ms (budget: ${budgets.cached}ms)`);
      expect(ttfi).toBeLessThan(budgets.cached);
    });
  }
});

test.describe('API Response Time Budgets', () => {
  test.use({ baseURL: process.env.API_BASE_URL ?? 'http://localhost:5000' });

  test('GET /api/projects responds < 300ms', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/projects');
    const elapsed = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    console.log(`[PERF] API /api/projects: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(300);
  });

  test('GET /api/admin/audit responds < 300ms', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/admin/audit');
    const elapsed = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    console.log(`[PERF] API /api/admin/audit: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(300);
  });

  test('GET /api/admin/rules responds < 300ms', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/admin/rules');
    const elapsed = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    console.log(`[PERF] API /api/admin/rules: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(300);
  });
});