import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Preferencias tab (admin settings) — how the responsible person is presented
// on public project views (admin published page + anonymous public page).
// The route mocks emulate the server: PATCH /api/auth/preferences persists the
// modes, and the project detail payload carries the RESOLVED presentation
// (presentacionPublica), i.e. the server-side PublicIdentityResolver output.
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ID = 'ecc3f121-f494-d477-6ce5-00069f8a27ab';
const ADMIN_PUBLISHED_URL = `/#/admin/projects/${PROJECT_ID}/publicado`;
const PUBLIC_URL = `/#/p/${PROJECT_ID}`;

type NameMode = 'realName' | 'nickname';
type IdMode = 'cedula' | 'rnc';

let me: any;
let project: any;

function makeMe(overrides: Record<string, unknown> = {}) {
  return {
    id: 'admin-1',
    email: 'admin@verifinca.com',
    nombre: 'Admin',
    apellido: 'Sistema',
    role: 'admin',
    cedula: '00100000000',
    telefono: '8095550000',
    rnc: '101000000',
    razonSocial: 'Desarrollos del Este SRL',
    nickname: 'adminPro',
    plan: 'Corporativo',
    aceptoDescargo: true,
    nombrePublicoModo: null,
    identificacionPublicaModo: null,
    ...overrides,
  };
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: PROJECT_ID,
    codigoInterno: 'COR-7877',
    nombre: 'Torre Playa Dorada Beach',
    ubicacionTexto: 'Piedra Blanca, Monsenor Nouel',
    valorEstimado: 4500000,
    categoriaId: 99,
    categoriaNombre: 'Turístico',
    datosDesarrollador: 'BORDSHIPP DOMINICANA SRL',
    rncDesarrollador: '131314589',
    cedulaRncPropietario: null,
    estado: 1,
    estadoJuridico: 0,
    estatusDescripcion: 'Publicado',
    estadoProyecto: 'PUBLICADO',
    estadoIntegridad: 1,
    usuarioCreadorId: 'admin-1',
    createdAtUtc: '2026-05-14T23:31:54Z',
    superficieM2: null,
    registradoPor: {
      id: 'admin-1',
      nombreCompleto: 'Admin Sistema',
      razonSocial: 'Desarrollos del Este SRL',
      rol: 'Admin',
      email: 'admin@verifinca.com',
      telefono: '809-555-0000',
      avatarUrl: null,
      fechaRegistro: '2026-01-01T00:00:00Z',
      verificado: true,
      titularId: null,
      presentacionPublica: null,
    },
    ...overrides,
  };
}

// Mirrors the backend PublicIdentityResolver contract (single source of truth
// lives server-side; the mock replays the same rules for the E2E).
function resolvePresentation(): Record<string, unknown> | null {
  if (!project.registradoPor) return null;
  const nameMode = me.nombrePublicoModo as NameMode | null;
  const idMode = me.identificacionPublicaModo as IdMode | null;

  const nombreMostrado =
    nameMode === 'nickname' && me.nickname ? me.nickname : `${me.nombre} ${me.apellido}`;

  let identificacionMostrada: string | null;
  let identificacionTipo: 'cedula' | 'rnc' | null;
  if (idMode === 'rnc') {
    if (me.rnc) {
      identificacionMostrada = me.rnc;
      identificacionTipo = 'rnc';
    } else {
      identificacionMostrada = me.cedula;
      identificacionTipo = 'cedula';
    }
  } else if (idMode === 'cedula') {
    if (me.cedula) {
      identificacionMostrada = me.cedula;
      identificacionTipo = 'cedula';
    } else {
      identificacionMostrada = me.rnc;
      identificacionTipo = me.rnc ? 'rnc' : null;
    }
  } else {
    identificacionMostrada = project.cedulaRncPropietario || project.rncDesarrollador || null;
    identificacionTipo = null;
  }

  const razonSocialMostrada =
    idMode === 'rnc' ? (me.razonSocial ?? null)
    : idMode === 'cedula' ? null
    : (me.razonSocial || project.datosDesarrollador || null);

  return { nombreMostrado, identificacionMostrada, identificacionTipo, razonSocialMostrada };
}

function syncPresentation() {
  project.registradoPor.presentacionPublica = resolvePresentation();
}

