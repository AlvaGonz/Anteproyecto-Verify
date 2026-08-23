import { test, expect } from '@playwright/test';
import path from 'path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Certificación IPI 0001', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const testFileIPI = path.resolve(process.cwd(), 'test_docs/Certificación IPI/Certificacion IPI_0001.pdf');

  test('Extracts all 3 critical fields from Certificacion IPI_0001.pdf and validates against Gobernanza DB', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    // 1. Login via UI
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    // 2. Login via API to get real user ID
    const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'admin@verifinca.do',
        password: 'AdminVerifinca2026!'
      }
    });
    if (!loginRes.ok()) throw new Error(`API login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    const userId = loginData.user?.id || loginData.id;

    // 3. Create a project
    const projRes = await page.request.post(`${API_BASE}/api/Projects`, {
      data: {
        nombre: `OCR Test IPI 0001 ${Date.now()}`,
        ubicacionTexto: "Santo Domingo",
        usuarioCreadorId: userId,
        categoriaId: 16
      }
    });
    if (!projRes.ok()) throw new Error(`Failed to create project: ${projRes.status()} ${await projRes.text()}`);
    const project = await projRes.json();
    const projectId = project.id;
    
    // 4. Navigate to project validations
    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    await page.waitForLoadState('networkidle');

    // 5. Upload Certificacion IPI_0001.pdf
    const fileInput = page.locator('[data-testid="requirement-row-certificacion_ipi"]').locator('[data-testid="inline-file-upload"]');
    await fileInput.setInputFiles(testFileIPI);
    
    // 6. Wait for either extraction card or modal to appear
    const card = page.locator('[data-testid="certificacion-ipi-extraction-card"]');
    const modalBtn = page.getByRole('button', { name: /Entendido/i });

    await Promise.race([
      card.waitFor({ state: 'visible', timeout: 90000 }),
      modalBtn.waitFor({ state: 'visible', timeout: 90000 })
    ]).catch(() => {});

    if (await modalBtn.isVisible()) {
      await modalBtn.click();
      await page.waitForTimeout(500);
    }

    await expect(card).toBeVisible({ timeout: 60000 });

    if (await modalBtn.isVisible()) {
      await modalBtn.click();
      await page.waitForTimeout(500);
    }

    // 7. Verify all 3 extracted fields in the UI
    await expect(card.locator('[data-testid="field-numeroCertificacion"]')).toContainText('338738592876');
    await expect(card.locator('[data-testid="field-numeroInmueble"]')).toContainText('070223482149:0021');
    await expect(card.locator('[data-testid="field-parcelaNumero"]')).toContainText('070223482149');

    // 8. Click "Validar contra Estado/Gobernanza"
    const validateBtn = card.getByRole('button', { name: /Validar contra Estado\/Gobernanza/i });
    await expect(validateBtn).toBeVisible({ timeout: 10000 });
    await validateBtn.click();

    // If Discrepancy Dialog opens, click "Proceder con Riesgo"
    const proceedBtn = page.getByRole('button', { name: /Proceder con Riesgo/i });
    try {
      await proceedBtn.waitFor({ state: 'visible', timeout: 3000 });
      await proceedBtn.click();
    } catch {
      // No discrepancy dialog
    }

    // 9. Assert 100% Match and successful verification
    await expect(card.locator('text=100%')).toBeVisible({ timeout: 20000 });
    await expect(card.locator('text=Certificación de IPI verificada')).toBeVisible({ timeout: 10000 });

    // Scroll card into view
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 10. Screenshot for artifact report
    const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\61a64507-19f1-4ca1-9521-a71fd8b7c646';
    await card.screenshot({ path: path.join(artifactsDir, 'media_ocr_certificacion_ipi_0001_card.png') });
    await page.screenshot({ path: path.join(artifactsDir, 'media_ocr_certificacion_ipi_0001.png'), fullPage: true });
  });
});
