import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Document Upload Validation E2E", () => {
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
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test("Client-side validation rejects files that are too large", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Wait for the requirement row
    const row = page.getByTestId("requirement-row-TITULO_PROPIEDAD");
    await expect(row).toBeVisible({ timeout: 5000 });

    // Provide a file larger than 10MB (mocking file size might be tricky in Playwright, 
    // but we can intercept the alert dialog).
    // Actually, in Playwright, we can just use setFiles with a buffer.
    // 10MB is 10 * 1024 * 1024 bytes. We will create an 11MB buffer.
    
    // Setup dialog handler
    let dialogMessage = "";
    page.on("dialog", dialog => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId("requirement-row-TITULO_PROPIEDAD").getByRole("button", { name: /adjuntar/i }).click();
    const fileChooser = await fileChooserPromise;

    // Buffer of 11MB
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, "a");

    await fileChooser.setFiles({
      name: 'huge-titulo.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    // Check if dialog was triggered
    expect(dialogMessage).toContain("excede el límite permitido");
    
    // Check that the status is still Pendiente
    const status = page.getByTestId("requirement-status-TITULO_PROPIEDAD");
    await expect(status).toHaveText("Pendiente");
  });
});
