import { test, expect } from '@playwright/test';

const MOCK_PROJECT_ID = "93087555-0d0a-bfa9-cbda-00f7d1135800";
const MOCK_DOCUMENT_ID = "doc-002";

test.describe('Validación Estado Jurídico', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user auth
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "user-001", role: "admin", aceptoDescargo: true }) });
    });
    await page.route('**/api/v1/subscriptions/my-status', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan: 'Profesional', subscriptionStatus: 'active' }) });
    });
    
    // Mock project data
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Residencial Test",
          matricula: "12345",
          estadoProyecto: 1, 
          categoriaId: 16
        })
      });
    });

    // Mock documents with Estado Juridico extraction
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify([{
          id: MOCK_DOCUMENT_ID,
          proyectoId: MOCK_PROJECT_ID,
          tipoDocumento: 31, // Estado Juridico
          activo: true,
          estadoDocumento: 2,
          nombreArchivoOriginal: "estado_juridico.pdf",
          estadoJuridicoExtraction: {
            processorName: "EstadoJuridicoExtractor",
            processorVersion: "1.0",
            extractionStatus: "Completed",
            matricula: { rawValue: "67890", normalizedValue: "67890", status: "Extracted", confidence: 0.99, sourcePage: 1 },
            estatusLegal: { rawValue: "Litigio", normalizedValue: "Litigio", status: "Extracted", confidence: 0.99, sourcePage: 1 }
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
  });

  test('debe mostrar discrepancias cuando el estatus legal no coincide', async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);
    
    // Simulate opening the extraction card and clicking validate
    const btnValidar = page.getByRole('button', { name: /Validar contra Estado\/Gobernanza/i }).first();
    await btnValidar.waitFor({ state: 'visible' });
    await btnValidar.click();

    // Expect the modal to show
    const modal = page.getByRole('alertdialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Discrepancias Detectadas');
    await expect(modal).toContainText('Litigio');
    await expect(modal).toContainText('67890');
    await expect(modal).toContainText('12345');
  });
});
