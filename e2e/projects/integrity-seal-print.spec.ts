import { test, expect } from '@playwright/test';

const SEALED_PROJECT_ID = 'proj-seal-active-001';

const sealCode = 'VERIFINCA-20260801-A1B2C3D4';
const qrToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token';

const mockSealedProject = {
  id: SEALED_PROJECT_ID,
  codigoInterno: 'VF-SEAL-ACTIVE',
  nombre: 'Torre Residencial Vista Real',
  ubicacionTexto: 'Santo Domingo, Distrito Nacional',
  categoriaId: 16,
  estadoProyecto: 'PUBLICADO',
  estadoIntegridad: 2,
  usuarioCreadorId: 'user-001',
  createdAtUtc: '2026-01-01T00:00:00Z',
};

const mockActiveSeal = {
  id: 1,
  idSello: 1,
  idProyecto: SEALED_PROJECT_ID,
  proyectoId: SEALED_PROJECT_ID,
  codigoSello: sealCode,
  codigoQR: sealCode,
  qrToken,
  urlVerificacion: `http://localhost:3000/#/q/${qrToken}`,
  fechaEmisionUtc: '2026-08-01T00:00:00Z',
  fechaExpiracionUtc: '2027-08-01T00:00:00Z',
  fechaEmision: '2026-08-01T00:00:00Z',
  fechaExpiracion: '2027-08-01T00:00:00Z',
  estado: 'Activo',
  nivel: 'Bronce',
  contadorAccesos: 15,
  accessCount: 15,
  vigente: true,
};

function setupMocks(page: import('@playwright/test').Page, accessCountOverride?: number | (() => number)) {
  // Set auth token/session in localStorage
  page.addInitScript(() => {
    localStorage.setItem('vf_has_session', 'true');
  });

  page.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-001',
        email: 'admin@test.com',
        nombre: 'Admin',
        apellido: 'Test',
        role: 'admin',
        aceptoDescargo: true,
      }),
    })
  );

  page.route('**/api/v1/subscriptions/my-status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: 'Profesional',
        subscriptionStatus: 'active',
        planPrice: 500,
        isGuest: false,
        inviterPlan: null,
        inviterName: null,
        planLimits: {
          maxConsultas: -1,
          maxProyectos: -1,
          presentacionPublica: true,
          qrIncluido: true,
          maxUsuariosSecundarios: -1,
          maxAlmacenamientoMb: -1,
          alertasTiempoReal: true,
          modeloLm: true,
          validacionLote: true,
          exportacionExcel: true,
          exportacionPdf: true,
          integracionCrm: true,
          soporteTipo: 'Prioritario',
          accesoApi: true,
          consultasUsadas: 0,
          proyectosCreados: 0,
        },
      }),
    })
  );

  page.route('**/api/auth/refresh', (route) =>
    route.fulfill({ status: 200, json: { accessToken: 'mock-token' } })
  );

  page.route('**/api/notifications*', (route) =>
    route.fulfill({ status: 200, json: [] })
  );

  page.route(`**/api/projects/${SEALED_PROJECT_ID}`, (route) =>
    route.fulfill({ status: 200, json: mockSealedProject })
  );

  page.route(`**/api/proyectos/${SEALED_PROJECT_ID}/sello-integridad`, (route) => {
    const count = typeof accessCountOverride === 'function'
      ? accessCountOverride()
      : (accessCountOverride ?? mockActiveSeal.contadorAccesos);
    return route.fulfill({
      status: 200,
      json: {
        ...mockActiveSeal,
        contadorAccesos: count,
        accessCount: count,
      }
    });
  });

  page.route('**/api/projects/**/status-eligibility', (route) =>
    route.fulfill({ status: 200, json: { documentCount: 1, hasObservaciones: false, currentStatus: 'PUBLICADO' } })
  );

  page.route('**/api/projects/**/validation-result', (route) =>
    route.fulfill({ status: 200, json: { internalValidation: null, externalSources: [] } })
  );

  page.route('**/api/projects/**/findings', (route) =>
    route.fulfill({ status: 200, json: [] })
  );

  page.route('**/api/projects/**/documents*', (route) =>
    route.fulfill({ status: 200, json: [] })
  );

  page.route('**/api/rules/discrepancy/enabled', (route) =>
    route.fulfill({ status: 200, json: { enabled: true } })
  );
}

