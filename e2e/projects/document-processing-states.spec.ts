import { test, expect } from '@playwright/test';

const MOCK_PROJECT_ID = "proj-001";

test.describe('Document Processing States', () => {
  test.beforeEach(async ({ page }) => {
    // Setup basic mock routes for project and auth
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin", role: "ADMIN" }) });
    });
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: MOCK_PROJECT_ID, nombre: "Test Project", estadoProyecto: 1, categoria: 1 }) });
    });
    
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    // Initial diagnosis: Titulo is Pendiente
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          documents: [],
          requirements: [
            {
              type: "TITULO_PROPIEDAD",
              name: "Título de Propiedad",
              status: "PENDIENTE",
              isRequired: true,
              allowsUpload: true
            }
          ]
        })
      });
    });
  });

  test('should process document upload and reflect state changes', async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Wait for the requirement row
    const row = page.getByTestId("requirement-row-titulo");
    await expect(row).toBeVisible({ timeout: 5000 });
    
    // Mock the upload endpoint to simulate state transition
    let uploadCalled = false;
    await page.route(`**/api/v1/projects/${MOCK_PROJECT_ID}/documents/requirements/titulo/upload`, async (route) => {
      uploadCalled = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "new-doc-123",
          proyectoId: MOCK_PROJECT_ID,
          tipoDocumento: 21, // CertificadoTitulo
          nombreArchivoOriginal: "Acto de venta A.jpg",
          activo: true,
          estadoDocumento: 1 // Processing
        })
      });
    });

    // Mock documents GET endpoint to return the uploaded document after upload
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route, request) => {
      if (request.method() === 'GET') {
        if (uploadCalled) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                id: "new-doc-123",
                proyectoId: MOCK_PROJECT_ID,
                tipoDocumento: 21,
                nombreArchivoOriginal: "Acto de venta A.jpg",
                activo: true,
                estadoDocumento: 1
              }
            ])
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
          });
        }
      } else {
        await route.continue();
      }
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await row.getByRole("button", { name: /subir/i }).click();
    const fileChooser = await fileChooserPromise;

    // Use dummy buffer to simulate the uploaded test document
    await fileChooser.setFiles({
      name: 'Acto de venta A.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock image content')
    });

    // Check that status changes to Cargado
    const statusText = page.getByTestId("requirement-status-titulo");
    await expect(statusText).toContainText("Cargado", { ignoreCase: true });
  });
});
