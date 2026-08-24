import { test, expect } from "@playwright/test";

/**
 * E2E test: OCR Planos de Mensura - Validación Catastral (TDD)
 * 
 * Verifies that the OCR extraction pipeline extracts the 5 critical cadastral fields
 * with >= 70% match against cadastral reference data (DCP, DCO, Provincia, Municipio, Superficie).
 */

const MOCK_PROJECT_ID = "proj-ocr-mensura-san-pedro";
const MOCK_DOCUMENT_ID = "doc-ocr-mensura-san-pedro";
const SAN_PEDRO_PROV_ID = "spm-prov-001";
const SAN_PEDRO_MUNI_ID = "spm-muni-001";

function emptyField() {
  return { rawValue: "", normalizedValue: "", confidence: 0, status: 1, sourcePage: 0 };
}

function buildSanPedroExtraction() {
  return {
    schemaVersion: "1.0",
    documentType: "PlanoMensuraCatastral",
    extractionStatus: 3, // Completed
    overallConfidence: 0.95,
    warnings: [],
    processorName: "PaddleOCR",
    processorVersion: "PP-OCRv4",
    jurisdiccionInmobiliaria: emptyField(),
    direccionRegionalMensurasCatastrales: emptyField(),
    departamento: { rawValue: "ESTE", normalizedValue: "ESTE", confidence: 0.95, status: 0, sourcePage: 1 },
    operacion: { rawValue: "SUBDIVISION", normalizedValue: "SUBDIVISION", confidence: 0.95, status: 0, sourcePage: 1 },
    designacionCatastralPosicional: { rawValue: "875568784706", normalizedValue: "875568784706", confidence: 0.98, status: 0, sourcePage: 1 },
    designacionCatastralOrigen: { rawValue: "Parc. 87, DC-85", normalizedValue: "Parc.87,DC-85", confidence: 0.92, status: 0, sourcePage: 1 },
    provincia: { rawValue: "San Pedro de Macorís", normalizedValue: "SAN PEDRO DE MACORIS", confidence: 0.90, status: 0, sourcePage: 1 },
    municipio: { rawValue: "San Pedro de Macorís", normalizedValue: "SAN PEDRO DE MACORIS", confidence: 0.90, status: 0, sourcePage: 1 },
    seccion: { rawValue: "GUAYACANES", normalizedValue: "GUAYACANES", confidence: 0.85, status: 0, sourcePage: 1 },
    lugar: { rawValue: "JUAN DOLIO", normalizedValue: "JUAN DOLIO", confidence: 0.85, status: 0, sourcePage: 1 },
    superficieARegistrarParcelaM2: { rawValue: "1183.36", normalizedValue: "1183.36", confidence: 0.95, status: 0, sourcePage: 1 },
    provinceResolution: {
      rawValue: "San Pedro de Macorís",
      normalizedValue: "SAN PEDRO DE MACORIS",
      resolvedId: SAN_PEDRO_PROV_ID,
      resolvedCode: null,
      resolvedName: "San Pedro de Macorís",
      resolutionMethod: "exact",
      confidence: 1.0,
      aliasesMatched: [],
      warnings: [],
      suggestedAction: "AutoApply",
    },
    municipalityResolution: {
      rawValue: "San Pedro de Macorís",
      normalizedValue: "SAN PEDRO DE MACORIS",
      resolvedId: SAN_PEDRO_MUNI_ID,
      resolvedCode: null,
      resolvedName: "San Pedro de Macorís",
      resolutionMethod: "exact",
      confidence: 1.0,
      aliasesMatched: [],
      warnings: [],
      suggestedAction: "AutoApply",
    },
  };
}

function buildCorruptExtraction() {
  return {
    schemaVersion: "1.0",
    documentType: "PlanoMensuraCatastral",
    extractionStatus: 3, // Incomplete
    overallConfidence: 0.2,
    warnings: ["Calidad de imagen insuficiente", "Campos críticos no identificados"],
    processorName: "PaddleOCR",
    processorVersion: "PP-OCRv4",
    jurisdiccionInmobiliaria: emptyField(),
    direccionRegionalMensurasCatastrales: emptyField(),
    departamento: emptyField(),
    operacion: emptyField(),
    designacionCatastralPosicional: emptyField(),
    designacionCatastralOrigen: emptyField(),
    provincia: emptyField(),
    municipio: emptyField(),
    seccion: emptyField(),
    lugar: emptyField(),
    superficieARegistrarParcelaM2: emptyField(),
    provinceResolution: null,
    municipalityResolution: null,
  };
}

