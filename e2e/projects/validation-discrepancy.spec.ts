import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";
const MOCK_DOCUMENT_ID = "doc-001";

test.describe("Discrepancy Validation E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Mock user auth
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin", role: "admin", aceptoDescargo: true })
      });
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
          planLimits: { maxConsultas: -1, maxProyectos: -1 }
        })
      });
    });
    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
    });


    // Mock project data with specific values for comparison
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Residencial Test",
          ubicacionTexto: "La Romana",
          matricula: "12345",
          designacionCatastral: "DC-123",
          superficieM2: 1500,
          estadoProyecto: 1, 
          categoriaId: 16
        })
      });
    });

    // We mock the documents to include an extracted Titulo with mismatched values
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify([{
          id: MOCK_DOCUMENT_ID,
          proyectoId: MOCK_PROJECT_ID,
          tipoDocumento: 21, // DocumentType.CertificadoTitulo
          activo: true,
          estadoDocumento: 2,
          nombreArchivoOriginal: "titulo.pdf",
          certificadoTituloExtraction: {
            processorName: "TituloExtractor",
            processorVersion: "1.0",
            extractionStatus: "Completed",
            provincia: { rawValue: "La Altagracia", normalizedValue: "La Altagracia", status: "Extracted", confidence: 0.99, sourcePage: 1 },
            provinceResolution: { resolvedId: "altagracia", suggestedAction: 1 },
            matricula: { rawValue: "67890", normalizedValue: "67890", status: "Extracted", confidence: 0.99, sourcePage: 1 },
            designacionCatastral: { rawValue: "DC-123", normalizedValue: "DC-123", status: "Extracted", confidence: 0.99, sourcePage: 1 },
            superficieM2: { rawValue: "1500", normalizedValue: "1500", status: "Extracted", confidence: 0.99, sourcePage: 1 }
          }
        }]) 
      });
    });

    // Mock other project queries
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
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
    // Mock the verify endpoint
    await page.route(`**/api/gobernanzadedatos/verificar/*`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    // Mock Geo provinces
    await page.route(`**/api/geo/provincias`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([
        { id: "romana", nombre: "La Romana" },
        { id: "altagracia", nombre: "La Altagracia" }
      ]) });
    });
  });

  test("shows discrepancy alert before validating if document data does not match project data", async ({ page }) => {
    // 1. Go to the validations page directly
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);
    
    // 2. Wait for the extraction card to be visible
    const validationCard = page.getByTestId("titulo-extraction-card");
    await expect(validationCard).toBeVisible({ timeout: 10000 });

    // 3. Click the validate button
    await page.getByRole("button", { name: /Validar contra Estado\/Gobernanza/i }).click();

    // 4. Assert that the discrepancy alert dialog appears
    const alertDialog = page.getByRole("alertdialog");
    await expect(alertDialog).toBeVisible();

    // 5. Assert it mentions the specific discrepancies
    await expect(alertDialog).toContainText("provincia");
    await expect(alertDialog).toContainText("matricula");
    await expect(alertDialog).toContainText("12345"); // Project matricula
    await expect(alertDialog).toContainText("67890"); // Doc matricula
    await expect(alertDialog).toContainText("La Romana"); // Project provincia
    await expect(alertDialog).toContainText("La Altagracia"); // Doc provincia

    // 6. Click cancel to ensure it doesn't proceed
    await alertDialog.getByRole("button", { name: /Cancelar/i }).click();
    await expect(alertDialog).toBeHidden();
  });
});
