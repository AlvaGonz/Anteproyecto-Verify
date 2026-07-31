import { test, expect, Page } from '@playwright/test';

const ADMIN_ME = {
  id: 'admin-1',
  nombre: 'Admin',
  apellido: 'Sistema',
  email: 'admin@verifinca.com',
  role: 'admin',
  cedula: '00100000000',
  telefono: '8095550000',
  rnc: '101000000',
  plan: 'Corporativo',
  aceptoDescargo: true,
};

const PLANS = [
  { planId: 'pl-corp', name: 'Corporativo', price: 499 },
  { planId: 'pl-emp', name: 'Empresa', price: 199 },
  { planId: 'pl-prof', name: 'Profesional', price: 99 },
  { planId: 'pl-consult', name: 'Consultor', price: 0 },
  { planId: 'pl-free', name: 'Gratuito', price: 0 },
];

function seedUsers() {
  return [
    {
      id: 'u1', nombre: 'Ana', apellido: 'Martínez', email: 'ana@corp.com', role: 'user',
      telefono: '8095550101', cedula: '00100000001', planId: 'pl-corp', planName: 'Corporativo',
      planCreatedAt: '2026-06-01T00:00:00Z', usedProjects: 3, usedQueries: 5, maxInvitees: 10, inviteesCount: 1,
    },
    {
      id: 'u2', nombre: 'Carlos', apellido: 'Lopez', email: 'carlos@corp.com', role: 'user',
      telefono: '8095550102', cedula: '00100000002', planId: 'pl-corp', planName: 'Corporativo',
      planCreatedAt: '2026-06-02T00:00:00Z', usedProjects: 1, usedQueries: 2, maxInvitees: 10, inviteesCount: 0,
    },
    {
      id: 'u3', nombre: 'Maria', apellido: 'Gomez', email: 'maria@prof.com', role: 'user',
      telefono: '8095550103', cedula: '00100000003', planId: 'pl-prof', planName: 'Profesional',
      planCreatedAt: '2026-06-03T00:00:00Z', usedProjects: 0, usedQueries: 0,
    },
  ];
}

async function mockAuth(page: Page, me = ADMIN_ME) {
  await page.route('**/api/auth/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/auth/refresh', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) }));
  await page.route('**/api/notifications*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/v1/subscriptions/my-status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ plan: 'Corporativo', subscriptionStatus: 'active', planPrice: 0, isGuest: false }),
  }));
}

async function mockAdminUsers(page: Page, users: any[], plans = PLANS, patchStatus = 200) {
  await page.route('**/api/admin/users**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const planMatch = url.pathname.match(/\/api\/admin\/users\/([^/]+)\/plan$/);
    if (req.method() === 'PATCH' && planMatch) {
      if (patchStatus !== 200) {
        await route.fulfill({ status: patchStatus, contentType: 'application/json', body: JSON.stringify({ message: 'Internal error' }) });
        return;
      }
      const body = req.postDataJSON();
      const user = users.find(x => x.id === planMatch[1]);
      if (user) {
        const plan = plans.find(p => p.planId === body.planId);
        user.planId = body.planId;
        user.planName = plan?.name ?? user.planName;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Suscripción asignada y pago registrado exitosamente.' }) });
      return;
    }
    if (req.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: users, totalCount: users.length, page: 1, pageSize: 50 }) });
      return;
    }
    await route.continue();
  });
  await page.route('**/api/admin/plans', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(plans) }));
}

async function openUsersTab(page: Page) {
  await page.goto('/#/admin/settings');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Usuarios y Accesos' }).click();
  await expect(page.getByRole('button', { name: 'Corporativo 2' })).toBeVisible();
}

test.describe('Settings - Users Table CRUD', () => {
  test('plan change moves user to new plan tab and updates count badges', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await expect(page.getByRole('button', { name: 'Profesional 1' })).toBeVisible();

    await page.locator('#plan-u1').selectOption('pl-prof');

    await expect(page.getByText('Plan de suscripción asignado exitosamente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Corporativo 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profesional 2' })).toBeVisible();

    await page.getByRole('button', { name: 'Profesional 2' }).click();
    await expect(page.getByRole('heading', { name: 'Ana Martínez' })).toBeVisible();
    await expect(page.locator('#plan-u1')).toHaveValue('pl-prof');

    await page.getByRole('button', { name: 'Corporativo 1' }).click();
    await expect(page.getByRole('heading', { name: 'Carlos Lopez' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ana Martínez' })).not.toBeVisible();
  });

  test('plan change failure shows error toast and keeps user in original tab', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users, PLANS, 500);
    await openUsersTab(page);

    await page.locator('#plan-u1').selectOption('pl-prof');

    await expect(page.getByText('Error de red al actualizar suscripción')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Corporativo 2' })).toBeVisible();
    await expect(page.locator('#plan-u1')).toHaveValue('pl-corp');
  });
});
