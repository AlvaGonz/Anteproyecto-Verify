import { test, expect } from "@playwright/test";

test.describe("Projects CRUD — E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Intercept /api/auth/me to automatically simulate authenticated state
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "admin@verifinca.do",
          name: "Admin User",
          role: "ADMIN"
        })
      });
    });

    // 2. Default projects mock list
    await page.route("**/api/projects", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "proj-001",
              codigoInterno: "PRJ-001",
              nombre: "Proyecto Inicial Mock",
              ubicacionTexto: "Santo Domingo Este",
              categoria: 1,
              estadoProyecto: 0, // Draft
              estadoIntegridad: 0, // Pending
              usuarioCreadorId: "user-123",
              createdAtUtc: "2026-06-13T00:00:00Z"
            }
          ])
        });
      } else {
        await route.fallback();
      }
    });

    // 3. Default single project detail mock
    await page.route("**/api/projects/proj-001", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "proj-001",
          codigoInterno: "PRJ-001",
          nombre: "Proyecto Inicial Mock",
          ubicacionTexto: "Santo Domingo Este",
          categoria: 1,
          estadoProyecto: 0, // Draft
          estadoIntegridad: 0, // Pending
          usuarioCreadorId: "user-123",
          createdAtUtc: "2026-06-13T00:00:00Z"
        })
      });
    });
  });

  test("CREATE: usuario puede crear un proyecto nuevo", async ({ page }) => {
    // Intercept POST /api/projects for creation
    await page.route("**/api/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "proj-new-123",
            codigoInterno: "PRJ-new",
            nombre: "Proyecto E2E Nuevo",
            ubicacionTexto: "Santiago De Los Caballeros",
            categoria: 2,
            estadoProyecto: 0, // Draft
            estadoIntegridad: 0, // Pending
            usuarioCreadorId: "user-123",
            createdAtUtc: "2026-06-13T00:00:00Z"
          })
        });
      }
    });

    // 1. Navega a /admin/projects/new
    await page.goto("/#/admin/projects/new");

    // 2. Rellena: nombre, ubicacion, categoria, datos desarrollador, designacion catastral
    await page.fill("#nombre", "Proyecto E2E Nuevo");
    await page.fill("#ubicacion", "Santiago De Los Caballeros");
    await page.selectOption("#categoria", "2"); // Comercial
    await page.fill("#desarrollador", "Constructora E2E");
    await page.fill("#catastral", "DC-99999");

    // Intercept GET of newly created project
    await page.route("**/api/projects/proj-new-123", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "proj-new-123",
          codigoInterno: "PRJ-new",
          nombre: "Proyecto E2E Nuevo",
          ubicacionTexto: "Santiago De Los Caballeros",
          categoria: 2,
          estadoProyecto: 0,
          estadoIntegridad: 0,
          usuarioCreadorId: "user-123",
          createdAtUtc: "2026-06-13T00:00:00Z"
        })
      });
    });

    // 3. Click en submit
    await page.click('button:has-text("Guardar")');

    // 4. Expects: toast de éxito visible, redirect a /projects/:id
    await expect(page.locator("text=Proyecto creado exitosamente")).toBeVisible();
    await expect(page).toHaveURL(/.*\/projects\/proj-new-123/);
  });

  test("CREATE: muestra errores de validacion si campos requeridos estan vacios", async ({ page }) => {
    // 1. Navega a /admin/projects/new
    await page.goto("/#/admin/projects/new");

    // 2. Click en submit sin llenar nada
    await page.click('button:has-text("Guardar")');

    // 3. Expects: validacion nativa del navegador impide redireccion y mantiene URL
    await expect(page).toHaveURL(/.*\/admin\/projects\/new/);
    
    // El campo de Nombre debe marcarse como invalido
    const nombreInput = page.locator("#nombre");
    const isInvalid = await nombreInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test("READ: lista de proyectos carga correctamente en /admin/projects", async ({ page }) => {
    // 1. Navega a /admin/projects
    await page.goto("/#/admin/projects");

    // 2. Expects: al menos un card/row de proyecto visible
    await expect(page.locator("text=Proyecto Inicial Mock")).toBeVisible();

    // 3. Expects: no spinner visible tras 2s
    await page.waitForTimeout(2000);
    await expect(page.locator(".animate-spin")).not.toBeVisible();
  });

  test("READ: detalle de proyecto carga al navegar a /projects/:id", async ({ page }) => {
    // 1. Navega a /projects/proj-001 (mock id)
    await page.goto("/#/projects/proj-001");

    // 2. Expects: nombre del proyecto visible en heading (using case-insensitive and robust text matching)
    await expect(page.locator("h1")).toContainText("Proyecto Inicial Mock");

    // 3. Expects: estado del proyecto visible (ej. AUDITORÍA para Pending status)
    await expect(page.getByText("AUDITORÍA", { exact: true })).toBeVisible();
  });

  test("UPDATE: usuario puede editar un proyecto existente", async ({ page }) => {
    let projectDb = {
      id: "proj-001",
      codigoInterno: "PRJ-001",
      nombre: "Proyecto Inicial Mock",
      ubicacionTexto: "Santo Domingo Este",
      categoria: 1,
      estadoProyecto: 0,
      estadoIntegridad: 0,
      usuarioCreadorId: "user-123",
      createdAtUtc: "2026-06-13T00:00:00Z"
    };

    // Intercept both GET and PUT on /api/projects/proj-001
    await page.route("**/api/projects/proj-001", async (route) => {
      if (route.request().method() === "PUT") {
        const payload = route.request().postDataJSON();
        projectDb = { ...projectDb, ...payload };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb)
        });
      }
    });

    // 1. Navega a /admin/projects/:mockId/edit
    await page.goto("/#/admin/projects/proj-001/edit");

    // 2. Expects: formulario pre-cargado con datos existentes
    await expect(page.locator("#nombre")).toHaveValue("Proyecto Inicial Mock");

    // 3. Modifica el campo `nombre`
    await page.fill("#nombre", "Proyecto Inicial Mock Editado");

    // 4. Click en submit
    await page.click('button:has-text("Guardar")');

    // 5. Expects: toast de éxito, redirect a /projects/:id
    await expect(page.locator("text=Proyecto actualizado exitosamente")).toBeVisible();
    await expect(page).toHaveURL(/.*\/projects\/proj-001/);
  });

  test("STATUS: admin puede cambiar estado de un proyecto", async ({ page }) => {
    let patchCalled = false;
    let projectDb = {
      id: "proj-001",
      codigoInterno: "PRJ-001",
      nombre: "Proyecto Inicial Mock",
      ubicacionTexto: "Santo Domingo Este",
      categoria: 1,
      estadoProyecto: 0, // Draft status initially
      estadoIntegridad: 0,
      usuarioCreadorId: "user-123",
      createdAtUtc: "2026-06-13T00:00:00Z"
    };

    // Intercept PATCH status request
    await page.route("**/api/projects/proj-001/status", async (route) => {
      if (route.request().method() === "PATCH") {
        patchCalled = true;
        projectDb.estadoProyecto = 2; // InReview status
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb)
        });
      }
    });

    // Override the GET for proj-001 to return current projectDb
    await page.route("**/api/projects/proj-001", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(projectDb)
      });
    });

    // 1. Navega a /admin/projects/:mockId/edit
    await page.goto("/#/admin/projects/proj-001/edit");

    // 2. Click en botón "InReview"
    await page.click('button:has-text("InReview")');

    // 3. Expects: toast de éxito visible
    await expect(page.locator("text=Estado actualizado exitosamente")).toBeVisible();
    expect(patchCalled).toBe(true);

    // 4. Expects: badge de estado actualizado a "InReview"
    await expect(page.locator("strong:has-text('InReview')")).toBeVisible();
  });
});

