import { test, expect } from "@playwright/test";

test.describe("Checkout Flow — E2E con Mock", () => {
  test.beforeEach(async ({ page }) => {
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
          role: "admin",
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
    await page.route("**/api/v1/subscriptions/session-status?sessionId=*", async (route) => {
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
  });

  test("CHECKOUT RETURN — resolves correctly and redirects to dashboard with proper access", async ({ page }) => {
    // Navigate to the checkout return page with session_id
    await page.goto("/#/checkout/return?session_id=cs_test_123");

    // We expect it to be loading (pending_confirmation) because auth/me returns inactive
    await expect(page.getByText(/Verificando estado del pago/i)).toBeVisible();

    // Now intercept /api/auth/me to simulate that the webhook HAS PROCESSED
    await page.unroute("**/api/auth/me");
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          nombre: "Test",
          apellido: "User",
          role: "admin",
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
    await page.unroute("**/api/auth/me");
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "test@example.com",
          nombre: "Test",
          apellido: "User",
          role: "admin",
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
          planPrice: 3500,
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
