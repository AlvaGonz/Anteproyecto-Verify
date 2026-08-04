import { test, expect } from '@playwright/test';

const PUBLISHED_PROJECT_ID = 'proj-seal-published-001';
const DRAFT_PROJECT_ID = 'proj-seal-draft-001';
const SEALED_PROJECT_ID = 'proj-seal-active-001';

const sealCode = 'VERIFINCA-20260801-A1B2C3D4';
const qrToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwcm9qLXNlYWwtcHVibGlzaGVkLTAwMSIsInNlYWxJZCI6MSwiaWF0IjoxNzU2MDAwMDAwfQ.mock-signature';

const mockPublishedProject = {
  id: PUBLISHED_PROJECT_ID,
  codigoInterno: 'VF-SEAL-001',
  nombre: 'Proyecto Publicado con Sello',
  ubicacionTexto: 'Santo Domingo',
  categoriaId: 16,
  estadoProyecto: 'PUBLICADO',
  estadoIntegridad: 2,
  usuarioCreadorId: 'user-001',
  createdAtUtc: '2026-01-01T00:00:00Z',
};

const mockDraftProject = {
  id: DRAFT_PROJECT_ID,
  codigoInterno: 'VF-SEAL-DRAFT',
  nombre: 'Proyecto Borrador',
  ubicacionTexto: 'Santiago',
  categoriaId: 16,
  estadoProyecto: 'CREADO',
  estadoIntegridad: 0,
  usuarioCreadorId: 'user-001',
  createdAtUtc: '2026-01-01T00:00:00Z',
};

const mockSealedProject = {
  id: SEALED_PROJECT_ID,
  codigoInterno: 'VF-SEAL-ACTIVE',
  nombre: 'Proyecto con Sello Activo',
  ubicacionTexto: 'La Romana',
  categoriaId: 16,
  estadoProyecto: 'PUBLICADO',
  estadoIntegridad: 2,
  usuarioCreadorId: 'user-001',
  createdAtUtc: '2026-01-01T00:00:00Z',
};

const mockActiveSeal = {
  idSello: 1,
  idProyecto: SEALED_PROJECT_ID,
  codigoQR: sealCode,
  qrToken,
  urlVerificacion: `http://localhost:3000/#/q/${qrToken}`,
  fechaEmision: '2026-08-01T00:00:00Z',
  fechaExpiracion: '2027-08-01T00:00:00Z',
  estado: 'Activo',
  nivel: 'Bronce',
  accessCount: 5,
};

const mockNoSeal = null;

const mockPublicProjectResponse = {
  nombre: 'Proyecto Publicado con Sello',
  ubicacion: 'Santo Domingo',
  codigoPublico: 'VF-SEAL-001',
  estadoIntegridad: 2,
  codigoSello: sealCode,
};

type AuthOverrides = Partial<{
  plan: string;
  subscriptionStatus: string;
}>;

function stubAuthMe(page: import('@playwright/test').Page, overrides?: AuthOverrides) {
  return page.route('**/api/auth/me', (route) =>
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
        cedula: '',
        telefono: '',
        plan: overrides?.plan ?? 'Profesional',
        subscriptionStatus: overrides?.subscriptionStatus ?? 'active',
      }),
    })
  );
}

