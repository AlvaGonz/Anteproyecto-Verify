import { test, expect } from '@playwright/test';

/**
 * Resend failure verifier
 *
 * Proves the gap: when the resend-verification email request fails (non-2xx,
 * network error, timeout), the frontend currently swallows it silently — no
 * console.error surfaces the failure. The verifier contract: every email-send
 * failure path emits `console.error('[RESEND_FAILURE]', ...)`.
 *
 * The registration POST is intercepted with a 200 so the test reaches the
 * "Revisa tu correo" screen without depending on the backend; the
 * resend-verification POST is intercepted with 500 to simulate a Resend
 * provider failure.
 */
test.describe('Resend failure verifier', () => {
  test('emits [RESEND_FAILURE] console error when resend-verification fails', async ({ page }) => {
    const failures: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('[RESEND_FAILURE]')) {
        failures.push(msg.text());
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

    // Web-first: poll for the success screen, then trigger the resend
    await expect(page.getByTestId('resend-verification-button')).toBeVisible();
    await page.getByTestId('resend-verification-button').click();

    // Web-first assertion: the verifier must surface the failure in the console
    await expect.poll(() => failures.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(failures[0]).toContain('[RESEND_FAILURE]');
  });
});
