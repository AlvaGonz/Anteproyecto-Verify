import { test, expect, Page } from "@playwright/test";

test.describe("Public Directory Filter — E2E", () => {
  const MOCK_PROJECTS = [
    {
      id: "1", nombreProyecto: "Residencial Terra Noble", categoriaId: 16,
      estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo",
      estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO",
      valorEstimado: 8500000, designacionCatastral: "001-02-003",
      rncDesarrollador: "1-30-12345-1", cedulaRncPropietario: "402-1234567-8",
      matricula: "200001", constructora: "Constructora Terra",
      completionRate: 100, imagenUrl: ""
    },
    {
      id: "2", nombreProyecto: "Torre San Gerónimo",       categoriaId: 8,
      estadoValidacion: "Verificado", ubicacionTexto: "Santiago",
      estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO",
      valorEstimado: 12000000, designacionCatastral: "002-01-005",
      completionRate: 100, imagenUrl: ""
    },
    {
      id: "3", nombreProyecto: "Plaza Central Mall",       categoriaId: 8,
      estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo",
      estadoIntegridad: 0, estadoJuridico: 1, estadoProyecto: "PUBLICADO",
      valorEstimado: 4500000, completionRate: 60, imagenUrl: ""
    },
    {
      id: "4", nombreProyecto: "Complejo Turístico Bahía", categoriaId: 12,
      estadoValidacion: "Verificado", ubicacionTexto: "La Altagracia",
      estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO",
      valorEstimado: 15000000, completionRate: 100, imagenUrl: ""
    }
  ];

  const MOCK_PROVINCES = [
    { id: "1", nombre: "Santo Domingo", latitud: 18.4861, longitud: -69.9312 },
    { id: "2", nombre: "Santiago", latitud: 19.4513, longitud: -70.6970 },
    { id: "3", nombre: "La Altagracia", latitud: 18.5800, longitud: -68.7200 },
  ];

  async function setupMocks(page: Page) {
    // Don't register search route here - let each test register its own
    await page.route("**/api/provinces", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROVINCES),
      });
    });
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "anon", role: "guest", email: "" }),
      });
    });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("about:blank");
    await setupMocks(page);
  });

  test("renders project count and Filtros button", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    await expect(page.getByText("Directorio de Proyectos")).toBeVisible();
    await expect(page.getByText(/4 proyectos publicados/)).toBeVisible();
    const filtrosBtn = page.getByRole("button", { name: /Filtros/i });
    await expect(filtrosBtn).toBeVisible();
  });

  test("filter sidebar is visible by default and contains search input", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    const searchInput = page.locator('input[placeholder="RNC, Cédula, Nombre..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Terra");
    await expect(page.getByText("Residencial Terra Noble")).toBeVisible();
  });

  test("province select filters projects", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    const select = page.locator("select").first();
    await select.selectOption("Santiago");
    await expect(page.getByText("Torre San Gerónimo")).toBeVisible();
    await expect(page.getByText("Residencial Terra Noble")).not.toBeVisible();
  });

  test("cumulative type checkboxes filter correctly", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    // Open the collapsible "Tipo (acumulativo)" filter panel
    await page.getByText("Tipo (acumulativo)").click();
    await page.getByText("COMERCIAL Y OFICINAS").first().click();
    await expect(page.getByText("Torre San Gerónimo")).toBeVisible();
    await expect(page.getByText("Plaza Central Mall")).toBeVisible();
    await expect(page.getByText("Residencial Terra Noble")).not.toBeVisible();
    await page.getByText("VIVIENDAS").first().click();
    await expect(page.getByText("Residencial Terra Noble")).toBeVisible();
  });

  test("price range filters projects", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    const priceSliders = page.locator('input[type="range"]');
    await priceSliders.first().fill("10000000");
    await expect(page.getByText("Torre San Gerónimo")).toBeVisible();
    await expect(page.getByText("Plaza Central Mall")).not.toBeVisible();
  });

test("clear all filters resets to full list", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    await page.locator('input[placeholder="RNC, Cédula, Nombre..."]').fill("NonExistent");
    await expect(page.getByText(/No se encontraron proyectos/)).toBeVisible();
    await page.getByRole("button", { name: /Limpiar filtros/i }).first().click();
    await expect(page.getByText("Residencial Terra Noble")).toBeVisible();
    await expect(page.getByText("Torre San Gerónimo")).toBeVisible();
  });

  test("Filtros button toggles sidebar visibility", async ({ page }) => {
    // Register search route
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROJECTS),
      });
    });
    await page.goto("/#/projects");
    const searchInput = page.locator('input[placeholder="RNC, Cédula, Nombre..."]');
    await expect(searchInput).toBeVisible();
    await page.getByRole("button", { name: /Filtros/i }).click();
    await expect(searchInput).not.toBeVisible();
    await page.getByRole("button", { name: /Filtros/i }).click();
    await expect(searchInput).toBeVisible();
  });

  test("pagination works when many projects", async ({ page }) => {
    const manyProjects = Array.from({ length: 25 }, (_, i) => ({
      ...MOCK_PROJECTS[0],
      id: `${i + 10}`,
      nombreProyecto: `Proyecto ${i + 1}`,
    }));
    // Register search route with larger dataset BEFORE navigation
    await page.route(/\/api\/public\/projects\/search(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(manyProjects),
      });
    });
    await page.goto("/#/projects");
    await expect(page.getByText(/Mostrando/)).toBeVisible();
    // Use blur to trigger the page change (onBlur handler)
    const pageInput = page.locator('input[type="number"]').first();
    await pageInput.fill("2");
    await pageInput.blur();
    await expect(page.getByText("Proyecto 21")).toBeVisible({ timeout: 5000 });
  });
});