function stubSubscription(page: import('@playwright/test').Page, overrides?: { subscriptionStatus?: string; qrIncluido?: boolean }) {
  return page.route('**/api/v1/subscriptions/my-status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: 'Profesional',
        subscriptionStatus: overrides?.subscriptionStatus ?? 'active',
        planPrice: 500,
        isGuest: false,
        inviterPlan: null,
        inviterName: null,
        planLimits: {
          maxConsultas: -1,
          maxProyectos: -1,
          presentacionPublica: true,
          qrIncluido: overrides?.qrIncluido ?? true,
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
}

function stubCommonMocks(page: import('@playwright/test').Page, overrides?: AuthOverrides) {
  stubAuthMe(page, overrides);
  stubSubscription(page);
  page.route('**/api/auth/refresh', (route) =>
    route.fulfill({ status: 200, json: { accessToken: 'mock-token' } })
  );
  page.route('**/api/notifications*', (route) =>
    route.fulfill({ status: 200, json: [] })
  );
  page.route('**/api/admin/dashboard/**', (route) =>
    route.fulfill({ status: 200, json: { totalProjects: 0, totalValidations: 0, totalFindings: 0 } })
  );
  page.route('**/api/projects/estados', (route) =>
    route.fulfill({
      status: 200,
      json: [
        { id: '44DA5231-5609-463F-AD8B-22D1C5D403E9', codigoUnico: 'CREADO', nombre: 'Creado', colorHex: '#9BACD8', activo: true },
        { id: 'C372493C-F48F-4662-BEBD-377F11F18CC5', codigoUnico: 'PUBLICADO', nombre: 'Publicado', colorHex: '#10B981', activo: true },
      ],
    })
  );
  page.route('**/api/projects/categories', (route) =>
    route.fulfill({ status: 200, json: [{ id: 16, nombre: 'VIVIENDAS' }] })
  );
  page.route('**/api/auth/logout', (route) =>
    route.fulfill({ status: 200, json: {} })
  );
  page.route('**/api/projects/**/status-eligibility', (route) =>
    route.fulfill({ status: 200, json: { documentCount: 0, hasObservaciones: false, currentStatus: 'PUBLICADO' } })
  );
  page.route('**/api/projects/**/validation-result', (route) =>
    route.fulfill({ status: 200, json: { internalValidation: null, externalSources: [] } })
  );
  page.route('**/api/projects/**/findings', (route) =>
    route.fulfill({ status: 200, json: [] })
  );
  page.route('**/api/projects/**/audit', (route) =>
    route.fulfill({ status: 200, json: [] })
  );
  page.route('**/api/projects/**/documents*', (route) =>
    route.fulfill({ status: 200, json: [] })
  );
  return page.route('**/api/auth/refresh', (route) =>
    route.fulfill({ status: 200, json: { accessToken: 'mock-token' } })
  );
}

// ────────────────────────────────────────────────────────────
// Scenario A: Admin sees seal controls only for published projects
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Admin visibility', () => {

  test('shows seal section for published project', async ({ page }) => {
    await stubCommonMocks(page);
    await stubSubscription(page, { qrIncluido: true });

    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockPublishedProject })
    );
    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}/seal`, (route) =>
      route.fulfill({ status: 200, json: mockNoSeal })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${PUBLISHED_PROJECT_ID}/validations`);

    await expect(
      page.getByText(/Certificación Verificable/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('does NOT show seal section for draft project', async ({ page }) => {
    await stubCommonMocks(page);

    await page.route(`**/api/projects/${DRAFT_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockDraftProject })
    );
    await page.route(`**/api/projects/${DRAFT_PROJECT_ID}/seal`, (route) =>
      route.fulfill({ status: 200, json: mockNoSeal })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${DRAFT_PROJECT_ID}/validations`);

    await expect(
      page.getByText(/Certificación Verificable/i)
    ).not.toBeVisible({ timeout: 8000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario B: Admin can generate/enable the seal
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Admin issuance', () => {

  test('can issue seal for published project', async ({ page }) => {
    await stubCommonMocks(page);
    await stubSubscription(page, { qrIncluido: true });

    let sealIssued = false;

    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockPublishedProject })
    );
    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}/seal`, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, json: sealIssued ? mockActiveSeal : mockNoSeal });
      }
      if (route.request().method() === 'POST') {
        sealIssued = true;
        return route.fulfill({ status: 200, json: mockActiveSeal });
      }
      return route.fulfill({ status: 405 });
    });

    await page.goto(`http://localhost:3000/#/admin/projects/${PUBLISHED_PROJECT_ID}/validations`);

    await page.getByText(/Certificación Verificable/i).waitFor({ timeout: 15000 });

    await page.evaluate(() => { window.confirm = () => true; });

    await page.getByRole('button', { name: /Emitir Certificaci/i }).click();

    await expect(
      page.getByText(/VERIFINCA-/).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows seal details when seal exists', async ({ page }) => {
    await stubCommonMocks(page);

    await page.route(`**/api/projects/${SEALED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockSealedProject })
    );
    await page.route(`**/api/projects/${SEALED_PROJECT_ID}/seal`, (route) =>
      route.fulfill({ status: 200, json: mockActiveSeal })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await expect(page.getByText(/Certificación Verificable/i)).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(sealCode).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Activo/).first()).toBeVisible({ timeout: 8000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario C: QR export/download is available
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > QR export', () => {

  test('shows export/download button when seal is active', async ({ page }) => {
    await stubCommonMocks(page);

    await page.route(`**/api/projects/${SEALED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockSealedProject })
    );
    await page.route(`**/api/projects/${SEALED_PROJECT_ID}/seal`, (route) =>
      route.fulfill({ status: 200, json: mockActiveSeal })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await expect(page.getByText(/Certificación Verificable/i)).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('button', { name: 'Descargar QR' })
    ).toBeVisible({ timeout: 8000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario D: QR access route opens public project details without registration
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > QR public access bypass', () => {

  test('QR access route shows public project without auth', async ({ page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401 })
    );

    await page.route('**/api/public/projects/qr/**', (route) =>
      route.fulfill({ status: 200, json: mockPublicProjectResponse })
    );

    await page.goto(`http://localhost:3000/#/q/${qrToken}`);

    await expect(page.getByText(/Proyecto Publicado con Sello/i)).toBeVisible({ timeout: 15000 });
  });

  test('QR access shows seal verification details', async ({ page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401 })
    );

    await page.route('**/api/public/projects/qr/**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          ...mockPublicProjectResponse,
          estadoSello: 'Activo',
          fechaEmision: '2026-08-01T00:00:00Z',
        },
      })
    );

    await page.goto(`http://localhost:3000/#/q/${qrToken}`);

    await expect(page.getByText(/VERIFINCA-/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Sello de Integridad/i })).toBeVisible({ timeout: 10000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario E: Normal public access still follows registration rule
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Normal public access unchanged', () => {

  test('normal public project route requires auth', async ({ page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401 })
    );

    await page.goto(`http://localhost:3000/#/p/${PUBLISHED_PROJECT_ID}`);

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario F: Revoked seal blocks access
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Revocation', () => {

  test('revoked seal returns not found or revoked status', async ({ page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401 })
    );

    await page.route('**/api/public/projects/qr/**', (route) =>
      route.fulfill({
        status: 404,
        json: { mensaje: 'Sello revocado o inválido.' },
      })
    );

    await page.goto(`http://localhost:3000/#/q/${qrToken}`);

    await expect(page.getByText(/revocado|inválido|no encontrado/i)).toBeVisible({ timeout: 15000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario G: Deleted project blocks seal access
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Deleted project', () => {

  test('deleted project returns not found on QR access', async ({ page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401 })
    );

    await page.route('**/api/public/projects/qr/**', (route) =>
      route.fulfill({
        status: 404,
        json: { mensaje: 'Proyecto no encontrado o token inválido.' },
      })
    );

    await page.goto(`http://localhost:3000/#/q/deleted-token-xxx`);

    await expect(page.getByText(/no encontrado|inválido/i)).toBeVisible({ timeout: 15000 });
  });
});

