import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-001";

test.describe("Frontend AI Diagnosis UI E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Intercept /api/auth/me for auth simulation
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "admin@verifinca.do",
          name: "Admin User",
          role: "ADMIN"
        })
      });
    });

    // 2. Intercept /api/projects/:id to load project
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Residencial Las Palmas",
          estadoProyecto: 1, // Published
        })
      });
    });

    // 3. Intercept /api/projects/:id/documents
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    // 4. Intercept Diagnosis Endpoint
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          projectId: MOCK_PROJECT_ID,
          score: 85,
          summary: "El proyecto cuenta con el 85% de la documentación requerida. Faltan copias de mensura.",
          missingDocuments: ["Plano de Mensura Catastral"],
          recommendations: ["Solicitar mensura aprobada"],
          provider: "Nvidia NIM",
          generatedAt: new Date().toISOString()
        })
      });
    });
  });

  test("generates and displays AI diagnosis correctly", async ({ page }) => {
    // Navigate to Project Documents Page
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/documents`);
    
    // Check if the diagnosis panel is rendered
    const panel = page.getByTestId("diagnosis-panel");
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Click on Generate Diagnosis Button
    const generateBtn = page.getByTestId("generate-diagnosis-btn");
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify loading state changes to button disabled
    await expect(generateBtn).toBeDisabled();
    
    // Wait for the result view to appear
    const resultView = page.getByTestId("diagnosis-result-view");
    await expect(resultView).toBeVisible({ timeout: 5000 });

    // Verify Score is 85
    const score = page.getByTestId("diagnosis-score");
    await expect(score).toHaveText("85");

    // Verify Summary is displayed
    const summary = page.getByTestId("diagnosis-summary");
    await expect(summary).toContainText("85% de la documentación requerida");

    // Verify Missing Documents list renders the mocked missing doc
    await expect(page.getByText("Plano de Mensura Catastral")).toBeVisible();
  });
});