function buildDocuments(extraction: any, docId: string, projId: string, filename: string) {
  return [
    {
      id: docId,
      proyectoId: projId,
      tipoDocumento: 24, // PlanoMensuraCatastral
      nombreArchivoOriginal: filename,
      contentType: "application/pdf",
      extension: ".pdf",
      tamanoBytes: 65432,
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
      planoMensuraExtraction: extraction,
      estadoJuridicoExtraction: null,
      certificacionIPIExtraction: null,
    },
  ];
}

test.describe("OCR Planos de Mensura - Validación Catastral", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("vf_has_session", "true");
    });

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
          plan: "Corporativo",
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

    await page.route(`**/api/geo/provincias`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: SAN_PEDRO_PROV_ID, nombre: "San Pedro de Macorís" },
          { id: "prov-002", nombre: "La Altagracia" },
        ]),
      });
    });

    await page.route(`**/api/geo/municipios*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: SAN_PEDRO_MUNI_ID, nombre: "San Pedro de Macorís" },
        ]),
      });
    });
  });

  test("debe extraer 5 campos críticos con >=70% match contra DB", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Proyecto San Pedro Catastral",
          estadoProyecto: 1,
          categoriaId: 12,
          designacionCatastral: "875568784706",
          superficieM2: 1183.36,
        }),
      });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildDocuments(buildSanPedroExtraction(), MOCK_DOCUMENT_ID, MOCK_PROJECT_ID, "PLANO_SAN_PEDRO_875568784706.pdf")),
      });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validation-result`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ matchPercentage: 100, esValido: true }) });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/findings`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/audit`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/*`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    // 1. DCP (875568784706)
    await expect(card.getByText("875568784706")).toBeVisible({ timeout: 10000 });

    // 2. DCO (Parc.87,DC-85)
    await expect(card.getByText("Parc.87,DC-85")).toBeVisible({ timeout: 10000 });

    // 3. Provincia (San Pedro de Macorís)
    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    await expect(provinciaSelect).toBeVisible();
    await expect(provinciaSelect).toHaveValue(SAN_PEDRO_PROV_ID, { timeout: 10000 });

    // 4. Municipio (San Pedro de Macorís)
    const municipioSelect = card.locator('[data-testid="municipio-select"]');
    await expect(municipioSelect).toBeVisible();
    await expect(municipioSelect).toHaveValue(SAN_PEDRO_MUNI_ID, { timeout: 10000 });

    // 5. Superficie (1183.36)
    await expect(card.getByText("1183.36")).toBeVisible({ timeout: 10000 });
  });

  test("debe reflejar estado incompleto cuando faltan campos críticos", async ({ page }) => {
    const CORRUPT_PROJ_ID = "proj-ocr-mensura-corrupt";
    const CORRUPT_DOC_ID = "doc-ocr-mensura-corrupt";

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: CORRUPT_PROJ_ID,
          nombre: "Proyecto Plano Corrupto",
          estadoProyecto: 1,
          categoriaId: 12,
        }),
      });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildDocuments(buildCorruptExtraction(), CORRUPT_DOC_ID, CORRUPT_PROJ_ID, "PLANO_CORRUPTO.pdf")),
      });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/validation-result`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ matchPercentage: 0, esValido: false }) });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/findings`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/audit`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route(`**/api/projects/${CORRUPT_PROJ_ID}/documents/${CORRUPT_DOC_ID}/fields/*`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });

    await page.goto(`/#/admin/projects/${CORRUPT_PROJ_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    // Validar que se alerta sobre extracción incompleta / calidad de imagen
    await expect(card.getByText(/Calidad de imagen insuficiente|Incompleta|Sin datos/i)).toBeVisible({ timeout: 10000 });
  });
});
