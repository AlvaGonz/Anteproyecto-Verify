import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Inline Document Upload UI E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", email: "admin@verifinca.do", name: "Admin User", role: "ADMIN" })
      });
    });

    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: MOCK_PROJECT_ID,
            nombre: "Residencial Las Palmas",
            estadoProyecto: 1, 
            categoria: 1 // Residencial
          })
        });
      } else {
        await route.continue();
      }
    });
    let mockDocuments: any[] = [];
    
    // Mock file upload endpoint (POST) and documents fetch (GET)
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 300)); // simulate upload delay
        const newDoc = {
          id: "doc-new",
          tipoDocumento: 1, // CertificadoTitulo
          nombreArchivoOriginal: "titulo.pdf",
          activo: true,
          estadoDocumento: 0, // Uploaded
          tamanoBytes: 1024,
        };
        mockDocuments.push(newDoc);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(newDoc)
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockDocuments) // Initially empty, then has the doc
        });
      } else {
        await route.continue();
      }
    });
  });

  test("can upload a document inline from the checklist", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Check if the requirement row is rendered
    const row = page.getByTestId("requirement-row-TITULO_PROPIEDAD");
    await expect(row).toBeVisible({ timeout: 5000 });

    // Initial status should be "Pendiente"
    const status = page.getByTestId("requirement-status-TITULO_PROPIEDAD");
    await expect(status).toHaveText("Pendiente");

    // Click "Adjuntar" button -> it should trigger the file input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId("requirement-row-TITULO_PROPIEDAD").getByRole("button", { name: /adjuntar/i }).click();
    const fileChooser = await fileChooserPromise;

    // Simulate selecting a file
    await fileChooser.setFiles({
      name: 'titulo.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content')
    });



    // Wait for the success toast
    await expect(page.getByText("Documento adjuntado exitosamente")).toBeVisible({ timeout: 5000 });
    
    // Verify row now shows as uploaded with the filename
    await expect(page.getByTestId("requirement-row-TITULO_PROPIEDAD")).toContainText("titulo.pdf");
    await expect(page.getByTestId("requirement-row-TITULO_PROPIEDAD")).toContainText("Cargado");
  });
});
