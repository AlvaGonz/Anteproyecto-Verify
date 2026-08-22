import { test, expect } from "@playwright/test";

/**
 * E2E test: PM_0001.pdf debe extraer 5 campos críticos con ≥70% match
 */

const MOCK_PROJECT_ID = "proj-pm0001-san-pedro";
const MOCK_DOCUMENT_ID = "doc-pm0001-san-pedro";
const SAN_PEDRO_PROV_ID = "spm-prov-001";
const SAN_PEDRO_MUNI_ID = "spm-muni-001";

function emptyField() {
  return { rawValue: "", normalizedValue: "", confidence: 0, status: 1, sourcePage: 0 };
}

function buildPM0001Extraction() {
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
    seccion: { rawValue: "JINA JARAGUA", normalizedValue: "JINA JARAGUA", confidence: 0.85, status: 0, sourcePage: 1 },
    lugar: { rawValue: "JUANILLO", normalizedValue: "JUANILLO", confidence: 0.85, status: 0, sourcePage: 1 },
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

function buildDocuments(extraction: any, docId: string, projectId: string) {
  return [
    {
      id: docId,
      proyectoId: projectId,
      tipoDocumento: 24, // PlanoMensuraCatastral
      nombreArchivoOriginal: "PM_0001.pdf",
      contentType: "application/pdf",
      extension: ".pdf",
      tamanoBytes: 65432,
      estadoDocumento: 2,
      activo: true,
      version: 1,
      fechaEmision: null,
      institucionEmisora: null,
      usuarioCargaId: "user-pm0001",
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

test.describe("OCR Plano de Mensura PM_0001.pdf", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("vf_has_session", "true");
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-pm0001",
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

    await page.route("**/api/projects/status-catalog", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, nombre: "Borrador", codigoUnico: "BORRADOR" },
          { id: 2, nombre: "En Revisión", codigoUnico: "REVISION" },
          { id: 3, nombre: "Aprobado", codigoUnico: "APROBADO" },
        ]),
      });
    });

    await page.route(`**/api/geo/provincias*`, async (route) => {
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

  test("PM_0001.pdf debe extraer 5 campos críticos con >=70% match", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Proyecto PM_0001 Catastral",
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
        body: JSON.stringify(buildDocuments(buildPM0001Extraction(), MOCK_DOCUMENT_ID, MOCK_PROJECT_ID)),
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

    await page.route(`**/api/gobernanzadedatos/resultado/*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isValid: true,
          matchPercentage: 100,
          message: "Verificación exitosa en Catastro.",
          matchedData: {
            DesigCatastralPosicional: "875568784706",
            DesignCatastralOrigen: "Parc. 87, DC-85",
            Provincia: "San Pedro de Macoris",
            Municipio: "San Pedro de Macoris",
            Superficie: 1183.36,
          },
          failedFields: [],
        }),
      });
    });

    await page.route(`**/api/gobernanzadedatos/verificar`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isValid: true,
          matchPercentage: 100,
          message: "Verificación exitosa en Catastro.",
          matchedData: {
            DesigCatastralPosicional: "875568784706",
            DesignCatastralOrigen: "Parc. 87, DC-85",
            Provincia: "San Pedro de Macoris",
            Municipio: "San Pedro de Macoris",
            Superficie: 1183.36,
          },
          failedFields: [],
        }),
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    // 1. DCP: 875568784706 (NOT 999643229014)
    await expect(card.getByText("875568784706")).toBeVisible({ timeout: 10000 });
    await expect(card.getByText("999643229014")).toHaveCount(0);

    // 2. DCO: Parc.87,DC-85
    await expect(card.getByText("Parc.87,DC-85")).toBeVisible({ timeout: 10000 });

    // 3. Departamento: ESTE (NOT _ESTE)
    await expect(card.getByText("ESTE", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(card.getByText("_ESTE")).toHaveCount(0);

    // 4. Superficie: 1183.36 (NOT NO DETECTADO)
    await expect(card.getByText("1183.36")).toBeVisible({ timeout: 10000 });
    await expect(card.locator('[data-testid="field-superficie"]').getByText("NO DETECTADO")).toHaveCount(0);

    // 5. Validar contra Catastro y verificar 100% Match
    const verifyBtn = card.getByRole("button", { name: /Validar contra Estado\/Gobernanza/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(card.getByText(/100% Match/i)).toBeVisible({ timeout: 15000 });
    await expect(card.getByText(/Verificación exitosa en Catastro/i)).toBeVisible({ timeout: 15000 });
  });
});
