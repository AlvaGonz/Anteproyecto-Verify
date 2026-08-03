import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Planos de Mensura');

const PDF = 'PLANO 505483687149.pdf';
const PDF_PATH = path.join(TEST_DOCS_DIR, PDF);

test.describe('Plano de Mensura - full-text fallback for label-less PDFs', () => {
  test('departamento=ESTE PDF still resolves provincia via full-text scan', async ({ page, request }) => {
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
    });
    const userId = (await loginRes.json()).user.id;

    const projRes = await request.post(`${API_BASE}/api/Projects`, {
      data: { nombre: 'Plano ESTE label-less', ubicacionTexto: 'Probe', usuarioCreadorId: userId, categoriaId: 12 },
    });
    const projectId = (await projRes.json()).id;

    const uploadRes = await request.post(
      `${API_BASE}/api/v1/projects/${projectId}/documents/requirements/PLANO_MENSURA/upload`,
      { multipart: { file: fs.createReadStream(PDF_PATH) } },
    );
    expect(uploadRes.status()).toBe(201);

    // Wait for OCR pipeline: this PDF yields departamento=ESTE but no PROVINCIA label.
    // The OCR text contains "AAALTAGRACIA" (corrupted LA ALTAGRACIA).
    // Per-field rawValue for provincia will be MISSING; full-text fallback should resolve it.
    await expect.poll(async () => {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`);
      const docs = await docsRes.json() as Array<{
        tipoDocumento?: number;
        planoMensuraExtraction?: {
          departamento?: { rawValue?: string };
          provincia?: { rawValue?: string };
          provinceResolution?: { resolvedName?: string | null; suggestedAction?: string };
        };
      }>;
      const doc = Array.isArray(docs) ? docs.find(d => d.tipoDocumento === 24) : null;
      const extraction = doc?.planoMensuraExtraction;
      return {
        departamento: extraction?.departamento?.rawValue ?? null,
        provinciaRaw: extraction?.provincia?.rawValue ?? null,
        resolvedName: extraction?.provinceResolution?.resolvedName ?? null,
        suggestedAction: extraction?.provinceResolution?.suggestedAction ?? null,
      };
    }, { timeout: 120000, intervals: [2000] }).toMatchObject({
      departamento: 'ESTE',
      // ResolutionAction enum is serialized as integer (AutoApply=0)
      suggestedAction: 0,
      resolvedName: 'La Altagracia',
    });

    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: 'visible', timeout: 60000 });

    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    await expect(provinciaSelect).toBeVisible();
    await expect(provinciaSelect).toBeEnabled({ timeout: 15000 });

    const selectedProvinceId = await provinciaSelect.inputValue();
    expect(selectedProvinceId).not.toBe('');
    expect(selectedProvinceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    const optionTexts = await provinciaSelect.locator('option').allTextContents();
    const laAltagraciaOption = optionTexts.find(t => t.includes('La Altagracia'));
    expect(laAltagraciaOption, `expected "La Altagracia" option, got: ${JSON.stringify(optionTexts)}`).toBeDefined();
  });
});
