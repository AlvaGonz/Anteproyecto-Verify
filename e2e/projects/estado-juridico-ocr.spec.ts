import { test, expect } from '@playwright/test';

test.describe('Estado Jurídico OCR Extraction', () => {
  test('should display extracted OCR fields for Estado Jurídico', async ({ page }) => {
    // Navigate to the project documents page for a mocked project
    // Assuming project list page works and we can navigate to a test project
    // We will just mock the API responses for the documents to include our extraction.

    await page.route('**/api/v1/projects/*/documents', async route => {
      const json = [
        {
          id: 'test-doc-id',
          projectId: 'test-project-id',
          documentType: 'CertificacionEstadoJuridico',
          fileName: 'estado_juridico.pdf',
          status: 'Verificado',
          estadoJuridicoExtraction: {
            extractionStatus: 2, // SUCCESS
            documentType: 'EstadoJuridico',
            matricula: {
              rawValue: '3000362328',
              confidence: 0.99,
              status: 0 // Match
            },
            designacionCatastral: {
              rawValue: '400508493108',
              confidence: 0.98,
              status: 0
            },
            isFreeOfLiens: true,
            hasActiveOppositions: false,
            fechaEmision: {
              rawValue: '16/07/2024',
              normalizedValue: '2024-07-16T00:00:00',
              confidence: 0.95,
              status: 0
            }
          }
        }
      ];
      await route.fulfill({ json });
    });

    // Mock project details
    await page.route('**/api/v1/projects/*', async route => {
      const json = {
        id: 'test-project-id',
        name: 'Test Project',
        matricula: '3000362328',
        designacionCatastral: '400508493108'
      };
      await route.fulfill({ json });
    });

    // Assume we can navigate directly to the documents page for this project
    await page.goto('/projects/test-project-id');

    // Wait for the requirement row to be visible
    const requirementRow = page.locator('[data-testid="requirement-row-estado_juridico"]');
    await expect(requirementRow).toBeVisible();

    // Click on the row to expand the accordion and see the extracted fields
    // Assuming clicking the row expands it based on the Cédula implementation
    await requirementRow.click();

    // Verify Matricula field
    const matriculaField = page.locator('[data-testid="field-matricula"]');
    await expect(matriculaField).toBeVisible();
    await expect(matriculaField).toContainText('3000362328');
    
    // Verify Designación Catastral field
    const designacionField = page.locator('[data-testid="field-designacionCatastral"]');
    await expect(designacionField).toBeVisible();
    await expect(designacionField).toContainText('400508493108');

    // Verify Free of Liens
    const isFreeOfLiensField = page.locator('[data-testid="field-isFreeOfLiens"]');
    await expect(isFreeOfLiensField).toBeVisible();
    await expect(isFreeOfLiensField).toContainText('Libre de Cargas'); // Or whatever the UI displays for true

    // Verify Active Oppositions
    const hasOppositionsField = page.locator('[data-testid="field-hasActiveOppositions"]');
    await expect(hasOppositionsField).toBeVisible();
    await expect(hasOppositionsField).toContainText('Sin Oposiciones'); // Or similar

    // Verify Fecha Emisión
    const fechaEmisionField = page.locator('[data-testid="field-fechaEmision"]');
    await expect(fechaEmisionField).toBeVisible();
    await expect(fechaEmisionField).toContainText('16/07/2024');
  });
});
