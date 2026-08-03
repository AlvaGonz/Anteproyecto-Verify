import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Planos de Mensura');

const PDF = 'PLANO-MENSURA-CATASTRAL(2a6d4dc53820064f4c6aff8ca94f391c).pdf';
const PDF_PATH = path.join(TEST_DOCS_DIR, PDF);

test.describe('Plano de Mensura - municipio orphan resolution', () => {
  test('municipio dropdown populates from OCR even when provincia label is missing', async ({ page, request }) => {
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
    });
    const userId = (await loginRes.json()).user.id;

    const projRes = await request.post(`${API_BASE}/api/Projects`, {
      data: { nombre: 'Plano orphan muni', ubicacionTexto: 'Probe', usuarioCreadorId: userId, categoriaId: 12 },
    });
    const projectId = (await projRes.json()).id;

    const uploadRes = await request.post(
      `${API_BASE}/api/v1/projects/${projectId}/documents/requirements/PLANO_MENSURA/upload`,
      { multipart: { file: fs.createReadStream(PDF_PATH) } },
    );
    expect(uploadRes.status()).toBe(201);

    // Wait for OCR pipeline: municipio.rawValue is what this PDF actually produces
    await expect.poll(async () => {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`);
      const docs = await docsRes.json() as Array<{
        tipoDocumento?: number;
        planoMensuraExtraction?: { municipio?: { rawValue?: string } };
      }>;
      const doc = Array.isArray(docs) ? docs.find(d => d.tipoDocumento === 24) : null;
      return doc?.planoMensuraExtraction?.municipio?.rawValue ?? null;
    }, { timeout: 120000, intervals: [2000] }).toMatch(/CONCEPCION/);

    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const card = page.locator('[data-testid="plano-mensura-extraction-card"]');
    await card.waitFor({ state: 'visible', timeout: 60000 });

    const municipioSelect = card.locator('[data-testid="municipio-select"]');
    await expect(municipioSelect).toBeVisible();
    // BUG: when provincia is empty, municipio stays disabled with zero options
    await expect(municipioSelect).toBeEnabled({ timeout: 15000 });
    await expect.poll(async () => await municipioSelect.locator('option').count(), { timeout: 15000 }).toBeGreaterThan(1);
  });
});
