import { test, expect } from "@playwright/test";

test.describe("Public Project Search E2E Test", () => {
  // Test data injected by the DB seeder (AppDbContextSeeder.cs)
  // for the project "Torre Bella Vista Piantini"
  const testData = {
    sello: "VF-2026-ABC123XYZ",
    suelo: "00102003",
    ipi: "101999999999",
    rnc: "1-30-12345-1",
    cedula: "402-1234567-8",
    projectName: "Torre Bella Vista Piantini",
  };

  test.beforeEach(async ({ page }) => {
    // The search form requires an authenticated session (quota check) before navigating
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-001", role: "user", email: "test@verifinca.do", name: "Test User", aceptoDescargo: true }),
      });
    });
    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "fake-jwt-token", user: { id: "user-001", role: "user" } }),
      });
    });

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

    // Mock the public verification endpoint for the verify page (/projects/verify/{code})
    // The verify page calls usePublicVerification which fetches /public/projects/{code}
    await page.route("**/public/projects/VF-2026-ABC123XYZ*", async (route) => {
      console.log(`[MOCK] Intercepted /public/projects/VF-2026-ABC123XYZ`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "VF-2026-ABC123XYZ",
          codigoInterno: "VF-2026-ABC123XYZ",
          nombreProyecto: "Torre Bella Vista Piantini",
          ubicacion: "Santo Domingo, RD",
          categoriaId: 16,
          estadoProyecto: 1,
          estadoIntegridad: 0,
          usuarioCreadorId: "user-001",
          createdAtUtc: "2026-01-01T00:00:00Z",
        }),
      });
    });

// Mock the search API for non-cert searches (suelo, ipi, rnc, cedula)
    // The search results page calls /api/public/projects/search with query params
    await page.route("**/api/public/projects/search*", async (route) => {
      console.log(`[MOCK] Intercepted search API`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "VF-2026-ABC123XYZ",
              codigoInterno: "VF-2026-ABC123XYZ",
              nombreProyecto: "Torre Bella Vista Piantini",
              ubicacion: "Santo Domingo, RD",
              categoriaId: 16,
              estadoProyecto: "PUBLICADO",
              estadoIntegridad: 0,
              usuarioCreadorId: "user-001",
              createdAtUtc: "2026-01-01T00:00:00Z",
            },
          ],
          totalCount: 1,
          page: 1,
          pageSize: 200,
        }),
      });
    });

    // Mock the global search endpoint consumed by the /projects directory page
    // (useGlobalSearch). Unknown codes (e.g. VF-2099-XXXX) return 404 -> error state.
    await page.route("**/api/v1/search/global*", async (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get("q") || "";
      if (q.includes("VF-2099")) {
        await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "No se encontraron resultados" }) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            tipoConsulta: "cert",
            esValido: true,
            tituloPrincipal: "Torre Bella Vista Piantini",
            detalles: { "Sello VeriFinca": "VF-2026-ABC123XYZ", "Estado": "PUBLICADO" },
            proyectosRelacionados: [],
            documentosRelacionados: [],
            grafoRed: { nodos: [], enlaces: [] },
          }),
        });
      }
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
      page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 12345|Ej: 101999999999|Ej: 101234567|Ej: 402-1234567-8/i)
    ).toBeVisible({ timeout: 20000 });
  });

  const searchAndVerify = async (page: any, searchType: string, query: string, expectedProject: string) => {
    // Click the dropdown toggle
    await page.locator('button', { hasText: 'Tipo:' }).click();

    // Select the search type
    if (searchType === "cert") await page.getByRole('button', { name: 'Sello VeriFinca', exact: true }).click();
    else if (searchType === "suelo") await page.getByRole('button', { name: 'Permiso Suelo', exact: true }).click();
    else if (searchType === "ipi") await page.getByRole('button', { name: 'IPI', exact: true }).click();
    else if (searchType === "rnc") await page.getByRole('button', { name: 'RNC', exact: true }).click();
    else if (searchType === "cedula") await page.getByRole('button', { name: 'Cédula', exact: true }).click();

    // Enter the search query - use the unique placeholder from VerifySearchForm to avoid
    // colliding with other inputs on the page (RNC/Cédula/Coords).
    const searchInput = page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 12345|Ej: 101999999999|Ej: 101234567|Ej: 402-1234567-8/i);
    await searchInput.fill(query);

    // Submit the form
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // The /projects page renders global search results inline (useGlobalSearch):
    // a validated-entity card with tituloPrincipal + "Entidad Validada" badge.
    await expect(page.getByText("Entidad Validada")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(expectedProject).first()).toBeVisible({ timeout: 10000 });
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

    const searchInput = page.getByPlaceholder(/Ej: VF-2026-X83L|Ej: 12345|Ej: 101999999999|Ej: 101234567|Ej: 402-1234567-8/i);
    await searchInput.fill("VF-2099-XXXX");

    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // The global search endpoint returns 404 for unknown codes -> inline error state
    await expect(page.getByText(/No se encontraron resultados/i)).toBeVisible({ timeout: 10000 });
  });
});
