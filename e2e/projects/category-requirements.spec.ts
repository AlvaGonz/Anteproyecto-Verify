import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Category Specific Requirements E2E", () => {
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
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test("Comercial project (Category 2) shows REGISTRO_SANITARIO", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Plaza Central",
          estadoProyecto: 1, 
          categoria: 2 // Comercial
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Check if the commercial-specific requirement row is rendered
    const row = page.getByTestId("requirement-row-REGISTRO_SANITARIO");
    await expect(row).toBeVisible({ timeout: 5000 });
  });

  test("Turistico project (Category 3) shows RESOLUCION_CONFOTUR", async ({ page }) => {
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Hotel Punta Cana",
          estadoProyecto: 1, 
          categoria: 3 // Turistico
        })
      });
    });

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Check if the turistico-specific requirement row is rendered
    const row = page.getByTestId("requirement-row-RESOLUCION_CONFOTUR");
    await expect(row).toBeVisible({ timeout: 5000 });
  });
});