async function stubApis(page: Page) {
  await page.route('**/api/auth/me', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/auth/refresh', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) }));
  await page.route('**/api/auth/logout', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/notifications*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/v1/subscriptions/my-status', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan: 'Corporativo', subscriptionStatus: 'active', planPrice: 0, isGuest: false }) }));
  await page.route('**/api/admin/users**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }) }));
  await page.route('**/api/admin/plans**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/provinces**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));

  // Project detail (admin published page + public /p/:slug page)
  await page.route(`**/api/projects/${PROJECT_ID}`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(project) }));
  await page.route(`**/api/projects/${PROJECT_ID}/**`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/projects/consume-quota', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/projects/interests**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/projects/saved**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));

  // Save preferences endpoint — emulates the use case + server-side resolution
  await page.route('**/api/auth/preferences', async route => {
    const body = route.request().postDataJSON();
    me.nombrePublicoModo = body.nombreModo;
    me.identificacionPublicaModo = body.identificacionModo;
    syncPresentation();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Preferencias actualizadas exitosamente.' }) });
  });
}

async function openPreferencesTab(page: Page) {
  await page.goto('/#/admin/settings');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Preferencias' }).click();
}

async function savePreferences(page: Page, nameMode: NameMode, idMode: IdMode) {
  await openPreferencesTab(page);
  if (nameMode === 'nickname') {
    await page.getByLabel('Nickname (apodo)').check();
  } else {
    await page.getByLabel('Nombre real').check();
  }
  if (idMode === 'rnc') {
    await page.getByLabel('RNC (razón social)').check();
  } else {
    await page.getByLabel('Cédula').check();
  }
  await page.getByRole('button', { name: 'Guardar Preferencias' }).click();
  await expect(page.getByText('Preferencias actualizadas exitosamente')).toBeVisible();
}

test.describe('Settings > Preferencias tab', () => {
  test.beforeEach(async ({ page }) => {
    me = makeMe();
    project = makeProject();
    syncPresentation();
    await stubApis(page);
  });

  test('shows the Preferencias tab among the existing settings tabs', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Mi Perfil' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suscripción' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Usuarios y Accesos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Seguridad' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preferencias' })).toBeVisible();

    await page.getByRole('button', { name: 'Preferencias' }).click();
    await expect(page.getByLabel('Nombre real')).toBeVisible();
    await expect(page.getByLabel('Nickname (apodo)')).toBeVisible();
    await expect(page.getByLabel('Cédula')).toBeVisible();
    await expect(page.getByLabel('RNC (razón social)')).toBeVisible();
  });

  test('nickname + cédula: both public views show nickname and cédula', async ({ page }) => {
    await savePreferences(page, 'nickname', 'cedula');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('adminPro');
    await expect(page.getByTestId('registrant-identification')).toHaveText('00100000000');
    await expect(page.getByTestId('registrant-razon-social')).not.toBeVisible();

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('adminPro');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('00100000000');
    await expect(page.getByTestId('public-registrant-razon-social')).not.toBeVisible();
  });

  test('real name + cédula: both public views show real name and cédula', async ({ page }) => {
    await savePreferences(page, 'realName', 'cedula');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('registrant-identification')).toHaveText('00100000000');

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('00100000000');
  });

  test('nickname + RNC: both public views show nickname, RNC and razón social', async ({ page }) => {
    await savePreferences(page, 'nickname', 'rnc');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('adminPro');
    await expect(page.getByTestId('registrant-identification')).toHaveText('101000000');
    await expect(page.getByTestId('registrant-razon-social')).toHaveText('Desarrollos del Este SRL');

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('adminPro');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('101000000');
    await expect(page.getByTestId('public-registrant-razon-social')).toHaveText('Desarrollos del Este SRL');
  });

  test('real name + RNC: both public views show real name, RNC and razón social', async ({ page }) => {
    await savePreferences(page, 'realName', 'rnc');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('registrant-identification')).toHaveText('101000000');
    await expect(page.getByTestId('registrant-razon-social')).toHaveText('Desarrollos del Este SRL');

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('101000000');
    await expect(page.getByTestId('public-registrant-razon-social')).toHaveText('Desarrollos del Este SRL');
  });

  test('fallbacks: missing nickname → real name; missing RNC → cédula; missing razón social → line hidden', async ({ page }) => {
    me.nickname = null;
    await savePreferences(page, 'nickname', 'rnc');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('registrant-identification')).toHaveText('101000000');
    await expect(page.getByTestId('registrant-razon-social')).toHaveText('Desarrollos del Este SRL');

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('101000000');

    // missing RNC + missing razón social → falls back to cédula, line hidden
    me.rnc = null;
    me.razonSocial = null;
    await savePreferences(page, 'realName', 'rnc');

    await page.goto(ADMIN_PUBLISHED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('registrant-identification')).toHaveText('00100000000');
    await expect(page.getByTestId('registrant-razon-social')).not.toBeVisible();

    await page.goto(PUBLIC_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('public-registrant-name')).toHaveText('Admin Sistema');
    await expect(page.getByTestId('public-registrant-identification')).toHaveText('00100000000');
    await expect(page.getByTestId('public-registrant-razon-social')).not.toBeVisible();
  });

  test('regression: existing settings tabs still render', async ({ page }) => {
    await page.goto('/#/admin/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Mi Perfil' }).click();
    await expect(page.getByTestId('settings-grid')).toBeVisible();

    await page.getByRole('button', { name: 'Preferencias' }).click();
    await expect(page.getByLabel('Nombre real')).toBeVisible();

    await page.getByRole('button', { name: 'Suscripción' }).click();
    await expect(page.getByRole('button', { name: 'Preferencias' })).toBeVisible();
  });
});
