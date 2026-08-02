import { test, expect } from "@playwright/test";

test.describe("Checkout Flow — E2E con Mock", () => {
  async function setupMocks(page: import('@playwright/test').Page) {
    // Intercept /api/auth/me to automatically simulate authenticated state BEFORE webhook processing
    await page.route("**/api/auth/me", async (route) => {
      // Return inactive subscription first, then switch to active after polling
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          nombre: "Test",
          apellido: "User",
          role: "admin", aceptoDescargo: true,
          cedula: "",
          telefono: "",
          plan: null,
          subscriptionStatus: "inactive"
        })
      });
    });

    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "mock-token" })
      });
    });

    // Mock session-status to return 'complete' but user is initially 'inactive'
    await page.route("**/api/v1/subscriptions/session-status**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "complete",
          plan: "Profesional",
          customerEmail: "test@example.com"
        })
      });
    });

    // Mock my-status + sync so the polling loop resolves
    await page.route("**/api/v1/subscriptions/my-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          subscriptionStatus: "inactive",
          plan: null,
          isManagedByStripe: true
        })
      });
    });
    await page.route("**/api/v1/subscriptions/sync", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "ok" })
      });
    });
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to blank page first to ensure fresh page context
    await page.goto("about:blank");
    await setupMocks(page);
  });

  test("CHECKOUT RETURN — resolves correctly and redirects to dashboard with proper access", async ({ page }) => {
    // Debug: log all API requests to diagnose flakiness
    const apiCalls: { url: string; status?: number; error?: string }[] = [];
    page.on('request', req => {
      const url = req.url();
      if (url.includes('/api/')) apiCalls.push({ url, status: undefined });
    });
    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('/api/')) {
        const entry = apiCalls.find(r => r.url === url && r.status === undefined);
        if (entry) entry.status = resp.status();
      }
    });
    page.on('requestfailed', req => {
      const url = req.url();
      if (url.includes('/api/')) {
        const entry = apiCalls.find(r => r.url === url && r.status === undefined);
        if (entry) { entry.status = -1; entry.error = req.failure()?.errorText; }
      }
    });

    // Navigate to the checkout return page with session_id
    await page.goto("/#/checkout/return?session_id=cs_test_123");


    // We expect it to be loading (pending_confirmation) because auth/me returns inactive
    // Use toPass polling to handle Vite dev module loading + React lazy chunk latency
    await expect(async () => {
      await expect(page.getByText('Verificando estado del pago')).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 20000, intervals: [1000, 2000, 2000] }).catch(async () => {
      console.log('API CALLS (failing run):', JSON.stringify(apiCalls));
      throw new Error('Loading text never appeared');
    });

    // Now intercept /api/auth/me to simulate that the webhook HAS PROCESSED
    // Playwright route overrides the previous one; no need to unroute which can cause a race condition
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          nombre: "Test",
          apellido: "User",
          role: "admin", aceptoDescargo: true,
          cedula: "",
          telefono: "",
          plan: "Profesional",
          subscriptionStatus: "active"
        })
      });
    });

    // We expect it to redirect to the dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Verify toast or dashboard plan info
    await expect(page.getByText(/¡Bienvenido! Tu plan/i).or(page.getByRole('heading', { name: 'Dashboard' }).first())).toBeVisible();
  });

  test("SETTINGS — shows correct paid plan", async ({ page }) => {
    // Navigate straight to settings but mock the active subscription
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          nombre: "Test",
          apellido: "User",
          role: "admin", aceptoDescargo: true,
          cedula: "",
          telefono: "",
          plan: "Profesional",
          subscriptionStatus: "active"
        })
      });
    });

    await page.route("**/api/v1/subscriptions/my-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: "Profesional",
          planPrice: 60,
          subscriptionStatus: "active",
          currentPeriodEnd: "2026-12-31T23:59:59Z",
          stripeSubscriptionId: "sub_123456",
          isManagedByStripe: true
        })
      });
    });

    await page.goto("/#/admin/settings");
    await expect(page.getByRole('button', { name: /Suscripción/i })).toBeVisible();
    await page.getByRole('button', { name: /Suscripción/i }).click();

    await expect(page.getByText(/Profesional/i)).toBeVisible();
    await expect(page.getByText(/Activa/i)).toBeVisible();
  });
});
