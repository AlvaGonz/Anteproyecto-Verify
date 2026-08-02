import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Category Specific Requirements E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "admin", aceptoDescargo: true})
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
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validation-result`, async (route) => {
      await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/findings`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/audit`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
  });

  test("Comercial project (CategoriaId 8) renders generic requirement rows", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Plaza Central",
          estadoProyecto: 1, 
          categoriaId: 8 // Comercial
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);
    
    // ponytail: category-specific requirements not implemented yet
    // Check that generic requirements are rendered
    await expect(page.getByTestId("requirement-row-titulo")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("requirement-row-mensura")).toBeVisible({ timeout: 5000 });
  });

  test("Hospedaje project (CategoriaId 12) renders generic requirement rows", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Hotel Punta Cana",
          estadoProyecto: 1, 
          categoriaId: 12 // Hospedaje
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);
    
    // ponytail: category-specific requirements not implemented yet
    // Check that generic requirements are rendered
    await expect(page.getByTestId("requirement-row-estado_juridico")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("requirement-row-cedula")).toBeVisible({ timeout: 5000 });
  });
});
