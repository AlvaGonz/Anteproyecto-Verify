import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Document Upload Validation E2E", () => {
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
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Residencial Las Palmas",
          estadoProyecto: 1, 
          categoria: 1 // Residencial
        })
      });
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

  test("Backend rejects files that are too large, status remains Requerido", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);
    
    // Wait for the requirement row
    const row = page.getByTestId("requirement-row-titulo");
    await expect(row).toBeVisible({ timeout: 5000 });
    
    // Intercept the document upload POST and reject with entity too large (upload goes to /api/v1/projects/.../requirements/.../upload)
    await page.route(`**/api/v1/projects/${MOCK_PROJECT_ID}/documents/requirements/**`, async (route) => {
      await route.fulfill({
        status: 413,
        contentType: "application/json",
        body: JSON.stringify({
          message: "El archivo excede el límite permitido de 10MB",
          error: "El archivo excede el límite permitido"
        })
      });
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId("requirement-row-titulo").getByRole("button", { name: /subir/i }).click();
    const fileChooser = await fileChooserPromise;

    // The API mock returns 413 regardless of file size, no need for large buffer
    const largeBuffer = Buffer.from('mock content');

    await fileChooser.setFiles({
      name: 'huge-titulo.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    // Check that the error message from the backend is displayed
    await expect(page.getByText(/excede el límite permitido/i).first()).toBeVisible({ timeout: 5000 });
    
    // Check that the status is still Requerido
    const status = page.getByTestId("requirement-row-titulo");
    await expect(status).toContainText("Requerido");
  });
});
