import { test, expect } from '@playwright/test';

test.describe('Estado Jurídico OCR Extraction', () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "admin", aceptoDescargo: true})
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
          isGuest: false
        })
      });
    });
    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test('should display extracted OCR fields for Estado Jurídico', async ({ page }) => {
    // We will just mock the API responses for the documents to include our extraction.

    // Unified route for all project-related API calls
    await page.route(/\/api.*\/projects\/.*/, async route => {
      const url = route.request().url();
      
      if (url.includes('/documents')) {
        const json = [
          {
            id: 'test-doc-id',
            proyectoId: 'test-project-id',
            tipoDocumento: 22, // DocumentType.CertificacionEstadoJuridico
            activo: true,
            nombreArchivoOriginal: 'estado_juridico.pdf',
            estadoDocumento: 6, // Verificado
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
              hasActiveOppositions: false,
              fechaHoraInscripcion: {
                rawValue: '16/07/2024',
                normalizedValue: '2024-07-16T00:00:00',
                confidence: 0.95,
                status: 0
              }
            }
          }
        ];
        return route.fulfill({ json });
      }
      
      if (url.includes('/validation-result')) {
         return route.fulfill({ json: { internalValidation: null, externalSources: [] } });
      }
      if (url.includes('/findings')) {
         return route.fulfill({ json: [] });
      }
      if (url.includes('/audit')) {
         return route.fulfill({ json: [] });
      }
      if (url.includes('/status-eligibility')) {
         return route.fulfill({ json: { documentCount: 1, hasObservaciones: false, currentStatus: "CREADO" } });
      }
      
      // Project details - returning full schema to pass Zod validation
      const json = {
        id: 'test-project-id',
        codigoInterno: 'PRJ-TEST-001',
        nombre: 'Test Project',
        ubicacionTexto: 'Santo Domingo',
        categoria: 3, // Turistico to show estado_juridico
        estadoJuridico: 1, // Valid
        estadoProyecto: 'CREADO',
        estadoIntegridad: 0,
        usuarioCreadorId: 'user-001',
        createdAtUtc: new Date().toISOString(),
        matricula: '3000362328',
        designacionCatastral: '400508493108'
      };
      await route.fulfill({ json });
    });

    // Assume we can navigate directly to the validations page for this project
    await page.goto('/#/admin/projects/test-project-id/validations');

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

    // Verify Free of Liens card is NOT rendered (removed — Oposiciones covers this)
    await expect(page.locator('[data-testid="field-isFreeOfLiens"]')).toHaveCount(0);

    // Verify Active Oppositions
    const hasOppositionsField = page.locator('[data-testid="field-hasActiveOppositions"]');
    await expect(hasOppositionsField).toBeVisible();
    await expect(hasOppositionsField).toContainText('Sin Oposiciones'); // Or similar

    // Verify Fecha Emisión
    const fechaEmisionField = page.locator('[data-testid="field-fechaEmision"]');
    await expect(fechaEmisionField).toBeVisible();
    await expect(fechaEmisionField).toContainText('2024-07-16T00:00:00');
  });
});
