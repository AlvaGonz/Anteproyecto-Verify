import { test, expect } from "@playwright/test";

/**
 * Regression test for the Plano de Mensura extraction card
 * provincia / municipio dropdown save + hydrate flow.
 *
 * Bug: when the OCR pipeline does NOT produce provinceResolution /
 * municipalityResolution (because the raw OCR text for these fields is
 * missing or corrupted — common for plano de mensura PDFs), the
 * PlanoMensuraExtractionCard dropdowns:
 *   (a) stay empty on initial load — even when the user has previously
 *       selected values that the backend persisted into
 *       `provincia.normalizedValue` / `municipio.normalizedValue` via
 *       PATCH /projects/{pid}/documents/{docId}/fields/{fieldName}.
 *   (b) the municipio dropdown stays disabled because provincia never
 *       hydrates.
 *   (c) selecting a new value in the dropdown ONLY updates local React
 *       state — the change is never sent to the backend, so it is lost
 *       on the next reload.
 *
 * This spec mocks the entire API surface so the test is deterministic
 * and exercises only the UI + Zustand/React Query cache flow.
 */

const MOCK_PROJECT_ID = "proj-plano-mensura-1";
const MOCK_DOCUMENT_ID = "doc-plano-mensura-1";

const LA_ALTAGRACIA_ID = "d05c7fe9-45ea-46a3-b46b-44a0934881ab";
const HIGUEY_ID = "11111111-1111-1111-1111-111111111111";
const SANTO_DOMINGO_ID = "941acf4e-dcf3-4e28-9515-006baa24b84a";
const SANTO_DOMINGO_EAST_ID = "22222222-2222-2222-2222-222222222222";

const PROVINCIAS_CATALOG = [
  { id: LA_ALTAGRACIA_ID, nombre: "La Altagracia" },
  { id: SANTO_DOMINGO_ID, nombre: "Santo Domingo" },
  { id: SANTO_DOMINGO_EAST_ID, nombre: "Santo Domingo Este" },
];

const MUNICIPIOS_LA_ALTAGRACIA = [
  { id: HIGUEY_ID, nombre: "Higüey" },
  { id: "33333333-3333-3333-3333-333333333333", nombre: "San Rafael del Yuma" },
];

const MUNICIPIOS_SANTO_DOMINGO = [
  { id: SANTO_DOMINGO_EAST_ID, nombre: "Santo Domingo Este" },
  { id: "44444444-4444-4444-4444-444444444444", nombre: "Santo Domingo Norte" },
];

// Document state we want to expose from /api/projects/{pid}/documents.
// It mirrors what the backend stores after PATCH (see DocumentService.UpdateDocumentFieldReviewAsync):
// the user's chosen UUID lives in `provincia.normalizedValue` (and the same for municipio),
// NOT in provinceResolution.resolvedId (which only exists when OCR actually produced a value).
let persistedProvinciaId: string | null = null;
let persistedMunicipioId: string | null = null;

function buildExtraction() {
  const provinciaRaw = persistedProvinciaId ?? "";
  const municipioRaw = persistedMunicipioId ?? "";
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
    departamento: { rawValue: "NORTE", normalizedValue: "NORTE", confidence: 0.8, status: 0, sourcePage: 1 },
    operacion: { rawValue: "PLANO CATASTRAL", normalizedValue: "PLANO CATASTRAL", confidence: 0.8, status: 0, sourcePage: 1 },
    designacionCatastralPosicional: { rawValue: "L8493574592", normalizedValue: "L8493574592", confidence: 0.8, status: 0, sourcePage: 1 },
    designacionCatastralOrigen: { rawValue: "NOSPN36-ADC05", normalizedValue: "NOSPN36-ADC05", confidence: 0.8, status: 0, sourcePage: 1 },
    provincia: { rawValue: provinciaRaw, normalizedValue: provinciaRaw, confidence: 0, status: 1, sourcePage: 0 },
    municipio: { rawValue: municipioRaw, normalizedValue: municipioRaw, confidence: 0, status: 1, sourcePage: 0 },
    seccion: emptyField(),
    lugar: { rawValue: "TERRERO", normalizedValue: "TERRERO", confidence: 0.8, status: 0, sourcePage: 1 },
    superficieARegistrarParcelaM2: { rawValue: "32.74", normalizedValue: "32.74", confidence: 0.8, status: 0, sourcePage: 1 },
    provinceResolution: persistedProvinciaId
      ? {
          rawValue: "",
          normalizedValue: "",
          resolvedId: persistedProvinciaId,
          resolvedCode: null,
          resolvedName: PROVINCIAS_CATALOG.find(p => p.id === persistedProvinciaId)?.nombre ?? null,
          resolutionMethod: "exact",
          confidence: 1.0,
          aliasesMatched: [],
          warnings: [],
          suggestedAction: "AutoApply",
        }
      : null,
    municipalityResolution: persistedMunicipioId
      ? {
          rawValue: "",
          normalizedValue: "",
          resolvedId: persistedMunicipioId,
          resolvedCode: null,
          resolvedName:
            (persistedProvinciaId === LA_ALTAGRACIA_ID
              ? MUNICIPIOS_LA_ALTAGRACIA
              : MUNICIPIOS_SANTO_DOMINGO
            ).find(m => m.id === persistedMunicipioId)?.nombre ?? null,
          resolutionMethod: "exact",
          confidence: 1.0,
          aliasesMatched: [],
          warnings: [],
          suggestedAction: "AutoApply",
        }
      : null,
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
      nombreArchivoOriginal: "plano-mensura-mock.pdf",
      contentType: "application/pdf",
      extension: ".pdf",
      tamanoBytes: 1024,
      estadoDocumento: 2,
      activo: true,
      version: 1,
      fechaEmision: null,
      institucionEmisora: null,
      usuarioCargaId: "user-001",
      observaciones: null,
      createdAtUtc: "2026-07-30T00:00:00Z",
      updatedAtUtc: "2026-07-30T00:00:00Z",
      cedulaExtraction: null,
      certificadoTituloExtraction: null,
      planoMensuraExtraction: buildExtraction(),
      estadoJuridicoExtraction: null,
      certificacionIPIExtraction: null,
    },
  ];
}

