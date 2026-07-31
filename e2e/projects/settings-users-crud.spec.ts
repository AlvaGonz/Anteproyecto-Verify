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

async function mockAdminUsers(page: Page, users: any[], plans = PLANS, patchStatus = 200, slowSecondGetMs = 0, createError?: string) {
  let getCount = 0;
  let firstPostFailed = false;
  await page.route('**/api/admin/users**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const planMatch = url.pathname.match(/\/api\/admin\/users\/([^/]+)\/plan$/);
    const userMatch = url.pathname.match(/\/api\/admin\/users\/([^/]+)$/);
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
    if (req.method() === 'PUT' && userMatch) {
      const body = req.postDataJSON();
      const user = users.find(x => x.id === userMatch[1]);
      if (user) Object.assign(user, body);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Usuario actualizado exitosamente.' }) });
      return;
    }
    if (req.method() === 'DELETE' && userMatch) {
      const idx = users.findIndex(x => x.id === userMatch[1]);
      if (idx >= 0) users.splice(idx, 1);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Usuario eliminado exitosamente.' }) });
      return;
    }
    if (req.method() === 'POST') {
      // ponytail: optional one-shot 400 (e.g. duplicate email) so the retry path succeeds
      if (createError && !firstPostFailed) {
        firstPostFailed = true;
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: createError }) });
        return;
      }
      const body = req.postDataJSON();
      const plan = plans.find(p => p.name === body.planNombre);
      const created = { id: 'u-new', ...body, planId: plan?.planId ?? 'pl-consult', planName: body.planNombre ?? 'Consultor', planCreatedAt: '2026-07-31T00:00:00Z' };
      users.unshift(created);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
      return;
    }
    if (req.method() === 'GET') {
      // ponytail: snapshot at request time; slow the 2nd GET (refresh) so its stale
      // response lands AFTER the invalidation refetch, reproducing the race
      const body = JSON.stringify({ items: users, totalCount: users.length, page: 1, pageSize: 50 });
      if (++getCount === 2 && slowSecondGetMs > 0) await new Promise(r => setTimeout(r, slowSecondGetMs));
      try {
        await route.fulfill({ status: 200, contentType: 'application/json', body });
      } catch { /* ponytail: request aborted by cancelQueries - expected */ }
      return;
    }
    await route.continue();
  });
  await page.route('**/api/admin/plans', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(plans) }));
}

function cardFor(page: Page, name: string) {
  return page.locator('div.rounded-xl.p-4').filter({ has: page.getByRole('heading', { name }) });
}

async function openUsersTab(page: Page) {
  await page.goto('/#/admin/settings');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Usuarios y Accesos' }).click();
  await expect(page.getByRole('button', { name: 'Corporativo 2' })).toBeVisible();
}

