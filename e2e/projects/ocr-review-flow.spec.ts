import { test, expect } from '@playwright/test';

const MOCK_PROJECT_ID = "proj-ocr-001";
const MOCK_DOCUMENT_ID = "doc-ocr-001";

test.describe('OCR Review Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup basic mock routes for project and auth
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin", role: "ADMIN" }) });
    });
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: MOCK_PROJECT_ID, nombre: "Test Project OCR", estadoProyecto: 1, categoria: 1 }) });
    });

    const ocrResult = {
      success: true,
      provider: "MockOCR",
      confidenceScore: 0.9,
      fields: {
        "Matricula": { name: "Matricula", value: "12345678", confidence: 0.95, reviewState: 0 },
        "Propietario": { name: "Propietario", value: "Juan Perez", confidence: 0.6, reviewState: 0 },
        "Designacion": { name: "Designacion", value: "", confidence: 0.2, reviewState: 0 }
      }
    };
    
    // Mock documents GET endpoint to return a document in EnRevision state
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: MOCK_DOCUMENT_ID,
            proyectoId: MOCK_PROJECT_ID,
            tipoDocumento: 21, // CertificadoTitulo
            nombreArchivoOriginal: "Titulo.pdf",
            activo: true,
            estadoDocumento: 4, // EnRevision
            resultadoOcrJson: JSON.stringify(ocrResult)
          }
        ])
      });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/required-documents`, async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test('should display OCR review panel and allow interactions', async ({ page }) => {
    // We go to the public project detail page where ProjectDocumentStatus is rendered
    await page.goto(`/#/p/${MOCK_PROJECT_ID}`);

    // Verify OCR panel is visible
    await expect(page.getByRole('heading', { name: 'Revisión OCR' })).toBeVisible();

    // Verify fields are rendered
    await expect(page.getByText(/Matricula/i)).toBeVisible();
    await expect(page.getByText(/12345678/i)).toBeVisible();
    
    await expect(page.getByText(/Propietario/i)).toBeVisible();
    await expect(page.getByText(/Juan Perez/i)).toBeVisible();

    // Test Confirm action
    let patchCalled = false;
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/Matricula`, async (route, request) => {
      patchCalled = true;
      const data = JSON.parse(request.postData() || '{}');
      expect(data.reviewState).toBe(1); // Confirmed
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.locator('div.p-4.rounded-2xl').filter({ hasText: /Matricula/i }).getByRole('button', { name: 'Confirmar' }).click();
    await expect(async () => { expect(patchCalled).toBe(true); }).toPass();

    // Test Edit/Correct action
    let editPatchCalled = false;
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/Propietario`, async (route, request) => {
      editPatchCalled = true;
      const data = JSON.parse(request.postData() || '{}');
      expect(data.reviewState).toBe(2); // Corrected
      expect(data.correctedValue).toBe('Juan Perez Gomez');
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.locator('div.p-4.rounded-2xl').filter({ hasText: /Propietario/i }).getByRole('button', { name: 'Corregir' }).click();
    // Use the generic textbox that appears
    await page.getByRole('textbox').fill('Juan Perez Gomez');
    await page.getByRole('button', { name: 'Guardar corrección' }).click();
    await expect(async () => { expect(editPatchCalled).toBe(true); }).toPass();

    // Test Absent action
    let absentPatchCalled = false;
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/Designacion`, async (route, request) => {
      absentPatchCalled = true;
      const data = JSON.parse(request.postData() || '{}');
      expect(data.reviewState).toBe(3); // Absent
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.locator('div.p-4.rounded-2xl').filter({ hasText: /Designacion/i }).getByRole('button', { name: 'Ausente' }).click();
    await expect(async () => { expect(absentPatchCalled).toBe(true); }).toPass();
  });
});
