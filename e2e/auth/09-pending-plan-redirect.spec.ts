import { test, expect } from '@playwright/test';

test.describe('09 - Pending Plan Redirect Fix', () => {
  test.use({ baseURL: process.env.FRONTEND_URL ?? 'http://localhost:3000' });

  async function setupAuth(page: import('@playwright/test').Page, overrides: Record<string, any> = {}) {
    const defaultUser = {
      id: 'e2e-pending-user',
      nombre: 'Pending',
      apellido: 'PlanUser',
      email: 'pending@test.com',
      role: 'DEVELOPER',
      subscriptionStatus: null,
      pendingPlanCode: 'profesional',
      pendingBillingCycle: 'monthly',
      aceptoDescargo: true,
      ...overrides,
    };
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultUser),
      });
    });
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
  }

  async function stubDashboardApis(page: import('@playwright/test').Page) {
    await page.route('**/api/notifications*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/projects*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/dashboard/stats*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });
  }

  test('User with pendingPlanCode logs in → lands on dashboard (NOT checkout)', async ({ page }) => {
    const defaultUser = {
      id: 'e2e-pending-user',
      nombre: 'Pending',
      apellido: 'PlanUser',
      email: 'pending@test.com',
      role: 'DEVELOPER',
      subscriptionStatus: null,
      pendingPlanCode: 'profesional',
      pendingBillingCycle: 'monthly',
    };

    // 1. Start unauthenticated
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({ status: 401 });
    });

    await stubDashboardApis(page);

    // 2. Go to login page
    await page.goto('/#/login');
    await expect(page.locator('h3:has-text("Iniciar Sesión")')).toBeVisible();

    // 3. Mock login endpoints
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: defaultUser, accessToken: 'mock-token' }),
      });
    });
    
    // Override the 401 route with a 200 route for subsequent calls
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultUser),
      });
    });

    // 4. Fill form and submit
    await page.fill('input[type="email"]', 'pending@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for the page to settle on dashboard
    await page.waitForTimeout(1000);

    // Verify we are NOT redirected to checkout
    expect(page.url()).not.toContain('/checkout');
    // Verify we are on dashboard
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('Dashboard shows PendingPlanBanner for user with pendingPlanCode', async ({ page }) => {
    await setupAuth(page);
    await stubDashboardApis(page);

    await page.goto('/#/admin/dashboard');
    await page.waitForTimeout(1000);

    // The banner should be visible (role="status")
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Suscripción pendiente');
    await expect(banner).toContainText('profesional');
  });

  test('PendingPlanBanner link points to /checkout with plan and billing params', async ({ page }) => {
    await setupAuth(page);
    await stubDashboardApis(page);

    await page.goto('/#/admin/dashboard');
    await page.waitForTimeout(1000);

    const link = page.locator('[role="status"] a[href*="/checkout"]');
    await expect(link).toBeVisible();
    // Verify the link includes both plan and billing params
    const href = await link.getAttribute('href');
    expect(href).toContain('plan=profesional');
    expect(href).toContain('billing=monthly');
  });

  test('User with active subscription does NOT see PendingPlanBanner', async ({ page }) => {
    // Active subscription, no pendingPlanCode
    await setupAuth(page, {
      subscriptionStatus: 'active',
      pendingPlanCode: null,
      pendingBillingCycle: null,
    });
    await stubDashboardApis(page);

    await page.goto('/#/admin/dashboard');
    await page.waitForTimeout(1000);

    // Banner should not exist
    await expect(page.locator('[role="status"]')).not.toBeVisible();
  });

  test('Banner can be dismissed and stays hidden on reload', async ({ page }) => {
    await setupAuth(page);
    await stubDashboardApis(page);

    // First visit: banner is visible
    await page.goto('/#/admin/dashboard');
    await page.waitForTimeout(500);
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();

    // Dismiss the banner
    const dismissBtn = page.locator('[role="status"] button[aria-label="Descartar"]');
    await dismissBtn.click();
    await expect(banner).not.toBeVisible();

    // Reload — banner should stay hidden (dismissed in localStorage)
    await page.reload();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="status"]')).not.toBeVisible();
  });
});
