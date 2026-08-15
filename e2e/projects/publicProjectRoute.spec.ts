import { test, expect } from '@playwright/test';

const TEST_PROJECT_ID = 'f5097b4f-d5de-6e91-0742-06e247aa2dba';
const VALID_QR_TOKEN = 'valid-seal-token';
const INVALID_QR_TOKEN = 'invalid-seal-token';

const mockProjectData = {
  id: TEST_PROJECT_ID,
  codigoInterno: 'PRJ-TEST',
  nombre: 'Test Project Content',
  ubicacionTexto: 'Santo Domingo',
  estadoProyecto: 'CREADO',
  usuarioCreadorId: 'some-user-id',
  imagenUrl: null
};

test.describe('Public Project Route (/p/:id) Authorization Gate', () => {

  test('holds project request pending until auth resolves, then renders project without flash', async ({ page }) => {
    let projectRequestMade = false;
    let authResolved = false;

    // Spy on the project request to ensure it only happens AFTER auth is resolved
    await page.route(`**/api/projects/${TEST_PROJECT_ID}`, async route => {
      projectRequestMade = true;
      expect(authResolved).toBe(true); // Must not be called before auth resolves
      await route.fulfill({ json: mockProjectData });
    });

    // Mock auth/me to be pending, giving us time to inspect the UI
    let resolveAuth: (value: any) => void;
    const authPromise = new Promise(res => { resolveAuth = res; });

    // The frontend tries to refresh the token on startup
    await page.route('**/api/auth/refresh', async route => {
      await authPromise;
      await route.fulfill({ status: 401 }); // Unauthenticated
    });

    await page.route('**/api/auth/me', async route => {
      await authPromise;
      await route.fulfill({ status: 401 }); // Unauthenticated
    });

    // Navigate to the public project page
    await page.goto(`/#/p/${TEST_PROJECT_ID}`);

    // While auth is pending, we should see the neutral loading UI
    await expect(page.locator('text=Verificando acceso...')).toBeVisible({ timeout: 15000 });

    // The project data fetch should NOT have happened yet
    expect(projectRequestMade).toBe(false);

    // No project content should be visible
    await expect(page.locator('text=Test Project Content')).toBeHidden();

    // Now resolve the auth request
    authResolved = true;
    resolveAuth!({});

    // After auth resolves, the project data fetch should happen, and the project content should appear
    await expect(page.locator('text=Test Project Content')).toBeVisible();
    expect(projectRequestMade).toBe(true);
  });

  test('handles QR routes with valid token, bypassing private project request entirely', async ({ page }) => {
    let privateProjectRequestMade = false;

    // Private project request should NOT be called during QR flow
    await page.route(`**/api/projects/*`, async route => {
      privateProjectRequestMade = true;
      await route.continue();
    });

    // Mock QR validation to succeed
    let resolveQr: (value: any) => void;
    const qrPromise = new Promise(res => { resolveQr = res; });

    await page.route(`**/api/public/projects/qr/${VALID_QR_TOKEN}`, async route => {
      await qrPromise;
      await route.fulfill({ json: mockProjectData });
    });

    // Navigate to the QR seal route
    await page.goto(`/#/q/${VALID_QR_TOKEN}`);

    // Wait for initial loading
    await expect(page.locator('text=Verificando acceso...')).toBeVisible({ timeout: 15000 });

    // Resolve QR validation
    resolveQr!({});

    // Project should render
    await expect(page.locator('text=Test Project Content')).toBeVisible();

    // Ensure the private endpoint was never called
    expect(privateProjectRequestMade).toBe(false);
  });

  test('handles QR routes with invalid token, denying access without rendering project data', async ({ page }) => {
    // Mock QR validation to fail (e.g. 404 Not Found for invalid token)
    let resolveQr: (value: any) => void;
    const qrPromise = new Promise(res => { resolveQr = res; });

    await page.route(`**/api/public/projects/qr/${INVALID_QR_TOKEN}`, async route => {
      await qrPromise;
      await route.fulfill({ status: 404, json: { message: "Not found" } });
    });

    await page.goto(`/#/q/${INVALID_QR_TOKEN}`);

    // Wait for initial loading
    await expect(page.locator('text=Verificando acceso...')).toBeVisible({ timeout: 15000 });

    // Resolve QR validation
    resolveQr!({});

    // Should render the denied state, NOT the project data
    await expect(page.locator('text=Test Project Content')).toBeHidden();
    await expect(page.locator('text=Error de Acceso')).toBeVisible();
    await expect(page.locator('text=El activo solicitado no se encuentra')).toBeVisible();
  });
});
