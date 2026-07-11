import { test, expect } from '@playwright/test';

test.describe('Project Documents Inline Upload', () => {
  // Use a unique ID or fixture data for the project
  const projectId = '1a96659d-48eb-4b91-8c37-1a1e5360289b';

  test.beforeEach(async ({ page }) => {
    // Mock auth so the page doesn't redirect to login
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-id', nombre: 'Test', apellido: 'User', role: 'ADMIN' })
      });
    });
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });
    await page.route('**/api/notifications*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock the project GET so the page loads reliably
    await page.route(`**/api/projects/${projectId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: projectId, nombre: 'Test Project', estadoProyecto: 1, categoria: 1 })
      });
    });

    // Mock the documents GET to return empty list initially, so the page is always in a clean state
    await page.route(`**/api/projects/${projectId}/documents`, async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        await route.continue();
      }
    });

    // Mock the diagnosis endpoint
    await page.route(`**/api/projects/${projectId}/documents/diagnosis`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requirements: [], documents: [] })
      });
    });

    // Navigate directly to the project documents page
    await page.goto(`/#/admin/projects/${projectId}/documents`);
    
    // Wait for the page to load past the auth guard
    await page.waitForLoadState('networkidle');
  });

  test('should fail gracefully on 404 mismatch during inline upload', async ({ page }) => {
    // Intercept the backend upload call to force a 404 (simulating the current bug)
    await page.route(`**/api/v1/projects/${projectId}/documents/requirements/titulo/upload`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' })
      });
    });

    // Find the inline upload row for "Título de Propiedad"
    const row = page.locator('.group\\/item').filter({ hasText: 'Título de Propiedad' });
    
    // Click the inline upload button
    const fileChooserPromise = page.waitForEvent('filechooser');
    await row.getByRole('button', { name: /subir/i }).click();
    const fileChooser = await fileChooserPromise;
    
    // Select a file
    await fileChooser.setFiles({
      name: 'titulo.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy content')
    });

    // Wait for the error to appear inline within that row
    await expect(row.getByText(/Error al subir|Not Found/i)).toBeVisible({ timeout: 5000 });
    
    // The row should NOT show success
    await expect(row.getByText('Cargado')).not.toBeVisible();
  });

  test('should successfully upload a document and update row status', async ({ page }) => {
    let uploadSuccessful = false;

    // Mock the successful response using the new expected endpoint
    await page.route(`**/api/v1/projects/${projectId}/documents/requirements/titulo/upload`, async (route) => {
      uploadSuccessful = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-doc-id',
          proyectoId: projectId,
          tipoDocumento: 1, // CertificadoTitulo
          nombreArchivoOriginal: 'titulo.pdf',
          activo: true
        })
      });
    });

    // Override the GET route to return the uploaded document on subsequent calls
    await page.route(`**/api/projects/${projectId}/documents`, async (route, request) => {
      if (request.method() === 'GET') {
        if (uploadSuccessful) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'new-doc-id',
                proyectoId: projectId,
                tipoDocumento: 1, // CertificadoTitulo
                nombreArchivoOriginal: 'titulo.pdf',
                activo: true,
                estadoDocumento: 1
              }
            ])
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
          });
        }
      } else {
        await route.continue();
      }
    });

    const row = page.locator('.group\\/item').filter({ hasText: 'Título de Propiedad' });
    
    // Trigger upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await row.getByRole('button', { name: /subir/i }).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'titulo.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy content')
    });

    // Verify row status changes to 'Cargado'
    await expect(row.getByText('Cargado')).toBeVisible();
    await expect(row.getByRole('button', { name: /subir/i })).not.toBeVisible();
    
    // Ensure another row (like Plano de Mensura) was NOT affected
    const mensuraRow = page.locator('.group\\/item').filter({ hasText: 'Plano de Mensura' });
    await expect(mensuraRow.getByText('Cargado')).not.toBeVisible();
  });
});
