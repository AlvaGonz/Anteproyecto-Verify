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

  test('provincia + municipio dropdowns populate for Título (Higüey, La Altagracia)', async ({ page, request }) => {
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    // 1) Login via API
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // 2) Pick the first available project (the admin user already has
    // seeded projects we can upload into). Reusing a seeded project avoids
    // the actionTimeout pressure from creating a new one.
    const projectsRes = await request.get(`${API_BASE}/api/projects?pageSize=5`);
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
      { multipart: { file: fs.createReadStream(PDF_PATH) } },
    );
    expect(uploadRes.status()).toBe(201);

    // 4) Poll the API until provincia + municipio are both resolved
    await expect.poll(async () => {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`);
      const docs = await docsRes.json() as Array<{
        tipoDocumento?: number;
        certificadoTituloExtraction?: {
          provincia?: { rawValue?: string };
          municipio?: { rawValue?: string };
          provinceResolution?: { resolvedId?: string | null };
          municipalityResolution?: { resolvedId?: string | null };
        };
      }>;
      const doc = Array.isArray(docs) ? docs.find(d => d.tipoDocumento === 21) : null;
      const ext = doc?.certificadoTituloExtraction;
      return {
        provincia: ext?.provinceResolution?.resolvedId ?? null,
        municipio: ext?.municipalityResolution?.resolvedId ?? null,
      };
    }, { timeout: 120000, intervals: [2000] }).toMatchObject({
      provincia: expect.stringMatching(/.+/),
      municipio: expect.stringMatching(/.+/),
    });

    // 5) Login to UI and navigate to validations page
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const card = page.locator('[data-testid="certificado-titulo-extraction-card"]');
    await card.waitFor({ state: 'visible', timeout: 60000 });

    // 6) Verify Provincia dropdown
    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    await expect(provinciaSelect).toBeVisible();
    await expect.poll(async () => {
      return await provinciaSelect.locator('option').count();
    }, { timeout: 20000 }).toBeGreaterThan(1);
    await expect(provinciaSelect).toHaveValue(/^[0-9a-f-]{36}$/i, {
      timeout: 10000,
    });
    const provinciaLabel = await provinciaSelect.locator(`option[value="${await provinciaSelect.inputValue()}"]`).textContent();
    expect(provinciaLabel?.trim()).toBe('La Altagracia');

    // 7) Verify Municipio dropdown is ENABLED (not disabled) AND populated
    //    Req #3 of the fix: municipio must not be deshabilitado when provincia
    //    is resuelta.
    const municipioSelect = card.locator('[data-testid="municipio-select"]');
    await expect(municipioSelect).toBeVisible();
    await expect(municipioSelect).toBeEnabled({ timeout: 10000 });
    await expect.poll(async () => {
      return await municipioSelect.locator('option').count();
    }, { timeout: 20000 }).toBeGreaterThan(1);
    await expect(municipioSelect).toHaveValue(/^[0-9a-f-]{36}$/i, {
      timeout: 10000,
    });
    const municipioLabel = await municipioSelect
      .locator(`option[value="${await municipioSelect.inputValue()}"]`)
      .textContent();
    // Catalog stores "Higüey" but the GeographicResolutionResult returns the
    // accent-stripped canonical form; we accept either "Higüey" or "Higuey".
    expect(['Higüey', 'Higuey']).toContain(municipioLabel?.trim());
  });
});
