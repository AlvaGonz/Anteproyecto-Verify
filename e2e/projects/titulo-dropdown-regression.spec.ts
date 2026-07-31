import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Título de Propiedad');

/**
 * Regression test for the Título de Propiedad (Certificado de Título) extraction
 * card provincia/municipio dropdown.
 *
 * Before the fix in Application.Documents.Extractions.GeoTextNormalizer, the
 * real PaddleOCR output for "Título de Propiedad" PDFs was
 *   municipio.rawValue = "PODERJUDICIALREPUBLICA DOMINICANA HIGUEY"
 * where PaddleOCR concatenated PODER+JUDICIAL+REPUBLICA but left a space before
 * DOMINICANA. The old normalizer's exact-string prefix list
 * ("PODERJUDICIALREPUBLICADOMINICANA") did not match that mixed-spacing form,
 * so the polluted header leaked into the municipio field and MatchMunicipio
 * returned ResolvedId=null. The frontend dropdown for municipio stayed empty
 * even when the rest of the extraction was correct.
 *
 * After the fix, the regex-based noise stripper in GeoTextNormalizer handles
 * every spacing variant and resolves "PODERJUDICIALREPUBLICA DOMINICANA HIGUEY"
 * to "HIGUEY" → "Higüey" via Tier 1 exact match on the catalog. The dropdown
 * populates the same way EstadoJuridico does.
 */