test.describe("Plano de Mensura - dropdown hydrate + save", () => {
  test.beforeEach(async ({ page }) => {
    // Reset persisted state for each test
    persistedProvinciaId = null;
    persistedMunicipioId = null;

    await page.route("**/api/auth/me", async route => {
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
    await page.route("**/api/v1/subscriptions/my-status", async route => {
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
    await page.route("**/api/notifications*", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("**/api/auth/refresh", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Plano Mensura Project",
          estadoProyecto: 1,
          categoria: 3,
        }),
      });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildDocuments()),
      });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validation-result`, async route => {
      await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/findings`, async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/audit`, async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`**/api/geo/provincias`, async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PROVINCIAS_CATALOG) });
    });
    await page.route(`**/api/geo/municipios*`, async route => {
      const url = new URL(route.request().url());
      const provinciaId = url.searchParams.get("provinciaId");
      const list =
        provinciaId === LA_ALTAGRACIA_ID
          ? MUNICIPIOS_LA_ALTAGRACIA
          : provinciaId === SANTO_DOMINGO_ID
            ? MUNICIPIOS_SANTO_DOMINGO
            : [];
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(list) });
    });
  });

  test("provincia and municipio dropdowns persist selection via PATCH /fields/{name}", async ({ page }) => {
    const patchCalls: Array<{ field: string; body: { reviewState: number; correctedValue?: string } }> = [];

    await page.route(
      `**/api/projects/${MOCK_PROJECT_ID}/documents/${MOCK_DOCUMENT_ID}/fields/*`,
      async route => {
        if (route.request().method() !== "PATCH") {
          await route.continue();
          return;
        }
        const fieldName = new URL(route.request().url()).pathname.split("/").pop()!;
        const body = JSON.parse(route.request().postData() ?? "{}");
        patchCalls.push({ field: fieldName, body });
        if (fieldName === "provincia") {
          persistedProvinciaId = body.correctedValue ?? null;
        } else if (fieldName === "municipio") {
          persistedMunicipioId = body.correctedValue ?? null;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(buildDocuments()[0]),
        });
      },
    );

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    const municipioSelect = card.locator('[data-testid="municipio-select"]');

    await expect(provinciaSelect).toBeVisible();
    await expect(municipioSelect).toBeVisible();

    // Dropdown initially empty (no OCR resolution + no persisted value)
    await expect(provinciaSelect).toHaveValue("");
    await expect(municipioSelect).toBeDisabled();
    await expect(municipioSelect).toHaveValue("");

    // User selects La Altagracia
    await provinciaSelect.selectOption(LA_ALTAGRACIA_ID);

    // Wait for the PATCH to be issued and the municipio dropdown to enable
    await expect.poll(() => patchCalls.some(c => c.field === "provincia"), { timeout: 10000 }).toBe(true);
    const provinciaPatch = patchCalls.find(c => c.field === "provincia")!;
    expect(provinciaPatch.body.correctedValue).toBe(LA_ALTAGRACIA_ID);
    expect(provinciaPatch.body.reviewState).toBe(2);

    // Municipio dropdown is now enabled and shows La Altagracia municipios
    await expect(municipioSelect).toBeEnabled();
    await expect.poll(async () => await municipioSelect.locator("option").count(), { timeout: 10000 }).toBeGreaterThan(1);
    await municipioSelect.selectOption(HIGUEY_ID);
    await expect.poll(() => patchCalls.some(c => c.field === "municipio"), { timeout: 10000 }).toBe(true);
    const municipioPatch = patchCalls.find(c => c.field === "municipio")!;
    expect(municipioPatch.body.correctedValue).toBe(HIGUEY_ID);

    // Verify final state
    await expect(provinciaSelect).toHaveValue(LA_ALTAGRACIA_ID);
    await expect(municipioSelect).toHaveValue(HIGUEY_ID);
  });

  test("dropdowns hydrate from persisted normalizedValue when no resolution is present", async ({ page }) => {
    // Pretend the user previously persisted these values (via PATCH in a prior session).
    persistedProvinciaId = LA_ALTAGRACIA_ID;
    persistedMunicipioId = HIGUEY_ID;

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: "visible", timeout: 30000 });

    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    const municipioSelect = card.locator('[data-testid="municipio-select"]');

    await expect(provinciaSelect).toBeVisible();
    await expect(provinciaSelect).toHaveValue(LA_ALTAGRACIA_ID, { timeout: 15000 });

    await expect(municipioSelect).toBeVisible();
    await expect(municipioSelect).toBeEnabled();
    await expect(municipioSelect).toHaveValue(HIGUEY_ID, { timeout: 15000 });
  });
});
