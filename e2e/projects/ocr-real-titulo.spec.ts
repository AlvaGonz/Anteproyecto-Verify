import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';

test.describe('Título de Propiedad - UI Smoke Test', () => {
  test('Displays incomplete extraction UI when OCR fails to find required fields', async ({ page }) => {
    // 1. Login via UI
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    // 2. Create project via API to ensure clean state
    const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' }
    });
    const loginData = await loginRes.json();
    const userId = loginData.user?.id || loginData.id;

    const projRes = await page.request.post(`${API_BASE}/api/Projects`, {
      data: {
        nombre: `UI Smoke Test Titulo`,
        ubicacionTexto: "Santo Domingo",
        usuarioCreadorId: userId,
        categoria: 1
      }
    });
    const project = await projRes.json();
    const projectId = project.id;
    
    // 3. Upload a generic dummy document that will fail OCR extraction
    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    
    // Create a dummy PDF in memory
    const dummyPdfPath = path.join(process.cwd(), 'e2e', 'fixtures', 'dummy-titulo.pdf');
    if (!fs.existsSync(path.dirname(dummyPdfPath))) {
      fs.mkdirSync(path.dirname(dummyPdfPath), { recursive: true });
    }
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nfake content');

    const requirementPanel = page.locator('data-testid=requirement-status-titulo');
    await requirementPanel.waitFor({ state: 'visible', timeout: 15000 });
    const fileInput = requirementPanel.locator('data-testid=inline-file-upload');
    await fileInput.setInputFiles(dummyPdfPath);
    
    // 4. UI Should display that extraction is incomplete or document is Observed
    await expect(page.getByRole('heading', { name: 'Extracción de Certificado de Título' }).first()).toBeVisible({ timeout: 45000 });
    
    // Basic assertions for the UI rendering the extraction panel
    await expect(page.locator('text=Designación Catastral')).toBeVisible();
    await expect(page.locator('text=Matrícula').first()).toBeVisible();
    
    // Because it's a dummy document, the status should be missing/incomplete
    await expect(page.locator('text=Missing').first()).toBeVisible();
  });
});
