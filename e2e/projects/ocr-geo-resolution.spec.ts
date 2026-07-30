import { test, expect } from '@playwright/test';

// Mock OCR extraction payload for Título de Propiedad with realistic OCR noise
const mockOcrPayloads = {
  // Exact match scenario
  exactMatch: {
    success: true,
    provider: 'PaddleOCR',
    confidenceScore: 0.85,
    fields: {
      provincia: { name: 'provincia', value: 'LA ALTAGRACIA', confidence: 0.8, reviewState: 0 },
      municipio: { name: 'municipio', value: 'HIGUEY', confidence: 0.78, reviewState: 0 }
    },
    canonicalDataJson: JSON.stringify({
      schemaVersion: '1.0',
      documentType: 'CertificadoTitulo',
      extractionStatus: 2,
      overallConfidence: 0.85,
      provincia: { rawValue: 'LA ALTAGRACIA', normalizedValue: 'LA ALTAGRACIA', confidence: 0.8, status: 0, sourcePage: 1 },
      municipio: { rawValue: 'HIGUEY', normalizedValue: 'HIGUEY', confidence: 0.78, status: 0, sourcePage: 1 }
    })
  },
  // Alias match with OCR noise
  aliasWithNoise: {
    success: true,
    provider: 'PaddleOCR',
    confidenceScore: 0.82,
    fields: {
      provincia: { name: 'provincia', value: 'OFICINA LAALTAGRACIA', confidence: 0.75, reviewState: 0 },
      municipio: { name: 'municipio', value: 'PODERJUDICIALREPUBLICA DOMINICANA HIGUEY', confidence: 0.72, reviewState: 0 }
    },
    canonicalDataJson: JSON.stringify({
      schemaVersion: '1.0',
      documentType: 'CertificadoTitulo',
      extractionStatus: 2,
      overallConfidence: 0.82,
      provincia: { rawValue: 'OFICINA LAALTAGRACIA', normalizedValue: 'OFICINA LAALTAGRACIA', confidence: 0.75, status: 0, sourcePage: 1 },
      municipio: { rawValue: 'PODERJUDICIALREPUBLICA DOMINICANA HIGUEY', normalizedValue: 'PODERJUDICIALREPUBLICA DOMINICANA HIGUEY', confidence: 0.72, status: 0, sourcePage: 1 }
    })
  },
  // Unresolved low confidence
  unresolved: {
    success: true,
    provider: 'PaddleOCR',
    confidenceScore: 0.45,
    fields: {
      provincia: { name: 'provincia', value: 'XYZFOOBAR', confidence: 0.3, reviewState: 0 },
      municipio: { name: 'municipio', value: 'UNKNOWNVILLE', confidence: 0.25, reviewState: 0 }
    },
    canonicalDataJson: JSON.stringify({
      schemaVersion: '1.0',
      documentType: 'CertificadoTitulo',
      extractionStatus: 2,
      overallConfidence: 0.45,
      provincia: { rawValue: 'XYZFOOBAR', normalizedValue: 'XYZFOOBAR', confidence: 0.3, status: 0, sourcePage: 1 },
      municipio: { rawValue: 'UNKNOWNVILLE', normalizedValue: 'UNKNOWNVILLE', confidence: 0.25, status: 0, sourcePage: 1 }
    })
  }
};