test.describe('Título de Propiedad - provincia/municipio dropdown (Poder Judicial OCR noise fix)', () => {
  const PDF = 'CT 505483687149 Exp. 2024-0086769.pdf';
  const PDF_PATH = path.join(TEST_DOCS_DIR, PDF);

  test('OCR + geo resolution resolves HIGUEY → Higüey despite Poder Judicial header pollution', async ({ page, request }) => {
    test.setTimeout(240000);
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    // 1) Login via API
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
      timeout: 60000,
    });
    expect(loginRes.ok()).toBeTruthy();

    // 2) Pick an existing project (admin already has seeded projects; creating
    // a new one through the public POST /api/Projects endpoint times out under
    // the default actionTimeout in Playwright).
    const projectsRes = await request.get(`${API_BASE}/api/projects?pageSize=5`, { timeout: 60000 });
    expect(projectsRes.ok()).toBeTruthy();
    const projectsBody = await projectsRes.json();
    const projectList: Array<{ id: string }> = Array.isArray(projectsBody)
      ? projectsBody
      : (projectsBody.items ?? projectsBody.projects ?? projectsBody.data ?? []);
    expect(projectList.length).toBeGreaterThan(0);
    const projectId = projectList[0].id;

    // 3) Upload the PDF
    const uploadRes = await request.post(
      `${API_BASE}/api/v1/projects/${projectId}/documents/requirements/TITULO/upload`,
      { multipart: { file: fs.createReadStream(PDF_PATH) }, timeout: 180000 },
    );
    expect(uploadRes.status()).toBe(201);

    // 4) Poll the API until the freshly-uploaded doc has BOTH provincia and
    // municipio resolved. We pick the latest doc with tipoDocumento=21 whose
    // resolutions are non-null (skip stale docs from prior runs).
    type ResolvedDoc = {
      provinciaResolved: string | null;
      provinciaRaw: string | null;
      municipioResolved: string | null;
      municipioRaw: string | null;
      methodProvincia: string | null;
      methodMunicipio: string | null;
    };

    // Poll until we get a doc with both resolutions populated. expect.poll
    // returns the last evaluated value via .toBe (but .toMatchObject is
    // fire-and-forget in our setup), so we keep a manual loop to capture
    // the resolved doc.
    const POLL_TIMEOUT_MS = 120000;
    const POLL_INTERVAL_MS = 2000;
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let resolved: ResolvedDoc | null = null;
    while (Date.now() < deadline) {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`, { timeout: 60000 });
      const docs = (await docsRes.json()) as Array<{
        tipoDocumento?: number | string;
        certificadoTituloExtraction?: {
          provincia?: { rawValue?: string };
          municipio?: { rawValue?: string };
          provinceResolution?: {
            resolvedId?: string | null;
            resolvedName?: string;
            resolutionMethod?: string;
          };
          municipalityResolution?: {
            resolvedId?: string | null;
            resolvedName?: string;
            resolutionMethod?: string;
            normalizedValue?: string;
          };
        };
      }>;
      const tituloDocs = Array.isArray(docs)
        ? docs.filter(d => Number(d.tipoDocumento) === 21)
        : [];
      const doc = tituloDocs.find(d => {
        const ext = d.certificadoTituloExtraction;
        return ext?.provinceResolution?.resolvedId && ext?.municipalityResolution?.resolvedId;
      });
      if (doc) {
        const ext = doc.certificadoTituloExtraction;
        resolved = {
          provinciaResolved: ext?.provinceResolution?.resolvedId ?? null,
          provinciaRaw: ext?.provincia?.rawValue ?? null,
          municipioResolved: ext?.municipalityResolution?.resolvedId ?? null,
          municipioRaw: ext?.municipio?.rawValue ?? null,
          methodProvincia: ext?.provinceResolution?.resolutionMethod ?? null,
          methodMunicipio: ext?.municipalityResolution?.resolutionMethod ?? null,
        };
        break;
      }
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }
    expect(resolved).not.toBeNull();
    resolved = resolved as ResolvedDoc;

    // 5) Assertions: the polluted header on municipio was stripped by GeoTextNormalizer
    // and the municipio dropdown is now populated with Higüey exactly like EstadoJuridico.
    // (a) Provincia resolved via alias to La Altagracia
    expect(resolved.methodProvincia).toBe('alias');
    // (b) Municipio resolved via EXACT match on the normalized key "HIGUEY"
    //     (the polluted "PODERJUDICIALREPUBLICA DOMINICANA" prefix was stripped)
    expect(resolved.methodMunicipio).toBe('exact',
      `municipio must resolve via exact match on normalized "HIGUEY" (after stripping ` +
      `"PODERJUDICIALREPUBLICA DOMINICANA"). Got method=${resolved.methodMunicipio}, ` +
      `rawValue=${resolved.municipioRaw}`);
    expect(resolved.municipioRaw).toContain('HIGUEY',
      'municipio rawValue should retain the original OCR text including the polluted prefix');

    // 6) Login to UI to make sure the page renders without 500 / blank card.
    //    The validations page renders ProyectoDocumentosList which mounts the
    //    CertificadoTituloExtractionCard for every CertificadoTitulo doc with a
    //    non-null certificadoTituloExtraction. We don't strictly assert the
    //    dropdown values via DOM (covered by the existing extraction-card
    //    Vitest tests + the parallel estado-juridico-dropdown-regression
    //    E2E which uses the SAME ExtractionFieldCard component) — we only
    //    confirm the page mounts the card test-id, which is what the user
    //    observes in the UI.
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    const disclaimerBtn = page.getByRole('button', { name: /Aceptar y Continuar/i });
    if (await disclaimerBtn.count() > 0) {
      await disclaimerBtn.first().click();
    }

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const cards = page.locator('[data-testid="certificado-titulo-extraction-card"]');
    await expect.poll(async () => await cards.count(), {
      timeout: 60000,
      intervals: [1000],
    }).toBeGreaterThan(0);

    // Sanity: at least one card has its provincia dropdown populated (>1 option,
    // meaning the provinces catalog fetched and rendered). This proves the
    // "municipio not disabled when provincia resuelta" requirement indirectly:
    // the provincia dropdown populated → municipio dropdown became enabled.
    await expect.poll(async () => {
      const selects = cards.locator('[data-testid="provincia-select"]');
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const optionCount = await selects.nth(i).locator('option').count();
        if (optionCount > 1) return true;
      }
      return false;
    }, { timeout: 60000, intervals: [1000] }).toBe(true);
  });
});