test.describe('Settings - Users Table CRUD', () => {
  test.setTimeout(60_000);

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

  test('edit user updates name and phone, then persists across refetch', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await cardFor(page, 'Ana Martínez').getByTitle('Editar Perfil').click();

    await expect(page.getByRole('heading', { name: 'Editar Usuario' })).toBeVisible();
    await expect(page.locator('#uf-email')).toHaveValue('ana@corp.com');
    await expect(page.locator('#uf-email')).toHaveAttribute('readonly', '');
    await expect(page.locator('#uf-cedula')).toHaveAttribute('readonly', '');
    await expect(page.locator('#uf-plan')).not.toBeVisible();

    await page.locator('#uf-nombre').fill('Ana María');
    await page.locator('#uf-telefono').fill('(809) 555-0199');

    await page.getByRole('button', { name: 'Guardar Usuario' }).click();

    await expect(page.getByText('Usuario actualizado exitosamente')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ana María Martínez' })).toBeVisible();
    expect(users.find(u => u.id === 'u1')?.nombre).toBe('Ana María');
  });

  test('edit modal exposes dialog semantics and closes with Escape', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await cardFor(page, 'Ana Martínez').getByTitle('Editar Perfil').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', /.+/);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Editar Usuario' })).not.toBeVisible();
  });

  test('delete user requires ELIMINAR confirmation and removes the card', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await cardFor(page, 'Carlos Lopez').getByTitle('Eliminar Usuario').click();

    await expect(page.getByRole('heading', { name: '¿Eliminar Usuario?' })).toBeVisible();

    const confirmBtn = page.getByRole('button', { name: 'Sí, Eliminar' });
    await expect(confirmBtn).toBeDisabled();
    await page.locator('#del-modal-confirm').fill('ELIMINA');
    await expect(confirmBtn).toBeDisabled();
    await page.locator('#del-modal-confirm').fill('ELIMINAR');
    await expect(confirmBtn).toBeEnabled();

    await confirmBtn.click();

    await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Corporativo 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carlos Lopez' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ana Martínez' })).toBeVisible();
  });

  test('delete modal exposes dialog semantics and closes with Escape', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await cardFor(page, 'Carlos Lopez').getByTitle('Eliminar Usuario').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', /.+/);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: '¿Eliminar Usuario?' })).not.toBeVisible();
  });

  test('create user adds card to its plan tab', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users);
    await openUsersTab(page);

    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo Usuario' })).toBeVisible();

    await page.locator('#uf-nombre').fill('Lucía');
    await page.locator('#uf-apellido').fill('Fernández');
    await page.locator('#uf-email').fill('lucia@test.com');
    await page.locator('#uf-telefono').fill('8095550109');
    await page.locator('#uf-cedula').fill('00100000009');
    await page.locator('#uf-plan').selectOption('Profesional');
    await page.getByRole('button', { name: 'Guardar Usuario' }).click();

    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profesional 2' })).toBeVisible();
    await page.getByRole('button', { name: 'Profesional 2' }).click();
    await expect(page.getByRole('heading', { name: 'Lucía Fernández' })).toBeVisible();
  });

  test('create error keeps modal open with message and preserves fields', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users, PLANS, 200, 0, 'El correo electrónico ya está en uso.');
    await openUsersTab(page);

    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    await page.locator('#uf-nombre').fill('Lucía');
    await page.locator('#uf-apellido').fill('Fernández');
    await page.locator('#uf-email').fill('dup@corp.com');
    await page.locator('#uf-telefono').fill('8095550109');
    await page.locator('#uf-cedula').fill('00100000009');
    await page.locator('#uf-plan').selectOption('Profesional');
    await page.getByRole('button', { name: 'Guardar Usuario' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('alert')).toContainText('El correo electrónico ya está en uso.');
    await expect(page.locator('#uf-email')).toHaveValue('dup@corp.com');
    await expect(page.locator('#uf-nombre')).toHaveValue('Lucía');

    await page.locator('#uf-email').fill('nueva@corp.com');
    await page.getByRole('button', { name: 'Guardar Usuario' }).click();
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible();
    await expect(dialog).not.toBeVisible();
    await page.getByRole('button', { name: 'Profesional 2' }).click();
    await expect(page.getByRole('heading', { name: 'Lucía Fernández' })).toBeVisible();
  });

  test('delete during in-flight refetch does not resurrect the card', async ({ page }) => {
    const users = seedUsers();
    await mockAuth(page);
    await mockAdminUsers(page, users, PLANS, 200, 1500);
    await openUsersTab(page);

    await page.getByTitle('Refrescar').click();
    await cardFor(page, 'Carlos Lopez').getByTitle('Eliminar Usuario').click();
    await page.locator('#del-modal-confirm').fill('ELIMINAR');
    await page.getByRole('button', { name: 'Sí, Eliminar' }).click();

    await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carlos Lopez' })).not.toBeVisible();
    // ponytail: stale GET#2 (refresh snapshot pre-delete) lands ~1.5s later - card must stay gone
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: 'Carlos Lopez' })).not.toBeVisible();
  });
});
