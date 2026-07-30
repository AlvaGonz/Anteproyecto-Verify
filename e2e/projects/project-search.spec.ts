import { test, expect } from "@playwright/test";
import * as fs from "fs";

test.describe("Public Project Search E2E Test", () => {
  // Test data injected by the DB seeder (AppDbContextSeeder.cs)
  // for the project "Torre Bella Vista Piantini"
  const testData = {
    sello: "VF-2026-ABC123XYZ",
    suelo: "001-02-003",
    ipi: "1-01-99999-9",
    rnc: "1-30-12345-1",
    cedula: "402-1234567-8",
    projectName: "Torre Bella Vista Piantini",
  };

  test.beforeEach(async ({ page }) => {
    // Mock the consume-quota endpoint so the search form can navigate after submit.
    // Without this mock, an unknown seal/cédula/RNC would fail quota check and never
    // navigate to the verify page.
    await page.route("**/api/projects/consume-quota", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ allowed: true }),
      });
    });

    // Mock the project fetch for the verify page (/projects/verify/{id})
    // The verify page calls useProject(identifier) which fetches /api/projects/{id}
    await page.route(/\/api\/projects\/VF-2026-ABC123XYZ(\?.*)?$/, async (route) => {
      console.log(`[MOCK] Intercepted /api/projects/VF-2026-ABC123XYZ`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "VF-2026-ABC123XYZ",
          codigoInterno: "VF-2026-ABC123XYZ",
          nombre: "Torre Bella Vista Piantini",
          ubicacionTexto: "Santo Domingo, RD",
          categoria: 1,
          estadoProyecto: 1,
          estadoIntegridad: 0,
          usuarioCreadorId: "user-001",
          createdAtUtc: "2026-01-01T00:00:00Z",
        }),
      });
    });

    // This is the public search page
    await page.goto("/#/projects");
    await page.waitForLoadState("networkidle");
    // Small grace period for the lazy-loaded chunk to mount the form.
    await page.waitForTimeout(500);

    // Wait for the search input (unique placeholder) to be ready before tests run.
    // The page is lazy-loaded; checking just for "Tipo:" is flaky because the
    // form below the hero section may not be rendered yet.
    await expect(
      page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 001-02-003|Ej: 1-01-99999-9|Ej: 1-01-23456-7|Ej: 402-1234567-8/i)
    ).toBeVisible({ timeout: 20000 });
  });

  const searchAndVerify = async (page: any, searchType: string, query: string, expectedProject: string) => {
    // Click the dropdown toggle
    await page.locator('button', { hasText: 'Tipo:' }).click();
    
    // Select the search type
    if (searchType === "cert") await page.getByRole('button', { name: 'Sello VeriFinca', exact: true }).click();
    else if (searchType === "suelo") await page.getByRole('button', { name: 'Número Suelo', exact: true }).click();
    else if (searchType === "ipi") await page.getByRole('button', { name: 'IPI', exact: true }).click();
    else if (searchType === "rnc") await page.getByRole('button', { name: 'RNC', exact: true }).click();
    else if (searchType === "cedula") await page.getByRole('button', { name: 'Cédula', exact: true }).click();

    // Enter the search query - use the unique placeholder from VerifySearchForm to avoid
    // colliding with other inputs on the page (RNC/Cédula/Coords).
    const searchInput = page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 001-02-003|Ej: 1-01-99999-9|Ej: 1-01-23456-7|Ej: 402-1234567-8/i);
    await searchInput.fill(query);

    // Submit the form
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    if (searchType === "cert") {
      // For certificates, it navigates to /projects/verify/...
      await expect(page).toHaveURL(new RegExp(`/projects/verify/.*`), { timeout: 8000 });
      // The verification page should have some indicator of the project name or seal
      await expect(page.getByText(expectedProject)).toBeVisible({ timeout: 10000 });
    } else {
      // Wait for URL to contain the search query (navigation completed)
      await page.waitForURL(new RegExp(`[?&]q=`), { timeout: 8000 });
      try {
        await expect(page.locator("h3", { hasText: expectedProject }).first()).toBeVisible({ timeout: 10000 });
      } catch (e) {
        const html = await page.evaluate(() => document.body.outerHTML);
        fs.writeFileSync('debug-body.html', html);
        throw e;
      }
    }
  };

  test("should find the project using Sello VeriFinca", async ({ page }) => {
    await searchAndVerify(page, "cert", testData.sello, testData.projectName);
  });

  test("should find the project using Número de Suelo (Matricula)", async ({ page }) => {
    await searchAndVerify(page, "suelo", testData.suelo, testData.projectName);
  });

  test("should find the project using IPI", async ({ page }) => {
    await searchAndVerify(page, "ipi", testData.ipi, testData.projectName);
  });

  test("should find the project using RNC", async ({ page }) => {
    await searchAndVerify(page, "rnc", testData.rnc, testData.projectName);
  });

  test("should find the project using Cédula", async ({ page }) => {
    await searchAndVerify(page, "cedula", testData.cedula, testData.projectName);
  });

  test("should not find anything with invalid query", async ({ page }) => {
    // Open dropdown
    await page.locator('button', { hasText: 'Tipo:' }).click();
    // Select cert
    await page.getByRole('button', { name: 'Sello VeriFinca', exact: true }).click();

    const searchInput = page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 001-02-003|Ej: 1-01-99999-9|Ej: 1-01-23456-7|Ej: 402-1234567-8/i);
    await searchInput.fill("VF-2099-XXXX");

    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // Note: The UI navigates to /projects/verify/VF-2099-XXXX and then shows an error
    await expect(page).toHaveURL(new RegExp(`/projects/verify/VF-2099-XXXX`), { timeout: 8000 });
    // The verify result page shows "Código No Válido" when a seal is not found
    await expect(page.getByText(/Código No Válido/i)).toBeVisible({ timeout: 10000 });
  });
});