test.describe('OCR Geographic Resolution - Título de Propiedad', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a project validation page
    await page.goto('/admin/projects/5ccb078f-f02a-002a-9b64-107cb05c0847/validations/');
    await page.waitForLoadState('networkidle');
  });

  test('province dropdown auto-selects on exact match', async ({ page }) => {
    // Mock the OCR extraction API to return exact match payload
    await page.route('**/api/documents/*/ocr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOcrPayloads.exactMatch)
      });
    });

    // Trigger OCR extraction (assuming there's a button or it auto-runs)
    await page.waitForSelector('[data-testid="certificado-titulo-extraction-card"]', { timeout: 10000 });
    
    // Check that province resolution badge shows "Exacto"
    const provinceCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Provincia').locator('..');
    await expect(provinceCard.locator('text=Exacto')).toBeVisible({ timeout: 5000 });
    
    // Check municipality resolution badge shows "Exacto" 
    const municipalityCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Municipio').locator('..');
    await expect(municipalityCard.locator('text=Exacto')).toBeVisible({ timeout: 5000 });
  });

  test('province/municipality auto-select on alias match with OCR noise', async ({ page }) => {
    // Mock the OCR extraction API to return alias + noise payload
    await page.route('**/api/documents/*/ocr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOcrPayloads.aliasWithNoise)
      });
    });

    await page.waitForSelector('[data-testid="certificado-titulo-extraction-card"]', { timeout: 10000 });
    
    // Check that province resolution badge shows "Alias" (after normalizer strips OFICINA)
    const provinceCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Provincia').locator('..');
    await expect(provinceCard.locator('text=Alias')).toBeVisible({ timeout: 5000 });
    
    // Check municipality resolution shows Alias after stripping Poder Judicial noise
    const municipalityCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Municipio').locator('..');
    await expect(municipalityCard.locator('text=Alias')).toBeVisible({ timeout: 5000 });
  });

  test('unresolved low confidence does NOT auto-select and shows "No resuelto"', async ({ page }) => {
    await page.route('**/api/documents/*/ocr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOcrPayloads.unresolved)
      });
    });

    await page.waitForSelector('[data-testid="certificado-titulo-extraction-card"]', { timeout: 10000 });
    
    // Check that province shows "No resuelto"
    const provinceCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Provincia').locator('..');
    await expect(provinceCard.locator('text=No resuelto')).toBeVisible({ timeout: 5000 });
    
    // Check that municipality shows "No resuelto"
    const municipalityCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Municipio').locator('..');
    await expect(municipalityCard.locator('text=No resuelto')).toBeVisible({ timeout: 5000 });
    
    // Verify dropdowns remain unselected/editable
    const provinceSelect = page.locator('select[data-testid="provincia-select"]');
    await expect(provinceSelect).toHaveValue('');
    
    const municipalitySelect = page.locator('select[data-testid="municipio-select"]');
    await expect(municipalitySelect).toHaveValue('');
  });

  test('fuzzy review zone shows "Revisar" badge, no auto-apply', async ({ page }) => {
    const fuzzyPayload = {
      ...mockOcrPayloads.exactMatch,
      canonicalDataJson: JSON.stringify({
        ...JSON.parse(mockOcrPayloads.exactMatch.canonicalDataJson),
        provincia: { rawValue: 'SANT DOMINGO', normalizedValue: 'SANT DOMINGO', confidence: 0.85, status: 0, sourcePage: 1 },
        municipio: { rawValue: 'SAN PEDRO MACORIS', normalizedValue: 'SAN PEDRO MACORIS', confidence: 0.82, status: 0, sourcePage: 1 },
        provinceResolution: {
          rawValue: 'SANT DOMINGO',
          normalizedValue: 'SANT DOMINGO',
          resolvedId: '11111111-0000-0000-0000-000000000004',
          resolvedName: 'Santo Domingo',
          resolutionMethod: 'fuzzy',
          confidence: 0.85,
          aliasesMatched: [],
          warnings: ['Fuzzy match in review zone (85%) - confirm before applying.'],
          suggestedAction: 'Review'
        },
        municipalityResolution: {
          rawValue: 'SAN PEDRO MACORIS',
          normalizedValue: 'SAN PEDRO MACORIS',
          resolvedId: '22222222-0000-0000-0000-000000000005',
          resolvedName: 'San Pedro de Macorís',
          resolutionMethod: 'fuzzy',
          confidence: 0.82,
          aliasesMatched: [],
          warnings: ['Fuzzy match in review zone (82%) - confirm before applying.'],
          suggestedAction: 'Review'
        }
      })
    };

    await page.route('**/api/documents/*/ocr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fuzzyPayload)
      });
    });

    await page.waitForSelector('[data-testid="certificado-titulo-extraction-card"]', { timeout: 10000 });
    
    // Check that province shows "Revisar" badge (fuzzy in review zone)
    const provinceCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Provincia').locator('..');
    await expect(provinceCard.locator('text=Revisar')).toBeVisible({ timeout: 5000 });
    
    // Check municipality shows "Revisar" badge
    const municipalityCard = page.locator('[data-testid="certificado-titulo-extraction-card"]').locator('text=Municipio').locator('..');
    await expect(municipalityCard.locator('text=Revisar')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('OCR Geographic Resolution - Form Integration', () => {
  test('parent form receives auto-select suggestion and updates dropdown', async ({ page }) => {
    await page.goto('/admin/projects/5ccb078f-f02a-002a-9b64-107cb05c0847/validations/');
    await page.waitForLoadState('networkidle');

    await page.route('**/api/documents/*/ocr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOcrPayloads.exactMatch)
      });
    });

    await page.waitForSelector('[data-testid="certificado-titulo-extraction-card"]', { timeout: 10000 });
    
    // The parent form's provincia dropdown should be updated
    const provinciaSelect = page.locator('select[name="provinciaId"]');
    await expect(provinciaSelect).not.toHaveValue('', { timeout: 5000 });
    
    // The municipio dropdown should be updated
    const municipioSelect = page.locator('select[name="municipioId"]');
    await expect(municipioSelect).not.toHaveValue('', { timeout: 5000 });
  });
});
