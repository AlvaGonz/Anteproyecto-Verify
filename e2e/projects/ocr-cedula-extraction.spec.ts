import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Cédula', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const testFileCedula = 'C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Cedula\\Cedula nueva A.webp';

  test('Extracts data from Cédula nueva A.webp', async ({ page }) => {
    // 1. Login via UI
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('response', async response => {
      if (!response.ok() && response.status() >= 400) {
        console.log(`PAGE NETWORK ERROR: ${response.status()} ${response.url()}`);
        try {
            console.log(`RESPONSE BODY:`, await response.text());
        } catch(e) {}
      }
    });
    
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    // 0. Login via API to get real user ID
    const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'admin@verifinca.do',
        password: 'AdminVerifinca2026!'
      }
    });
    if (!loginRes.ok()) throw new Error(`API login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    const userId = loginData.user?.id || loginData.id;

    // a. Create project
    const projRes = await page.request.post(`${API_BASE}/api/Projects`, {
      data: {
        nombre: `OCR Test Cedula`,
        ubicacionTexto: "Santo Domingo",
        usuarioCreadorId: userId,
        categoria: 1
      }
    });
    if (!projRes.ok()) throw new Error(`Failed to create project: ${projRes.status()} ${await projRes.text()}`);
    const project = await projRes.json();
    const projectId = project.id;
    
    // b. Upload document via UI
    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    await page.waitForLoadState('networkidle');
    
    // Locate the hidden file input for the "cedula" requirement
    const fileInput = page.locator('data-testid=requirement-status-cedula').locator('data-testid=inline-file-upload');
    
    // Upload the file directly using setInputFiles
    await fileInput.setInputFiles(testFileCedula);
    
    // c. Wait for processing to complete
    await expect(page.getByRole('heading', { name: /Extracción/i }).first()).toBeVisible({ timeout: 45000 });
    
    // Take a screenshot
    const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\ef2ec966-a933-48fb-bb91-4344e16a6d98';
    await page.screenshot({ path: path.join(artifactsDir, 'media_ocr_cedula.png'), fullPage: true });
    
    // Basic assertions
    await expect(page.locator('text=Nombre').or(page.locator('text=Nombres'))).toBeVisible();
    await expect(page.locator('text=Apellidos').or(page.locator('text=Apellido'))).toBeVisible();
    await expect(page.locator('text=Fecha de Nacimiento')).toBeVisible();
  });
});
