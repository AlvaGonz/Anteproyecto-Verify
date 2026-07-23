import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Título de Propiedad', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const directory = 'C:\\Users\\Alva\\OneDrive - Universidad Central del Este\\UCE\\Doceavo Cuatrimestre\\Proyecto de Grado\\Documentos para MODELO aplicacion UCE\\Título de Propiedad';
  
  const files = [
    { path: path.join(directory, 'Título de Propiedad A.pdf'), name: 'titulo_a' },
    { path: path.join(directory, 'Título de Propiedad A2.pdf'), name: 'titulo_a2' },
    { path: path.join(directory, 'Título de Propiedad B.pdf'), name: 'titulo_b' },
    { path: path.join(directory, 'CT 505483687149 Exp. 2024-0086769.pdf'), name: 'titulo_c' },
    { path: path.join(directory, 'CT Residencia del Parque 60 pdf.pdf'), name: 'titulo_d' }
  ];

  test('Extracts data from 5 real Título de Propiedad documents', async ({ page }) => {
    // 1. Login via UI
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('request', request => {
      if (request.url().includes('/upload')) {
        console.log(`UPLOAD REQUEST HEADERS:`, request.headers());
      }
    });
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        console.log(`PAGE NETWORK ERROR: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    // Ensure we are fully logged in and get the token
    const tokenCookie = await page.context().cookies();
    
    // We will do the rest using API calls to be robust, then navigate to the UI to verify and screenshot.
    const runTestForFile = async (filePath, screenshotName) => {
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
          nombre: `OCR Test ${path.basename(filePath)}`,
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
      
      // Locate the hidden file input for the "titulo" requirement
      const fileInput = page.locator('data-testid=requirement-status-titulo').locator('data-testid=inline-file-upload');
      
      // Upload the file directly using setInputFiles
      await fileInput.setInputFiles(filePath);
      
      // c. Wait for processing to complete (the UI should show "Valid" or "Extracción de Certificado de Título")
      await expect(page.getByRole('heading', { name: 'Extracción de Certificado de Título' }).first()).toBeVisible({ timeout: 45000 });
      
      // Take a screenshot
      const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\ef2ec966-a933-48fb-bb91-4344e16a6d98';
      await page.screenshot({ path: path.join(artifactsDir, screenshotName), fullPage: true });
      
      // Basic assertions
      await expect(page.locator('text=Designación Catastral')).toBeVisible();
      await expect(page.locator('text=Matrícula').first()).toBeVisible();
      await expect(page.locator('text=Superficie').first()).toBeVisible();
    };

    // Run for all 5 files sequentially
    for (const file of files) {
      console.log(`Running extraction test for ${file.name}...`);
      await runTestForFile(file.path, `media_ocr_${file.name}.png`);
    }
  });
});
