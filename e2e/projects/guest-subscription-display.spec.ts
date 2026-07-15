import { test, expect } from '@playwright/test';

// Helper: intercept all SettingsPage API calls with sensible defaults
async function stubSettingsApis(page: import('@playwright/test').Page, overrides?: {
  auth?: Record<string, unknown>;
  subscription?: Record<string, unknown>;
}) {
  await page.route('**/api/auth/me', route =>
    route.fulfill({ json: {
      id: 'guest-001',
      nombre: 'Invitado',
      apellido: 'Test',
      email: 'invitado@test.com',
      role: 'user',
      plan: null,
      invitedByPlan: 'Corporativo',
      inviterPlan: 'Corporativo',
      isGuest: true,
      ...overrides?.auth,
    }})
  );
  await page.route('**/api/v1/subscriptions/my-status', route =>
    route.fulfill({ json: {
      subscriptionStatus: null,
      plan: null,
      isGuest: true,
      inviterPlan: 'Corporativo',
      ...overrides?.subscription,
    }})
  );
  // ponytail: prevent 401 cascade — if any unmocked call hits the real backend,
  // the axios interceptor tries refresh then logout, kicking us to /login
  await page.route('**/api/auth/refresh', route =>
    route.fulfill({ json: { accessToken: 'mock-e2e-token' }})
  );
  await page.route('**/api/auth/logout', route => route.fulfill({ json: {} }));
  // SettingsPage calls these for non-admin users — return empty arrays
  await page.route('**/api/admin/users**', route => route.fulfill({ json: { items: [], totalCount: 0, page: 1, pageSize: 50 } }));
  await page.route('**/api/admin/profiles**', route => route.fulfill({ json: [] }));
  await page.route('**/api/admin/plans**', route => route.fulfill({ json: [] }));
}

// ponytail: navigate to settings and click subscription tab
async function goToSubscriptionTab(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:3000/#/admin/settings', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /suscripci/i }).click();
}

// ── Scenario A: Guest user sees inviter's plan badge + plan card ─────────────
test.describe('Settings > Subscription tab > Guest user', () => {

  test.beforeEach(async ({ page }) => {
    await stubSettingsApis(page);
    await goToSubscriptionTab(page);
  });

  test('shows "Invitado" badge in subscription plan card', async ({ page }) => {
    await expect(
      page.locator('.guest-plan-badge')
    ).toBeVisible();
    await expect(
      page.locator('.guest-plan-badge')
    ).toContainText(/invitado/i);
  });

  test('shows inviter plan name (Corporativo) in the plan card', async ({ page }) => {
    await expect(
      page.locator('[data-testid="subscription-plan-card"]')
    ).toContainText(/Corporativo/i);
  });

  test('shows inviter plan price ($500 USD / mes) in the plan card', async ({ page }) => {
    await expect(
      page.locator('[data-testid="subscription-plan-card"]')
    ).toContainText(/\$500/);
  });

  test('shows Award icon in sidebar plan badge for guest user', async ({ page }) => {
    // ponytail: two sidebars exist (mobile hidden, desktop visible) — pick the visible one
    const badge = page.locator('[data-testid="sidebar-plan-badge"]').last();
    await expect(badge).toBeVisible();
    await expect(
      badge.locator('[data-testid="plan-name"]')
    ).toContainText(/Corporativo/i);
  });

  test('does NOT show "Cancelar Suscripcion" or "Modificar Suscripcion" for guests', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /cancelar suscripci/i })
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /modificar suscripci/i })
    ).not.toBeVisible();
  });
});

// ── Scenario B: Owner user still sees own plan correctly ────────────────────
test.describe('Settings > Subscription tab > Owner user', () => {

  test.beforeEach(async ({ page }) => {
    await stubSettingsApis(page, {
      auth: {
        id: 'owner-001',
        role: 'owner',
        plan: 'Corporativo',
        isGuest: false,
      },
      subscription: {
        subscriptionStatus: 'active',
        plan: 'Corporativo',
        billingCycle: 'month',
        planPrice: 500,
        isGuest: false,
        isManagedByStripe: true,
        currentPeriodEnd: new Date(Date.now() + 20 * 864e5).toISOString(),
      },
    });

    await goToSubscriptionTab(page);
  });

  test('owner sees own plan Corporativo without guest badge', async ({ page }) => {
    await expect(
      page.locator('[data-testid="subscription-plan-card"]')
    ).toContainText(/Corporativo/i);
    await expect(
      page.locator('.guest-plan-badge')
    ).not.toBeVisible();
  });
});
