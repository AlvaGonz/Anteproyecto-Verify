import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Upload Edge Cases E2E", () => {
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
  });

  test("Shows an error message if the backend upload request fails", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Wait for the requirement row
    const row = page.getByTestId("requirement-row-titulo");
    await expect(row).toBeVisible({ timeout: 5000 });

    // Intercept upload and force failure (upload goes to /api/v1/projects/.../requirements/.../upload)
    await page.route(`**/api/v1/projects/${MOCK_PROJECT_ID}/documents/requirements/**`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Error Interno al subir archivo",
          type: "https://verifinca.do/errors/server-error",
          title: "Error Interno",
          status: 500,
          detail: "Hubo un problema al subir el archivo"
        })
      });
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId("requirement-row-titulo").getByRole("button", { name: /subir/i }).click();
    const fileChooser = await fileChooserPromise;

    // Provide a valid file
    await fileChooser.setFiles({
      name: 'titulo.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // Wait for the error toast
    await expect(page.getByText(/Error/i).first()).toBeVisible({ timeout: 5000 });

    // The status should remain Pendiente (the row still shows the "Subir" button alongside the text)
    const status = page.getByTestId("requirement-status-titulo");
    await expect(status).toContainText("Pendiente");
  });
});
