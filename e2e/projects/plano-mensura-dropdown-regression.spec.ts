import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Planos de Mensura');

/**
 * Regression test for the Plano de Mensura extraction card.
 *
 * Before the fix in DocumentService.ApplyGeographicResolutionAsync, the canonical
 * payload was collapsed to a CertificadoTituloRdExtractionV1 record regardless of
 * the actual document type. When the controller later deserialized the payload
 * as PlanoMensuraCatastralRdExtractionV1 (which has different field names like
 * departamento / operacion / designacionCatastralPosicional /
 * designacionCatastralOrigen / seccion / lugar / superficieARegistrarParcelaM2),
 * every OCR-derived value was silently dropped and the UI showed blank cards
 * for every field.
 *
 * After the fix, the canonical payload is preserved verbatim and the extraction
 * card shows the OCR-derived values for every field plus the cascading
 * Provincia / Municipio dropdowns.
 */
test.describe('Plano de Mensura - Dropdown migration + payload preservation', () => {
  const PDF = 'PLANO-MENSURA-CATASTRAL(2a6d4dc53820064f4c6aff8ca94f391c).pdf';
  const PDF_PATH = path.join(TEST_DOCS_DIR, PDF);

  test('dropdowns render and OCR values populate for PlanoMensura extraction', async ({ page, request }) => {
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    // 1) Login via API (faster + gives us the token for subsequent requests)
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const login = await loginRes.json();
    const userId = login.user.id;

    // 2) Create project
    const projRes = await request.post(`${API_BASE}/api/Projects`, {
      data: {
        nombre: 'Plano Mensura dropdown regression',
        ubicacionTexto: 'Santo Domingo',
        usuarioCreadorId: userId,
        categoria: 3,
      },
    });
    expect(projRes.ok()).toBeTruthy();
    const projectId = (await projRes.json()).id;

    // 3) Upload via API directly
    const uploadRes = await request.post(
      `${API_BASE}/api/v1/projects/${projectId}/documents/requirements/PLANO_MENSURA/upload`,
      { multipart: { file: fs.createReadStream(PDF_PATH) } },
    );
    expect(uploadRes.status()).toBe(201);

    // 4) Wait for OCR + resolution by polling the API. We poll on the EXISTENCE
    // of a populated field (departamento.rawValue) instead of the extraction
    // object, because Playwright's expect.poll treats null as a match.
    await expect.poll(async () => {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`);
      const docs = await docsRes.json() as Array<{
        tipoDocumento?: number;
        planoMensuraExtraction?: { departamento?: { rawValue?: string } };
      }>;
      const doc = Array.isArray(docs) ? docs.find(d => d.tipoDocumento === 24) : null;
      return doc?.planoMensuraExtraction?.departamento?.rawValue ?? null;
    }, { timeout: 120000, intervals: [2000] }).toBe('NORTE');

    // 5) Now login to UI and navigate to validations page
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: 'visible', timeout: 60000 });

    // 6) Verify Provincia dropdown exists and is populated
    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    await expect(provinciaSelect).toBeVisible();
    await expect.poll(async () => {
      return await provinciaSelect.locator('option').count();
    }, { timeout: 20000 }).toBeGreaterThan(1);

    const municipioSelect = card.locator('[data-testid="municipio-select"]');
    await expect(municipioSelect).toBeVisible();

    // 7) Verify Departamento field is populated (regression guard)
    const departamentoField = card.locator('[data-testid="field-departamento"]');
    await expect(departamentoField).toBeVisible();
    await expect(departamentoField).toContainText('NORTE');
  });
});
