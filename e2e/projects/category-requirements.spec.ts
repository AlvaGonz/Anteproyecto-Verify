import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Category Specific Requirements E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "ADMIN" })
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
    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ requirements: [], documents: [] })
      });
    });
  });

  test("Comercial project (Category 2) renders generic requirement rows", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Plaza Central",
          estadoProyecto: 1, 
          categoria: 2 // Comercial
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // ponytail: category-specific requirements not implemented yet
    // Check that generic requirements are rendered
    await expect(page.getByTestId("requirement-row-titulo")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("requirement-row-mensura")).toBeVisible({ timeout: 5000 });
  });

  test("Turistico project (Category 3) renders generic requirement rows", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Hotel Punta Cana",
          estadoProyecto: 1, 
          categoria: 3 // Turistico
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // ponytail: category-specific requirements not implemented yet
    // Check that generic requirements are rendered
    await expect(page.getByTestId("requirement-row-estado_juridico")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("requirement-row-cedula")).toBeVisible({ timeout: 5000 });
  });
});
