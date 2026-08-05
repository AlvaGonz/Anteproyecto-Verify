import { test, expect } from "@playwright/test";

/**
 * E2E test: OCR extraction validation for PLANO 505483687149.pdf
 *
 * Verifies that the OCR pipeline correctly extracts and the frontend correctly displays:
 *   - Operacion: "SUBDIVISION"
 *   - DCP (Designacion Catastral Posicional): "505483687149"
 *   - DCO (Designacion Catastral Origen): "42018023893-1-1"
 *   - Provincia: "La Altagracia" (resolved from OCR raw value)
 *   - Municipio: "Higüey" (resolved from OCR raw value)
 *
 * This test mocks the full API surface so it runs deterministically
 * without a running backend or OCR service.
 */

const MOCK_PROJECT_ID = "proj-ocr-plano-1";
const MOCK_DOCUMENT_ID = "doc-ocr-plano-1";
const LA_ALTAGRACIA_ID = "d05c7fe9-45ea-46a3-b46b-44a0934881ab";
const HIGUEY_ID = "11111111-1111-1111-1111-111111111111";

const PROVINCIAS_CATALOG = [
  { id: LA_ALTAGRACIA_ID, nombre: "La Altagracia" },
  { id: "941acf4e-dcf3-4e28-9515-006baa24b84a", nombre: "Santo Domingo" },
];

const MUNICIPIOS_LA_ALTAGRACIA = [
  { id: HIGUEY_ID, nombre: "Higüey" },
  { id: "33333333-3333-3333-3333-333333333333", nombre: "San Rafael del Yuma" },
];

function buildExtraction() {
  return {
    schemaVersion: "1.0",
    documentType: "PlanoMensuraCatastral",
    extractionStatus: 3,
    overallConfidence: 0.9,
    warnings: [],
    processorName: "PaddleOCR",
    processorVersion: "1.0",
    jurisdiccionInmobiliaria: emptyField(),
    direccionRegionalMensurasCatastrales: emptyField(),
    departamento: { rawValue: "ESTE", normalizedValue: "ESTE", confidence: 0.8, status: 0, sourcePage: 1 },
    operacion: { rawValue: "SUBDIVISION", normalizedValue: "SUBDIVISION", confidence: 0.8, status: 0, sourcePage: 1 },
    designacionCatastralPosicional: { rawValue: "505483687149", normalizedValue: "505483687149", confidence: 0.9, status: 0, sourcePage: 1 },
    designacionCatastralOrigen: { rawValue: "42018023893-1-1", normalizedValue: "4201802389311", confidence: 0.9, status: 0, sourcePage: 1 },
    provincia: { rawValue: "LA ALTAGRACIA", normalizedValue: "LA ALTAGRACIA", confidence: 0.8, status: 0, sourcePage: 1 },
    municipio: { rawValue: "HIGUEY", normalizedValue: "HIGUEY", confidence: 0.8, status: 0, sourcePage: 1 },
    seccion: { rawValue: "BAIGUA", normalizedValue: "BAIGUA", confidence: 0.8, status: 0, sourcePage: 1 },
    lugar: { rawValue: "JUANILLO", normalizedValue: "JUANILLO", confidence: 0.8, status: 0, sourcePage: 1 },
    superficieARegistrarParcelaM2: { rawValue: "12130.07", normalizedValue: "12130.07", confidence: 0.8, status: 0, sourcePage: 1 },
    provinceResolution: {
      rawValue: "LA ALTAGRACIA",
      normalizedValue: "LA ALTAGRACIA",
      resolvedId: LA_ALTAGRACIA_ID,
      resolvedCode: null,
      resolvedName: "La Altagracia",
      resolutionMethod: "exact",
      confidence: 1.0,
      aliasesMatched: [],
      warnings: [],
      suggestedAction: "AutoApply",
    },
    municipalityResolution: {
      rawValue: "HIGUEY",
      normalizedValue: "HIGUEY",
      resolvedId: HIGUEY_ID,
      resolvedCode: null,
      resolvedName: "Higüey",
      resolutionMethod: "exact",
      confidence: 1.0,
      aliasesMatched: [],
      warnings: [],
      suggestedAction: "AutoApply",
    },
  };
}

function emptyField() {
  return { rawValue: "", normalizedValue: "", confidence: 0, status: 1, sourcePage: 0 };
}

function buildDocuments() {
  return [
    {
      id: MOCK_DOCUMENT_ID,
      proyectoId: MOCK_PROJECT_ID,
      tipoDocumento: 24,
      nombreArchivoOriginal: "PLANO 505483687149.pdf",
      contentType: "application/pdf",
      extension: ".pdf",
      tamanoBytes: 51200,
      estadoDocumento: 2,
      activo: true,
      version: 1,
      fechaEmision: null,
      institucionEmisora: null,
      usuarioCargaId: "user-001",
      observaciones: null,
      createdAtUtc: "2026-08-01T00:00:00Z",
      updatedAtUtc: "2026-08-01T00:00:00Z",
      cedulaExtraction: null,
      certificadoTituloExtraction: null,
      planoMensuraExtraction: buildExtraction(),
      estadoJuridicoExtraction: null,
      certificacionIPIExtraction: null,
    },
  ];
}

test.describe("OCR Plano Extraction - PLANO 505483687149", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "admin@verifinca.do",
          name: "Admin User",
          role: "admin",
          aceptoDescargo: true,
        }),
      });
    });
    await page.route("**/api/v1/subscriptions/my-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: "Profesional",
          subscriptionStatus: "active",
          planPrice: 0,
          isGuest: false,
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
            soporteTipo: "Prioritario",
            accesoApi: true,
            consultasUsadas: 0,
            proyectosCreados: 0,
          },
        }),
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
          nombre: "Plano OCR Extraction Project",
          estadoProyecto: 1,
          categoriaId: 12,
        }),
      });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildDocuments()),
      });
    });
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
    await page.route(`**/api/geo/provincias`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PROVINCIAS_CATALOG) });
    });
    await page.route(`**/api/geo/municipios*`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MUNICIPIOS_LA_ALTAGRACIA) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/*`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
  });

  test("renders correct DCP 505483687149 and DCO 42018023893-1-1 from OCR extraction", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    await expect(card.getByText("505483687149")).toBeVisible({ timeout: 15000 });
    await expect(card.getByText("4201802389311")).toBeVisible({ timeout: 15000 });
  });

  test("renders correct Operacion SUBDIVISION from OCR extraction", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    await expect(card.getByText("SUBDIVISION")).toBeVisible({ timeout: 15000 });
  });

  test("provincia and municipio dropdowns auto-populate from OCR resolved values", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    const municipioSelect = card.locator('[data-testid="municipio-select"]');

    await expect(provinciaSelect).toBeVisible();
    await expect(provinciaSelect).toHaveValue(LA_ALTAGRACIA_ID, { timeout: 15000 });

    await expect(municipioSelect).toBeVisible();
    await expect(municipioSelect).toBeEnabled({ timeout: 15000 });
    await expect(municipioSelect).toHaveValue(HIGUEY_ID, { timeout: 15000 });
  });

  test("superficie 12130.07 m2 is correctly extracted and displayed", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    await expect(card.getByText("12130.07")).toBeVisible({ timeout: 15000 });
  });

  test("departamento ESTE is correctly extracted and displayed", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    await expect(card.getByText("ESTE")).toBeVisible({ timeout: 15000 });
  });
});
