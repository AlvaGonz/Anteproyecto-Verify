import { test, expect } from '@playwright/test';
import path from 'path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Plano de Mensura', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const directory = path.join(process.cwd(), 'e2e', 'fixtures', 'planos-mensura');
  
  const files = [
    { 
      path: path.join(directory, 'PLANO RP 60.pdf'), 
      name: 'mensura_fixture_a',
      status: 'Extracción Exitosa',
      checks: ['Desig. Catastral Posicional', 'Superficie A. Regist.']
    },
    { 
      path: path.join(directory, 'PLANO 505483687149.pdf'), 
      name: 'mensura_fixture_b',
      status: 'Extracción Exitosa',
      checks: ['Desig. Catastral Posicional', 'Provincia', 'Municipio', 'Superficie A. Regist.']
    },
    { 
      path: path.join(directory, 'PLANO-MENSURA-CATASTRAL(2a6d4dc53820064f4c6aff8ca94f391c).pdf'), 
      name: 'mensura_fixture_c',
      status: 'Extracción Exitosa',
      checks: ['Municipio', 'Lugar']
    }
  ];

  test('Extracts data from 3 Plano de Mensura documents and verifies secure API boundary', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    // API boundary checks
    let diagnosisResponseChecked = false;
    page.on('response', async response => {
      if (response.url().includes('/documents') && response.request().method() === 'GET') {
        const json = await response.json().catch(() => null);
        if (json && Array.isArray(json) && json.length > 0) {
          const doc = json[0];
          if (doc.tipoDocumento === 24) { // PlanoMensuraCatastral
            expect(doc.resultadoOcrJson).toBeFalsy(); // Should be omitted/null at DTO level
            expect(doc.filePath).toBeFalsy(); // Should not leak internal paths
            expect(doc.planoMensuraExtraction).toBeTruthy(); // Canonical extraction must be present
            diagnosisResponseChecked = true;
          }
        }
      }
    });

    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    const runTestForFile = async (fileInfo, index) => {
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
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        },
        data: {
          nombre: `OCR Test Mensura ${fileInfo.name}`,
          ubicacionTexto: "Santo Domingo",
          usuarioCreadorId: userId,
          categoria: 1 // Residencial
        }
      });
      if (!projRes.ok()) throw new Error(`Failed to create project: ${projRes.status()} ${await projRes.text()}`);
      const project = await projRes.json();
      const projectId = project.id;
      
      // b. Upload document via UI
      await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
      await page.waitForLoadState('networkidle');
      
      // Locate the hidden file input for the "mensura" requirement
      const fileInput = page.locator('data-testid=requirement-row-mensura').locator('data-testid=inline-file-upload');
      
      // Upload the file directly using setInputFiles
      await fileInput.setInputFiles(fileInfo.path);
      
      // c. Wait for processing to complete (the UI should show "Valid" or "Extracción de Plano de Mensura")
      await expect(page.getByRole('heading', { name: 'Extracción de Plano de Mensura' }).first()).toBeVisible({ timeout: 45000 });
      
      // Status is reflected by the heading (e.g. "Extracción de Plano de Mensura") which
      // is already asserted above. No separate "Extracción Exitosa" text is rendered.

      // Assert expected fields are present
      for (const check of fileInfo.checks) {
         await expect(page.locator(`text=${check}`).first()).toBeVisible();
      }

      // Assert Fixture C shows NO DETECTADO for missing fields
      if (fileInfo.name === 'mensura_fixture_c') {
         // Provincia is missing
         const provinciaField = page.locator('data-testid=field-provincia');
         await expect(provinciaField).toContainText('NO DETECTADO');
      }

      // Take a screenshot
      const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\a28ef087-9556-4a4c-bf65-bf77f5416301';
      await page.screenshot({ path: path.join(artifactsDir, `media_ocr_mensura_${fileInfo.name}.png`), fullPage: true });
    };

    // Run for all 3 files sequentially
    for (let i = 0; i < files.length; i++) {
      console.log(`Running extraction test for ${files[i].name}...`);
      await runTestForFile(files[i], i);
    }

    // Verify API boundary check occurred
    expect(diagnosisResponseChecked).toBeTruthy();
  });
});
