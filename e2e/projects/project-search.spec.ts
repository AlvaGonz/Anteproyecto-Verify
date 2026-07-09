import { test, expect } from "@playwright/test";

test.describe("Public Project Search E2E Test", () => {
  // Test data injected by the DB seeder (AppDbContextSeeder.cs)
  // for the project "Torre Bella Vista Piantini"
  const testData = {
    sello: "VF-2026-X83L",
    suelo: "001-02-003",
    ipi: "1-01-99999-9",
    rnc: "1-30-12345-1",
    cedula: "402-1234567-8",
    projectName: "Torre Bella Vista Piantini",
  };

  test.beforeEach(async ({ page }) => {
    // This is the public search page
    await page.goto("/#/projects");
    
    // Wait for the form to be visible before starting tests
    // for the search form dropdown button
    await expect(page.locator('button', { hasText: 'Tipo:' })).toBeVisible();
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

    // Enter the search query
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill(query);

    // Submit the form
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    if (searchType === "cert") {
      // For certificates, it navigates to /projects/verify/...
      await expect(page).toHaveURL(new RegExp(`/projects/verify/.*`));
      // The verification page should have some indicator of the project name or seal
      await expect(page.getByText(expectedProject)).toBeVisible();
    } else {
      // Wait for the API response and grid update
      await expect(page.locator("h3", { hasText: expectedProject }).first()).toBeVisible();
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

    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill("VF-2099-XXXX");

    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // Note: The UI might navigate to /projects/verify/VF-2099-XXXX and then show an error
    await expect(page).toHaveURL(new RegExp(`/projects/verify/VF-2099-XXXX`));
    await expect(page.getByText(/Proyecto no encontrado/i)).toBeVisible();
  });
});
