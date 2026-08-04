import { test, expect } from '@playwright/test';

const PROJECT_ID = 'proj-status-001';

// Catálogo con un nombre deliberadamente distinto al hardcoded del UI
// ("Revisión Catastral" vs el viejo "En Revisión") para probar que el
// stepper consume ProyectosEstados y no strings locales.
const catalog = [
  { estadoId: '44DA5231-5609-463F-AD8B-22D1C5D403E9', codigoUnico: 'CREADO', nombre: 'Creado', colorHex: '#9BACD8', activo: true },
  { estadoId: '34A9F3F9-983A-48DF-904B-603DA0D5A6D3', codigoUnico: 'EDITADO', nombre: 'Editado', colorHex: '#F98513', activo: true },
  { estadoId: 'F20BB804-B3BB-439B-AC8B-DE7A63AAF9A4', codigoUnico: 'REVISION', nombre: 'Revisión Catastral', colorHex: '#EAB308', activo: true },
  { estadoId: 'C372493C-F48F-4662-BEBD-377F11F18CC5', codigoUnico: 'PUBLICADO', nombre: 'Publicado', colorHex: '#10B981', activo: true },
  { estadoId: 'DD99B9CB-E3E3-4C1F-A472-50223DF98425', codigoUnico: 'OBSERVACION', nombre: 'Con Observación', colorHex: '#EF4444', activo: true },
];

const project = {
  id: PROJECT_ID,
  codigoInterno: 'VF-STATUS-2026',
  nombre: 'Condominio Catálogo',
  ubicacionTexto: 'Santo Domingo, DN',
  categoriaId: 16,
  categoriaNombre: 'Residencial',
  estadoProyecto: 'REVISION',
  estadoId: 'F20BB804-B3BB-439B-AC8B-DE7A63AAF9A4',
  estadoNombre: 'Revisión Catastral',
  estadoColorHex: '#EAB308',
  estadoActivo: true,
  estadoIntegridad: 0,
  usuarioCreadorId: 'user-001',
  createdAtUtc: '2026-01-01T00:00:00Z',
};

test.describe('Project status stepper > catalog driven (ProyectosEstados)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects/estados', (route) =>
      route.fulfill({ status: 200, json: catalog })
    );
    await page.route(`**/api/projects/${PROJECT_ID}`, (route) =>
      route.fulfill({ status: 200, json: project })
    );
    await page.route(`**/api/projects/${PROJECT_ID}/status-eligibility`, (route) =>
      route.fulfill({
        status: 200,
        json: { documentCount: 1, hasObservaciones: false, currentStatus: 'REVISION' },
      })
    );
    await page.route(/\/api\/projects(\?.*)?$/, (route) =>
      route.fulfill({ status: 200, json: { items: [project], totalCount: 1, page: 1, pageSize: 50 } })
    );
    await page.route('**/api/projects/categories', (route) =>
      route.fulfill({ status: 200, json: [{ id: 16, nombre: 'Residencial' }] })
    );

    await page.goto(`/#/admin/projects/${PROJECT_ID}/edit`);
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });
  });

  test('stepper muestra el label del catálogo, no un string hardcoded', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Revisión Catastral' })
    ).toBeVisible();
  });

  test('estado activo usa el color del catálogo', async ({ page }) => {
    const active = page.getByRole('button', { name: 'Revisión Catastral' });
    await expect(active).toBeVisible();
    await expect(active).toHaveCSS('background-color', 'rgb(234, 179, 8)'); // #EAB308
  });
});
