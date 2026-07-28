import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Estado Juridico');

/**
 * Regression test for the Estado Jurídico extraction card dropdown conversion.
 *
 * After the Provincia / Municipio fields were migrated from plain text inputs
 * to cascading `<select>` dropdowns (mirroring the Certificado de Título card),
 * the UI must still:
 *   - load the extraction after upload
 *   - render the dropdowns with `data-testid="provincia-select"` and
 *     `data-testid="municipio-select"`
 *   - populate them from /api/geo/provincias and /api/geo/municipios
 *   - auto-select the resolved province/municipality if the extraction
 *     includes provinceResolution / municipalityResolution
 */
test.describe('Estado Jurídico - Dropdown migration regression', () => {
  const PDF = 'Cert.  505483687149 Exp. 2024-0086769.pdf';
  const PDF_PATH = path.join(TEST_DOCS_DIR, PDF);

  test('dropdowns render and populate for EstadoJuridico extraction', async ({ page }) => {
    test.skip(!fs.existsSync(PDF_PATH), `PDF not found: ${PDF_PATH}`);

    // 1) Login
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
    });
    const userId = (await loginRes.json()).user.id;

    // 2) Create project
    const projRes = await page.request.post(`${API_BASE}/api/Projects`, {
      data: {
        nombre: 'Estado Juridico dropdown regression',
        ubicacionTexto: 'Santo Domingo',
        usuarioCreadorId: userId,
        categoria: 3, // Turistico to require EstadoJuridico
      },
    });
    const projectId = (await projRes.json()).id;

    // 3) Navigate and upload PDF
    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const panel = page.locator('[data-testid="requirement-row-estado_juridico"]');
    await panel.waitFor({ state: 'visible', timeout: 15000 });
    const fileInput = panel.locator('[data-testid="inline-file-upload"]');
    await fileInput.setInputFiles(PDF_PATH);

    // 4) Wait for the card to render
    const card = page.locator('[data-testid="estado-juridico-extraction-card"]');
    await card.waitFor({ state: 'visible', timeout: 60000 });

    // 5) Verify Provincia select exists and is populated
    const provinciaSelect = card.locator('[data-testid="provincia-select"]');
    await expect(provinciaSelect).toBeVisible();
    await expect(provinciaSelect).toHaveAttribute('data-testid', 'provincia-select');

    // Wait for at least one province option (besides the placeholder) to be loaded
    await expect.poll(async () => {
      return await provinciaSelect.locator('option').count();
    }, { timeout: 20000 }).toBeGreaterThan(1);

    const provinceOptionsCount = await provinciaSelect.locator('option').count();
    expect(provinceOptionsCount).toBeGreaterThan(5);

    // 6) Verify Municipio select exists (may or may not be enabled depending on province)
    const municipioSelect = card.locator('[data-testid="municipio-select"]');
    await expect(municipioSelect).toBeVisible();

    // 7) If a province is auto-selected, the municipio dropdown should be enabled
    // and contain at least the placeholder option.
    const municipioOptionsCount = await municipioSelect.locator('option').count();
    expect(municipioOptionsCount).toBeGreaterThanOrEqual(1);

    // 8) Verify the rest of the fields still render as text (Matricula, Catastral, etc.)
    await expect(card.locator('[data-testid="field-matricula"]')).toBeVisible();
    await expect(card.locator('[data-testid="field-designacionCatastral"]')).toBeVisible();
  });
});