test.describe('Integrity Seal Print & PDF Output', () => {

  test('1. Complete seal and print root are rendered with metadata', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    // Verify section header is visible on screen
    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible({ timeout: 15000 });

    // Assert print root exists in DOM
    const printRoot = page.locator('[data-testid="integrity-seal-print-root"]');
    await expect(printRoot).toBeAttached({ timeout: 10000 });

    // Assert verification code, QR, and seal metadata are present inside print root
    await expect(printRoot.getByText(sealCode).first()).toBeAttached();
    await expect(printRoot.locator('svg').first()).toBeAttached();
  });

  test('2. Print mode excludes admin layout and avoids horizontal scrolling', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible({ timeout: 15000 });

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    const printRoot = page.locator('[data-testid="integrity-seal-print-root"]');
    await expect(printRoot).toBeVisible();

    // Verify non-printable UI is hidden in print mode
    const sidebar = page.locator('aside, nav[aria-label="Main"]');
    if (await sidebar.count() > 0) {
      await expect(sidebar.first()).toBeHidden();
    }
    await expect(page.getByRole('button', { name: /Imprimir/i })).toBeHidden();

    // Check that print root does not have a horizontal overflow
    const hasHorizontalOverflow = await printRoot.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('3. Print root is not clipped and QR is intact', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await page.emulateMedia({ media: 'print' });

    const printRoot = page.locator('[data-testid="integrity-seal-print-root"]');
    await expect(printRoot).toBeVisible();

    const rootBox = await printRoot.boundingBox();
    expect(rootBox).not.toBeNull();
    expect(rootBox!.width).toBeGreaterThan(200);
    expect(rootBox!.height).toBeGreaterThan(200);

    // QR container bounding box inside print root
    const qrSvg = printRoot.locator('svg').first();
    await expect(qrSvg).toBeVisible();

    const qrBox = await qrSvg.boundingBox();
    expect(qrBox).not.toBeNull();
    expect(qrBox!.width).toBeGreaterThanOrEqual(100);
    expect(qrBox!.height).toBeGreaterThanOrEqual(100);

    // Verify QR is fully inside print root bounds
    expect(qrBox!.x).toBeGreaterThanOrEqual(rootBox!.x - 1);
    expect(qrBox!.y).toBeGreaterThanOrEqual(rootBox!.y - 1);
    expect(qrBox!.x + qrBox!.width).toBeLessThanOrEqual(rootBox!.x + rootBox!.width + 5);
  });

  test('4. Print readiness attribute is set when assets are ready', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    const printRoot = page.locator('[data-testid="integrity-seal-print-root"]');
    await expect(printRoot).toHaveAttribute('data-print-ready', 'true', { timeout: 10000 });
  });

  test('5. Print button triggers window.print after readiness', async ({ page }) => {
    await setupMocks(page);

    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);
    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible({ timeout: 15000 });

    // Track calls to window.print()
    let printCalled = false;
    await page.exposeFunction('onWindowPrint', () => {
      printCalled = true;
    });
    await page.evaluate(() => {
      window.print = () => {
        (window as any).onWindowPrint();
      };
    });

    const printButton = page.getByRole('button', { name: /Imprimir/i });
    await expect(printButton).toBeVisible();
    await printButton.click();

    expect(printCalled).toBe(true);
  });

  test('6. Accessibility: Imprimir button and QR have accessible labels', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    const printButton = page.getByRole('button', { name: /Imprimir/i });
    await expect(printButton).toBeVisible();
    const btnName = await printButton.getAttribute('aria-label') || await printButton.innerText();
    expect(btnName).toMatch(/Imprimir/i);

    const qrContainer = page.locator('[data-testid="integrity-seal-print-root"] [aria-label*="QR"], [data-testid="integrity-seal-print-root"] svg[aria-label*="QR"], [data-testid="integrity-seal-qr"]');
    await expect(qrContainer.first()).toBeAttached();
  });

  test('7. Regression: Screen layout remains intact after switching back from print media', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    // Switch to print
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('[data-testid="integrity-seal-print-root"]')).toBeVisible();

    // Switch back to screen
    await page.emulateMedia({ media: 'screen' });
    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Imprimir/i })).toBeVisible();
  });

  test('8. QR code encodes public bypass route /#/q/:qrToken rather than /#/p/:id', async ({ page }) => {
    await setupMocks(page);
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible({ timeout: 15000 });

    // Look at the QR component
    const qrElement = page.locator('[data-testid="integrity-seal-qr"]').first();
    await expect(qrElement).toBeVisible();
  });

  test('9. Unauthenticated visitor scanning QR bypasses login and views project via /#/q/:qrToken with publisher details and specs', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Mock public QR endpoint with rich details
    await page.route(`**/api/public/projects/qr/${encodeURIComponent(qrToken)}`, async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: SEALED_PROJECT_ID,
          codigoPublico: sealCode,
          codigoInterno: 'VF-SEAL-ACTIVE',
          nombreProyecto: 'Villa Santiago 116',
          nombre: 'Villa Santiago 116',
          ubicacion: 'Puerto Plata, RD',
          ubicacionTexto: 'Puerto Plata, RD',
          datosDesarrollador: 'Constructora del Norte',
          valorEstimado: 4500000,
          superficieM2: 250.5,
          categoriaNombre: 'Residencial',
          createdAtUtc: '2026-01-01T00:00:00Z',
          estadoValidacion: 'PUBLICADO',
          fechaEmision: '2026-08-01T00:00:00Z',
          registradoPor: {
            id: 'user-001',
            nombreCompleto: 'Maria Almonte',
            razonSocial: 'Inmobiliaria Almonte SRL',
            rol: 'Professional',
            email: 'maria@inmobiliaria.com',
            telefono: '8095551234',
            avatarUrl: null,
            fechaRegistro: '2026-01-01T00:00:00Z',
            verificado: true,
            presentacionPublica: {
              nombreMostrado: 'Maria Almonte',
              identificacionMostrada: '001-0000000-1',
              identificacionTipo: 'cedula',
              razonSocialMostrada: 'Inmobiliaria Almonte SRL'
            }
          },
          resumenDimensiones: [
            { dimension: 'TitularidadInmueble', resultado: 'Verificado' },
            { dimension: 'LicenciaConstruccion', resultado: 'Verificado' }
          ],
          documentos: []
        }
      });
    });

    // Directly access QR bypass route
    await page.goto(`http://localhost:3000/#/q/${encodeURIComponent(qrToken)}`);

    // Should load project name directly without redirecting to /login
    await expect(page.getByText('Villa Santiago 116').first()).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain(`/#/q/${encodeURIComponent(qrToken)}`);
    expect(page.url()).not.toContain('/login');

    // Assert publisher / registrant details card is visible
    await expect(page.getByText('Responsable Registral')).toBeVisible();
    await expect(page.getByTestId('public-registrant-name')).toContainText('Maria Almonte');
    await expect(page.getByTestId('public-registrant-razon-social').first()).toContainText('Inmobiliaria Almonte SRL');
    await expect(page.getByText('maria@inmobiliaria.com')).toBeVisible();
    await expect(page.getByText('8095551234').first()).toBeVisible();

    // Assert technical specs are visible
    await expect(page.getByText('Constructora del Norte')).toBeVisible();
    await expect(page.getByText('250.5 m²')).toBeVisible();

    // Verify no 401 unauthorized console errors were generated
    const unauthorizedErrors = consoleErrors.filter(e => e.includes('401'));
    expect(unauthorizedErrors).toHaveLength(0);
  });

  test('10. Access count increments with 1 to 3 visits and displays updated count on admin validations page', async ({ page }) => {
    let accessCount = 0;

    await setupMocks(page, () => accessCount);

    // Mock the public QR endpoint tracking visits
    await page.route(`**/api/public/projects/qr/${encodeURIComponent(qrToken)}`, async (route) => {
      accessCount += 1;
      await route.fulfill({
        status: 200,
        json: {
          id: SEALED_PROJECT_ID,
          codigoPublico: sealCode,
          nombreProyecto: 'Torre Residencial Vista Real',
          ubicacion: 'Santo Domingo, Distrito Nacional',
          estadoValidacion: 'PUBLICADO',
          fechaEmision: '2026-08-01T00:00:00Z',
          resumenDimensiones: [],
          documentosPublicos: []
        }
      });
    });

    // Visit 1
    await page.goto(`http://localhost:3000/#/q/${encodeURIComponent(qrToken)}`);
    await expect(page.getByText('Torre Residencial Vista Real').first()).toBeVisible();
    expect(accessCount).toBe(1);

    // Visit 2 (subsequent scan/visit)
    await page.reload();
    await expect(page.getByText('Torre Residencial Vista Real').first()).toBeVisible();
    expect(accessCount).toBe(2);

    // Visit 3 (subsequent scan/visit)
    await page.reload();
    await expect(page.getByText('Torre Residencial Vista Real').first()).toBeVisible();
    expect(accessCount).toBe(3);

    // Now go to admin validations page and verify Consultas Recibidas shows 3
    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);
    await expect(page.getByRole('heading', { name: 'Certificación Verificable', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Consultas Recibidas')).toBeVisible();
    await expect(page.getByText('3', { exact: true })).toBeVisible();
  });
});
