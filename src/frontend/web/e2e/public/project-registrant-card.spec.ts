import { test, expect } from '@playwright/test';

const MOCK_PROJECT_SLUG = 'test-project-001';

const mockProject = {
  id: MOCK_PROJECT_SLUG,
  nombre: 'Grupo Turístico del Este',
  clasificacion: 'TURÍSTICO',
  valorRegistral: 'SUJETO A TASACIÓN',
  cronologia: 'JULIO DE 2026',
  puntajeIntegridad: 45,
  registradoPor: {
    id: 'user-001',
    nombre: 'Carlos',
    apellido: 'Martínez',
    empresa: 'Grupo Turístico del Este',
    telefono: '+1 809-555-0100',
    email: 'carlos@grupoturístico.com',
    avatarUrl: null,
    verificado: true,
    rol: 'Desarrollador Registrado',
    miembroDesde: '2024-01-15T00:00:00Z',
  },
};

test.describe('Project Public Page > Registrant Info Card', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/projects/public/${MOCK_PROJECT_SLUG}`, route =>
      route.fulfill({ json: mockProject })
    );
    await page.goto(`http://localhost:3000/#/p/${MOCK_PROJECT_SLUG}`);
  });

  // ── Card existence ────────────────────────────────────────────────────────
  test('renders the registrant card section', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-card"]')
    ).toBeVisible();
  });

  // ── Registrant name ───────────────────────────────────────────────────────
  test('shows full name of registrant', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-name"]')
    ).toContainText('Carlos Martínez');
  });

  // ── Company ───────────────────────────────────────────────────────────────
  test('shows registrant company name', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-company"]')
    ).toContainText('Grupo Turístico del Este');
  });

  // ── Role / type ───────────────────────────────────────────────────────────
  test('shows registrant role label', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-role"]')
    ).toContainText('Desarrollador Registrado');
  });

  // ── Verified badge ────────────────────────────────────────────────────────
  test('shows verified badge when registrant is verified', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-verified-badge"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="registrant-verified-badge"]')
    ).toContainText(/verificado/i);
  });

  // ── Contact: phone ────────────────────────────────────────────────────────
  test('shows registrant phone number', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-phone"]')
    ).toContainText('809-555-0100');
  });

  // ── Contact: email ────────────────────────────────────────────────────────
  test('shows registrant email', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-email"]')
    ).toContainText('carlos@grupoturístico.com');
  });

  // ── Member since ──────────────────────────────────────────────────────────
  test('shows member since date', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-since"]')
    ).toBeVisible();
  });

  // ── Avatar fallback (no avatarUrl) ────────────────────────────────────────
  test('shows initials avatar when no avatarUrl', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-avatar"]')
    ).toBeVisible();
    // Should show "CM" (initials) or a fallback icon
    const avatarText = await page
      .locator('[data-testid="registrant-avatar"]')
      .textContent();
    expect(avatarText?.trim()).toMatch(/^[A-Z]{1,2}$/);
  });

  // ── CTA: contact button ───────────────────────────────────────────────────
  test('renders contact button for registrant', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /contactar/i })
    ).toBeVisible();
  });

  // ── Privacy: email NOT visible to unauthenticated by default ─────────────
  // (if your app hides email unless logged in, adjust this test accordingly)
  test('email is a mailto link', async ({ page }) => {
    const emailLink = page.locator('[data-testid="registrant-email"]');
    await expect(emailLink).toHaveAttribute('href', /^mailto:/);
  });
});

// ── Scenario: unverified registrant ────────────────────────────────────────
test.describe('Project Public Page > Registrant unverified', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/projects/public/${MOCK_PROJECT_SLUG}`, route =>
      route.fulfill({
        json: {
          ...mockProject,
          registradoPor: { ...mockProject.registradoPor, verificado: false },
        },
      })
    );
    await page.goto(`http://localhost:3000/#/p/${MOCK_PROJECT_SLUG}`);
  });

  test('does NOT show verified badge for unverified registrant', async ({ page }) => {
    await expect(
      page.locator('[data-testid="registrant-verified-badge"]')
    ).not.toBeVisible();
  });
});
