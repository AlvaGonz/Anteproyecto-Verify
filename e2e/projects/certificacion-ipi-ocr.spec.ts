import { test, expect } from '@playwright/test';
import path from 'path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('Real OCR Extraction Flow - Certificación IPI', () => {
  test.setTimeout(180000); // 3 minutes timeout

  const directory = path.join(process.cwd(), 'test_docs', 'Certificación IPI');
  
  const files = [
    { 
      path: path.join(directory, 'Certificacion IPI.pdf'), 
      name: 'certificacion_ipi_fixture',
      status: 'Extracción Exitosa',
      checks: ['No. de Certificación', 'No. Inmueble', 'Parcela No.']
    }
  ];

  test('Extracts data from Certificación IPI document and verifies secure API boundary', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    // API boundary checks
    let diagnosisResponseChecked = false;
    page.on('response', async response => {
      if (response.url().includes('/documents') && response.request().method() === 'GET') {
        const json = await response.json().catch(() => null);
        if (json && Array.isArray(json) && json.length > 0) {
          const doc = json[0];
          if (doc.tipoDocumento === 8) { // DocumentType.CertificacionIPI
            expect(doc.resultadoOcrJson).toBeFalsy(); // Should be omitted/null at DTO level
            expect(doc.filePath).toBeFalsy(); // Should not leak internal paths
            expect(doc.certificacionIPIExtraction).toBeTruthy(); // Canonical extraction must be present
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
          nombre: `OCR Test Certificacion IPI ${fileInfo.name}`,
          ubicacionTexto: "Santo Domingo",
          usuarioCreadorId: userId,
          categoriaId: 16 // VIVIENDAS
        }
      });
      if (!projRes.ok()) throw new Error(`Failed to create project: ${projRes.status()} ${await projRes.text()}`);
      const project = await projRes.json();
      const projectId = project.id;
      
      // b. Upload document via UI
      await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
      await page.waitForLoadState('networkidle');
      
      // Locate the hidden file input for the "certificacion_ipi" requirement
      const fileInput = page.locator('[data-testid="requirement-row-certificacion_ipi"]').locator('[data-testid="inline-file-upload"]');
      
      // Upload the file directly using setInputFiles
      await fileInput.setInputFiles(fileInfo.path);
      
      // c. Wait for processing to complete
      await expect(page.getByRole('heading', { name: 'Extracción de Certificación IPI' }).first()).toBeVisible({ timeout: 45000 });
      
      // Status is reflected by the heading (e.g. "Extracción de Plano de Mensura") which
      // is already asserted above. No separate "Extracción Exitosa" text is rendered.

      // Assert expected fields are present
      for (const check of fileInfo.checks) {
         await expect(page.locator(`text=${check}`).first()).toBeVisible();
      }

      // Assert Fixture shows NO DETECTADO for missing fields (if any)
      // The test document should have all 3 fields

      // Take a screenshot
      const artifactsDir = 'C:\\Users\\Alva\\.gemini\\antigravity-ide\\brain\\a28ef087-9556-4a4c-bf65-bf77f5416301';
      await page.screenshot({ path: path.join(artifactsDir, `media_ocr_certificacion_ipi_${fileInfo.name}.png`), fullPage: true });
    };

    // Run for all files sequentially
    for (let i = 0; i < files.length; i++) {
      console.log(`Running extraction test for ${files[i].name}...`);
      await runTestForFile(files[i], i);
    }

    // Verify API boundary check occurred
    expect(diagnosisResponseChecked).toBeTruthy();
  });
});
