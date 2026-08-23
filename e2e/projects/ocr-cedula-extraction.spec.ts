import { test, expect } from '@playwright/test';
import path from 'path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Cédula Dominicana', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const testFileCedula = path.resolve(process.cwd(), 'test_docs/Cedula/Cedula nueva_0001.pdf');

  test('Extracts all 5 critical fields from Cedula nueva_0001.pdf', async ({ page }) => {
    // 1. Login via UI
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
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
        nombre: `OCR Test Cedula ${Date.now()}`,
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

    // 5. Upload Cedula nueva_0001.pdf
    const fileInput = page.locator('data-testid=requirement-row-cedula').locator('data-testid=inline-file-upload');
    await fileInput.setInputFiles(testFileCedula);
    
    // 6. Wait for extraction card
    const card = page.locator('[data-testid="cedula-extraction-card"]');
    await expect(card).toBeVisible({ timeout: 60000 });

    // 7. Verify all 5 extracted fields in the UI
    await expect(card.locator('text=00010032696')).toBeVisible({ timeout: 15000 });
    await expect(card.locator('text=MARIA MIGUEL')).toBeVisible({ timeout: 15000 });
    await expect(card.locator('text=CRUZ GOMEZ')).toBeVisible({ timeout: 15000 });
    await expect(card.locator('text=04-06-1962')).toBeVisible({ timeout: 15000 });
    await expect(card.locator('text=03-05-2025')).toBeVisible({ timeout: 15000 });

    // Dismiss any modal
    const modalBtn = page.getByRole('button', { name: /Entendido/i });
    if (await modalBtn.isVisible()) {
      await modalBtn.click();
      await page.waitForTimeout(600);
    }

    // Scroll card into view
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 8. Screenshot for artifact report
    const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\61a64507-19f1-4ca1-9521-a71fd8b7c646';
    await card.screenshot({ path: path.join(artifactsDir, 'media_ocr_cedula_0001_card.png') });
    await page.screenshot({ path: path.join(artifactsDir, 'media_ocr_cedula_0001.png'), fullPage: true });
  });
});
