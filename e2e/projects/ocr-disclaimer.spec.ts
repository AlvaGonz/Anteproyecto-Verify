import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-disclaimer-001";
const DISCLAIMER_TEXT = "Para extraer los datos de los documentos adjuntos usamos tecnología OCR";

const baseMocks = async (page: any, opts: { disclaimerAccepted: boolean }) => {
  await page.route("**/api/auth/me", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "admin", aceptoDescargo: true }),
    });
  });
  await page.route("**/api/v1/subscriptions/my-status", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        plan: "Profesional",
        subscriptionStatus: "active",
        planPrice: 0,
        isGuest: false,
        planLimits: { maxConsultas: -1, maxProyectos: -1, presentacionPublica: true, qrIncluido: true, maxUsuariosSecundarios: -1, maxAlmacenamientoMb: -1, alertasTiempoReal: true, modeloLm: true, validacionLote: true, exportacionExcel: true, exportacionPdf: true, integracionCrm: true, soporteTipo: "Prioritario", accesoApi: true, consultasUsados: 0, proyectosCreados: 0 },
      }),
    });
  });
  await page.route("**/api/notifications*", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/auth/refresh", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: MOCK_PROJECT_ID, nombre: "Residencial Las Palmas", estadoProyecto: 1, categoriaId: 16 }),
    });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validation-result`, async (route: any) => {
    await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/findings`, async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/audit`, async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  // Mock the disclaimer status endpoint
  await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validations/disclaimer`, async (route: any) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accepted: opts.disclaimerAccepted }),
      });
    } else {
      // POST — accept disclaimer
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }
  });
};

test.describe("OCR Validation Disclaimer", () => {
  test("shows disclaimer on first visit to project validations", async ({ page }) => {
    await baseMocks(page, { disclaimerAccepted: false });
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const disclaimer = page.getByText(DISCLAIMER_TEXT);
    await expect(disclaimer).toBeVisible({ timeout: 5000 });
  });

  test("does not show disclaimer on second visit (already accepted)", async ({ page }) => {
    await baseMocks(page, { disclaimerAccepted: true });
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const disclaimer = page.getByText(DISCLAIMER_TEXT);
    await expect(disclaimer).not.toBeVisible({ timeout: 5000 });
  });

  test("dismisses disclaimer and calls POST endpoint", async ({ page }) => {
    let postCalled = false;
    await baseMocks(page, { disclaimerAccepted: false });

    // Override the POST handler to track the call
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validations/disclaimer`, async (route: any) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ accepted: false }),
        });
      } else {
        postCalled = true;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      }
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const dismissButton = page.getByRole("button", { name: /entendido|aceptar|continuar/i });
    await expect(dismissButton).toBeVisible({ timeout: 5000 });
    await dismissButton.click();

    const disclaimer = page.getByText(DISCLAIMER_TEXT);
    await expect(disclaimer).not.toBeVisible({ timeout: 3000 });
    expect(postCalled).toBe(true);
  });
});
