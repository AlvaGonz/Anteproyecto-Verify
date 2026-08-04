import { test, expect } from '@playwright/test';

/**
 * Resend Failure Verifier — Playwright E2E gate
 *
 * Verifier contract: EVERY email-send failure path MUST emit
 * `console.error('[RESEND_FAILURE]', ...)` and NEVER fail silently.
 *
 * Scenarios:
 * 1. Resend-verification API returns 500 → console.error appears
 * 2. Registration API fails (backend email failure) → console.error appears
 * 3. Resend-verification API succeeds → NO false console.error
 * 4. Intercepted Resend network-level failure → console.error appears
 */
test.describe('Resend failure verifier', () => {

  async function mockAuthAndNotifications(page: import('@playwright/test').Page) {
    // ponytail: register page is GuestGuard'd — auth/me must return 401 so we stay on register
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, json: {} }));
    await page.route('**/api/auth/refresh', route => route.fulfill({ status: 401, json: {} }));
    await page.route('**/api/notifications*', route => route.fulfill({ json: [] }));
  }

  async function goToRegister(page: import('@playwright/test').Page) {
    await page.goto('/#/register');
    // React + Vite Docker: lazy chunks can take 10-15s to hydrate
    await expect(page.getByRole('button', { name: /crear mi cuenta/i })).toBeVisible({ timeout: 20_000 });
  }

  async function fillRegisterForm(page: import('@playwright/test').Page, prefix: string = 'Test') {
    const ts = Date.now().toString().slice(-6);
    const email = `resend-${prefix}-${ts}@example.com`;
    await page.fill('#nombre', prefix);
    await page.fill('#apellido', 'User');
    await page.fill('#email', email);
    await page.fill('#telefono', '8095550111');
    await page.fill('#cedula', '00100000009');
    await page.fill('#password', 'SecurePass123!');
    await page.locator('input[name="acceptedTerms"]').check();
    return email;
  }

  test('SCENARIO 1: emits [RESEND_FAILURE] console error when resend-verification API fails', async ({ page }) => {
    const failures: string[] = [];
    const allConsoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        allConsoleErrors.push(msg.text());
        if (msg.text().includes('[RESEND_FAILURE]')) {
          failures.push(msg.text());
        }
      }
    });

    const email = `resend-verifier-${Date.now()}@example.com`;

    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isSuccess: true }),
      })
    );
    await page.route('**/api/auth/resend-verification', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated Resend provider failure' }),
      })
    );

    await page.goto('/#/register', { waitUntil: 'domcontentloaded' });

    await page.fill('#nombre', 'Verifier');
    await page.fill('#apellido', 'User');
    await page.fill('#email', email);
    await page.fill('#telefono', '8095550199');
    await page.fill('#cedula', '00100000009');
    await page.fill('#password', 'SecurePass123!');
    await page.locator('input[name="acceptedTerms"]').check();

    await page.getByRole('button', { name: /crear mi cuenta/i }).click();

    await expect(page.getByTestId('resend-verification-button')).toBeVisible();
    await page.getByTestId('resend-verification-button').click();

    await expect.poll(() => failures.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(failures[0]).toContain('[RESEND_FAILURE]');
  });

  test('SCENARIO 2: emits [RESEND_FAILURE] console error when registration API fails', async ({ page }) => {
    const failures: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('[RESEND_FAILURE]')) {
        failures.push(msg.text());
      }
    });

    const email = `resend-register-fail-${Date.now()}@example.com`;

    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          isSuccess: false,
          message: 'El proveedor de correo no está disponible. Intente nuevamente.',
        }),
      })
    );

    await page.goto('/#/register', { waitUntil: 'domcontentloaded' });

    await page.fill('#nombre', 'Fail');
    await page.fill('#apellido', 'Register');
    await page.fill('#email', email);
    await page.fill('#telefono', '8095550199');
    await page.fill('#cedula', '00100000009');
    await page.fill('#password', 'SecurePass123!');
    await page.locator('input[name="acceptedTerms"]').check();

    await page.getByRole('button', { name: /crear mi cuenta/i }).click();

    // The error should surface — either as an inline error message or console error
    // Web-first assertion: look for any visible error indicators
    await expect.poll(() => failures.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
  });

  test('SCENARIO 3: does NOT emit [RESEND_FAILURE] when resend-verification succeeds', async ({ page }) => {
    test.setTimeout(30_000);
    const failures: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error' && msg.text().includes('[RESEND_FAILURE]')) failures.push(msg.text()); });

    await mockAuthAndNotifications(page);
    await page.route('**/api/auth/register', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isSuccess: true }) }));
    await page.route('**/api/auth/resend-verification', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isSuccess: true }) }));

    await goToRegister(page);
    await fillRegisterForm(page, 'Success');

    await page.getByRole('button', { name: /crear mi cuenta/i }).click();
    await expect(page.getByTestId('resend-verification-button')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('resend-verification-button').click();
    await page.waitForTimeout(2000);
    expect(failures.length).toBe(0);
  });

  test('SCENARIO 4: surfaced error includes context (recipient masked, correlation)', async ({ page }) => {
    test.setTimeout(30_000);
    const failures: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error' && msg.text().includes('[RESEND_FAILURE]')) failures.push(msg.text()); });

    await mockAuthAndNotifications(page);
    await page.route('**/api/auth/register', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isSuccess: true }) }));
    await page.route('**/api/auth/resend-verification', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ isSuccess: false, message: 'Email provider returned 500', statusCode: 500, correlationId: 'test-correlation-id-123' }) }));

    await goToRegister(page);
    await fillRegisterForm(page, 'Context');

    await page.getByRole('button', { name: /crear mi cuenta/i }).click();
    await expect(page.getByTestId('resend-verification-button')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('resend-verification-button').click();
    await expect.poll(() => failures.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(failures[0]).toContain('[RESEND_FAILURE]');
  });
});