// ────────────────────────────────────────────────────────────
// Scenario H: Expired/Unpaid subscription blocks seal issuance
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Subscription enforcement', () => {

  test('blocks seal issuance when subscription is expired', async ({ page }) => {
    await stubCommonMocks(page, { subscriptionStatus: 'past_due' });
    await stubSubscription(page, { subscriptionStatus: 'past_due', qrIncluido: false });

    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockPublishedProject })
    );
    await page.route(`**/api/projects/${PUBLISHED_PROJECT_ID}/seal`, (route) =>
      route.fulfill({ status: 200, json: mockNoSeal })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${PUBLISHED_PROJECT_ID}/validations`);

    await expect(page.getByText(/plan actual no incluye/i)).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /Emitir Certificaci/i })).not.toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────
// Scenario I: Access count increments on QR use
// ────────────────────────────────────────────────────────────
test.describe('Seal Integrity > Access counting', () => {

  test('shows access count on admin seal panel', async ({ page }) => {
    await stubCommonMocks(page);

    await page.route(`**/api/projects/${SEALED_PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: mockSealedProject })
    );
    await page.route(`**/api/projects/${SEALED_PROJECT_ID}/seal`, (route) =>
      route.fulfill({
        status: 200,
        json: { ...mockActiveSeal, accessCount: 42 },
      })
    );

    await page.goto(`http://localhost:3000/#/admin/projects/${SEALED_PROJECT_ID}/validations`);

    await expect(page.getByText(/Certificación Verificable/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/42/)).toBeVisible({ timeout: 8000 });
  });
});
