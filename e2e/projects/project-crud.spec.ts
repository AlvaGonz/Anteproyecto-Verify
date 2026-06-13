import { test, expect } from "@playwright/test";

// Todos los tests usan VITE_USE_MOCK=true (datos del mock local)

const MOCK_PROJECT_ID = "proj-001"; // ID definido en src/infrastructure/mock/index.ts

test.describe("CRUD Proyectos — E2E con Mock", () => {
  let projectDb = {
    id: "proj-001",
    codigoInterno: "VF-001-2026",
    nombre: "Residencial Las Palmas",
    ubicacionTexto: "La Romana, RD",
    categoria: 1, // Residencial
    estadoProyecto: 0, // Draft
    estadoIntegridad: 0, // Pending
    usuarioCreadorId: "user-001",
    createdAtUtc: "2026-01-01T00:00:00Z"
  };

  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      console.error("BROWSER UNCAUGHT EXCEPTION:", err.message);
    });

    // 1. Intercept /api/auth/me to automatically simulate authenticated state
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

    // 2. Default projects mock list and creation POST route
    await page.route("**/api/projects", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([projectDb])
        });
      } else if (route.request().method() === "POST") {
        const payload = route.request().postDataJSON();
        const created = {
          id: "proj-new-123",
          codigoInterno: "VF-new-2026",
          estadoProyecto: 0,
          estadoIntegridad: 0,
          ...payload
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(created)
        });
      }
    });

    // 3. Default single project detail mock (GET, PUT, PATCH)
    await page.route(/\/api\/projects\/proj-/, async (route) => {
      const method = route.request().method();
      const url = route.request().url();
      console.log(`MOCK API INTERCEPT: ${method} ${url}`);
      if (method === "PUT") {
        const payload = route.request().postDataJSON();
        projectDb = { ...projectDb, ...payload };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb)
        });
      } else if (method === "PATCH") {
        const payload = route.request().postDataJSON();
        console.log(`MOCK API PATCH payload:`, payload);
        if (url.endsWith("/status")) {
          const apiStatus = payload.status;
          projectDb.estadoProyecto = apiStatus === "Activo" ? 1 : 2; // Published vs InReview
        }
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
  });

  // ── CREATE ──────────────────────────────────────────────────────────────────

  test("CREATE — renderiza el formulario en /admin/projects/new", async ({ page }) => {
    await page.goto("/#/admin/projects/new");
    await expect(page.getByText(/Crear Nuevo Proyecto/i)).toBeVisible();
    await expect(page.getByLabel(/Nombre del Proyecto/i)).toBeVisible();
    await expect(page.getByLabel(/Ubicación/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Guardar/i })).toBeVisible();
  });

  test("CREATE — usuario puede crear un proyecto nuevo y es redirigido", async ({ page }) => {
    await page.goto("/#/admin/projects/new");

    await page.getByLabel(/Nombre del Proyecto/i).fill("Proyecto Playwright Test");
    await page.getByLabel(/Ubicación/i).fill("La Romana, RD");
    await page.getByRole("button", { name: /Guardar/i }).click();

    // After successful create, should navigate to /projects/:newId
    await expect(page).toHaveURL(/\/projects\/proj-/);
  });

  test("CREATE — no permite submit con campos requeridos vacíos", async ({ page }) => {
    await page.goto("/#/admin/projects/new");

    // Intentar submit sin llenar nada
    await page.getByRole("button", { name: /Guardar/i }).click();

    // Los campos required del HTML5 deben bloquear el submit
    // El formulario no debe navegar
    await expect(page).toHaveURL(/\/admin\/projects\/new/);
    const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
    await expect(nombreInput).toBeFocused();
  });

  // ── READ ─────────────────────────────────────────────────────────────────────

  test("READ — lista de proyectos carga en /admin/projects", async ({ page }) => {
    await page.goto("/#/admin/projects");

    // Espera a que desaparezca cualquier spinner/loading
    await page.waitForLoadState("networkidle");

    // Debe haber al menos un proyecto visible (mock data)
    const projectCard = page.getByRole("heading", { name: "Residencial Las Palmas" }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
  });

  test("READ — detalle de proyecto carga en /projects/:id", async ({ page }) => {
    await page.goto(`/#/projects/${MOCK_PROJECT_ID}`);
    await page.waitForLoadState("networkidle");

    // El nombre del proyecto mock debe aparecer (using case-insensitive and robust text matching)
    await expect(page.locator("h1")).toContainText("Residencial", { timeout: 5000 });
  });

  // ── UPDATE ───────────────────────────────────────────────────────────────────

  test("UPDATE — formulario de edición se pre-carga con datos del proyecto", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Editar Proyecto/i)).toBeVisible({ timeout: 5000 });
    const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
    await expect(nombreInput).not.toHaveValue("");
  });

  test("UPDATE — usuario puede editar y guardar un proyecto", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.waitForLoadState("networkidle");
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
    await nombreInput.clear();
    await nombreInput.fill("Proyecto Editado via Playwright");
    await page.getByRole("button", { name: /Guardar/i }).click();

    // Redirect to /projects/:id after successful update
    await expect(page).toHaveURL(new RegExp(`/projects/${MOCK_PROJECT_ID}`), { timeout: 5000 });
  });

  // ── STATUS ───────────────────────────────────────────────────────────────────

  test("STATUS — botones de estado visibles en modo edición", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.waitForLoadState("networkidle");
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    await expect(page.getByRole("button", { name: /InReview/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Published/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Draft/i })).toBeVisible();
  });

  test("STATUS — cambiar estado muestra toast de éxito", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.waitForLoadState("networkidle");
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    await page.getByRole("button", { name: /InReview/i }).click();

    await expect(page.getByText(/actualizado exitosamente/i)).toBeVisible({ timeout: 3000 });
  });
});
