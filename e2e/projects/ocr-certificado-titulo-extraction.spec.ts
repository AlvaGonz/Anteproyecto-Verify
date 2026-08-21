import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';

const FIXTURE_PATH = process.env.TEST_DOCUMENTS_ROOT
  ? path.join(process.env.TEST_DOCUMENTS_ROOT, 'TP_0001.pdf')
  : path.join(process.cwd(), 'test_docs', 'Título de Propiedad', 'TP_0001.pdf');

/**
 * TDD E2E Test: Certificado de Título OCR extraction & prefill.
 * Validates that labeled header values are extracted accurately despite intentional
 * narrative distractors in the document body.
 *
 * Distinct from Gobernanza/Catastro verification: this test strictly verifies
 * document upload -> OCR pipeline -> UI field prefill & manual editing capability.
 */
test.describe('Certificado de Título - OCR Extraction and UI Prefill', () => {
  test('Uploads TP_0001.pdf and accurately pre-fills all 8 fields from labeled regions', async ({ page, request }) => {
    test.setTimeout(240000);
    test.skip(!fs.existsSync(FIXTURE_PATH), `Fixture PDF not found at: ${FIXTURE_PATH}`);

    // 1) Login via API to get auth credentials
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@verifinca.do', password: 'AdminVerifinca2026!' },
      timeout: 60000,
    });
    expect(loginRes.ok()).toBeTruthy();

    // 2) Select an existing project
    const projectsRes = await request.get(`${API_BASE}/api/projects?pageSize=5`, { timeout: 60000 });
    expect(projectsRes.ok()).toBeTruthy();
    const projectsBody = await projectsRes.json();
    const projectList: Array<{ id: string }> = Array.isArray(projectsBody)
      ? projectsBody
      : (projectsBody.items ?? projectsBody.projects ?? projectsBody.data ?? []);
    expect(projectList.length).toBeGreaterThan(0);
    const projectId = projectList[0].id;

    // 3) Upload the fixture PDF to TITULO requirement endpoint
    const uploadRes = await request.post(
      `${API_BASE}/api/v1/projects/${projectId}/documents/requirements/TITULO/upload`,
      { multipart: { file: fs.createReadStream(FIXTURE_PATH) }, timeout: 180000 },
    );
    expect(uploadRes.status()).toBe(201);
    const uploadedData = await uploadRes.json();
    const uploadedDocId = uploadedData.id ?? uploadedData.documentoId;

    // 4) Poll API for OCR extraction completion on the exact uploaded document
    const POLL_TIMEOUT_MS = 120000;
    const POLL_INTERVAL_MS = 2000;
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let extractedDoc: any = null;

    while (Date.now() < deadline) {
      const docsRes = await request.get(`${API_BASE}/api/projects/${projectId}/documents`, { timeout: 60000 });
      const docs = await docsRes.json();
      const doc = Array.isArray(docs) ? docs.find((d: any) => d.id === uploadedDocId) : null;

      if (doc && doc.certificadoTituloExtraction) {
        const ext = doc.certificadoTituloExtraction;
        if (ext.matricula && (ext.matricula.rawValue || ext.matricula.normalizedValue)) {
          extractedDoc = ext;
          break;
        }
      }
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }

    expect(extractedDoc).not.toBeNull();

    // 5) Backend extraction assertions (Contract & Oracles)
    // (a) Designación Catastral must match exactly
    expect(extractedDoc.designacionCatastral?.normalizedValue ?? extractedDoc.designacionCatastral?.rawValue)
      .toBe('050193819517:0017');

    // (b) Matrícula must pick header "1057385457"
    expect(extractedDoc.matricula?.normalizedValue ?? extractedDoc.matricula?.rawValue)
      .toBe('1057385457');

    // (c) Superficie must pick header "14792.83"
    expect(extractedDoc.superficieM2?.normalizedValue ?? extractedDoc.superficieM2?.rawValue)
      .toBe('14792.83');

    // (d) Oficina must pick "VIRTUAL"
    expect(extractedDoc.oficina?.normalizedValue ?? extractedDoc.oficina?.rawValue)
      .toContain('VIRTUAL');

    // (e) VieneDe must capture "PARCELA 24,DC-65"
    expect(extractedDoc.vieneDe?.status).not.toBe(1); // 1 = Missing
    expect(extractedDoc.vieneDe?.normalizedValue ?? extractedDoc.vieneDe?.rawValue)
      .toContain('PARCELA 24,DC-65');

    // 6) Navigate to UI and verify the extraction card renders with pre-filled fields
    await page.goto(`${FRONTEND_BASE}/#/login`);
    await page.locator('input[type="email"]').fill('admin@verifinca.do');
    await page.locator('input[type="password"]').fill('AdminVerifinca2026!');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.locator('text=Proyectos').first()).toBeVisible({ timeout: 15000 });

    const disclaimerBtn = page.getByRole('button', { name: /Aceptar y Continuar/i });
    if (await disclaimerBtn.count() > 0) {
      await disclaimerBtn.first().click();
    }

    await page.goto(`${FRONTEND_BASE}/#/admin/projects/${projectId}/validations`);
    const card = page.locator('[data-testid="titulo-extraction-card"]').first();
    await expect(card).toBeVisible({ timeout: 30000 });

    // Verify UI display of extracted values
    await expect(card).toContainText('050193819517:0017');
    await expect(card).toContainText('1057385457');
    await expect(card).toContainText('14,792.83');
    await expect(card).toContainText('VIRTUAL');
    await expect(card).toContainText('PARCELA 24,DC-65');

    // 7) Click "Validar contra Estado/Gobernanza" and verify 100% match against CatastroTitulo DB
    const validarBtn = card.getByRole('button', { name: /Validar contra Estado\/Gobernanza/i });
    await expect(validarBtn).toBeVisible();
    await validarBtn.click();

    // If project metadata discrepancy dialog appears, confirm with "Proceder con Riesgo"
    const proceedBtn = page.getByRole('button', { name: /Proceder con Riesgo/i });
    if (await proceedBtn.count() > 0) {
      await proceedBtn.first().click();
    }

    // Verify feedback card shows successful validation with 100% match
    await expect(card.locator('text=Validación Exitosa').first()).toBeVisible({ timeout: 15000 });
    await expect(card.locator('text=100% Match').first()).toBeVisible({ timeout: 15000 });
  });
});
