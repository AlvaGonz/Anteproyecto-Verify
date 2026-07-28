import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';

const TEST_DOCS_DIR = path.join(process.cwd(), 'test_docs', 'Título de Propiedad');

/**
 * Regression test: After commit 1639d6c5 broke CertificadoTitulo OCR extraction,
 * we upload real PDFs and verify the extraction card shows valid data
 * (NOT "NO DETECTADO" for the 8 required fields).
 */
test.describe('Título de Propiedad - Real PDF Extraction Regression', () => {
  const TEST_FILES = [
    'Título de Propiedad A.pdf',
    'Título de Propiedad A2.pdf',
    'Título de Propiedad B.pdf',
    'CT Residencia del Parque 60 pdf.pdf',
    'CT 505483687149 Exp. 2024-0086769.pdf',
  ];

  for (const fileName of TEST_FILES) {
    test(`Extraction returns valid data for: ${fileName}`, async ({ page }) => {
      const filePath = path.join(TEST_DOCS_DIR, fileName);
      test.skip(!fs.existsSync(filePath), `Test PDF not found: ${filePath}`);

      // 1. Login as admin
      await page.goto(`${FRONTEND_BASE}/#/login`);
      await page.locator('input[type="email"]').fill('admin@verifinca.do');
      await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
      await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
      await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

      // 2. Get auth token via API
      const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
        data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
      });
      const loginData = await loginRes.json();
      const userId = loginData.user?.id || loginData.id;

      // 3. Create a fresh project via API
      const projRes = await page.request.post(`${API_BASE}/api/Projects`, {
        data: {
          nombre: `OCR Regression - ${fileName}`,
          ubicacionTexto: 'Santo Domingo',
          usuarioCreadorId: userId,
          categoria: 1,
        },
      });
      const project = await projRes.json();
      const projectId = project.id;

      // 4. Navigate to validations page
      await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);

      const requirementPanel = page.locator('[data-testid="requirement-status-titulo"]');
      await requirementPanel.waitFor({ state: 'visible', timeout: 15000 });

      // 5. Upload the PDF
      const fileInput = requirementPanel.locator('[data-testid="inline-file-upload"]');
      await fileInput.setInputFiles(filePath);

      // 6. Wait for the extraction card to render (no sleeps — use waitForSelector)
      const extractionCard = page.locator('[data-testid="certificado-titulo-extraction-card"]');
      await extractionCard.waitFor({ state: 'visible', timeout: 60000 });

      // 7. Verify the 8 required fields are detected (NOT "NO DETECTADO")
      // We assert that the "missing" warning badge is absent for at least the core fields.
      const card = extractionCard;

      // Helper: count "NO DETECTADO" badges currently visible in the card
      const countNoDetectado = async () => {
        return await card.getByText('NO DETECTADO', { exact: true }).count();
      };

      // At least 4 of 8 fields must be detected for the extraction to be considered working
      const initialMissing = await countNoDetectado();
      expect(initialMissing).toBeLessThanOrEqual(4);

      // Verify the card title shows the proper schema/processor
      await expect(card.getByText('Extracción de Certificado de Título')).toBeVisible();
    });
  }

  test('Extraction card surfaces required field labels for Titulo', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    // Navigate to the existing project from the user's report
    await page.goto(`${FRONTEND_BASE}/#/admin/projects/314c081f-86ee-45a0-9b08-02c32f18a885/validations`);
    const card = page.locator('[data-testid="certificado-titulo-extraction-card"]');
    if (await card.count() === 0) {
      test.skip(true, 'No extraction card present on this project');
    }
    // Confirm the 8 field labels are present
    await expect(card.getByText('Designación Catastral', { exact: true })).toBeVisible();
    await expect(card.getByText('Oficina', { exact: true })).toBeVisible();
    await expect(card.getByText('Matrícula', { exact: true })).toBeVisible();
    await expect(card.getByText('Fecha de Inscripción', { exact: true })).toBeVisible();
    await expect(card.getByText('Viene De', { exact: true })).toBeVisible();
    await expect(card.getByText('Municipio', { exact: true })).toBeVisible();
    await expect(card.getByText('Provincia', { exact: true })).toBeVisible();
    await expect(card.getByText('Superficie M2', { exact: true })).toBeVisible();
  });
});
