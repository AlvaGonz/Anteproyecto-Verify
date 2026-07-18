import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "proj-photos-001";
let projectDb: Record<string, unknown> = {
  id: MOCK_PROJECT_ID,
  codigoInterno: "VF-PHOTOS-2026",
  nombre: "Proyecto Fotos Adicionales",
  ubicacionTexto: "Santo Domingo, RD",
  categoria: 1,
  datosDesarrollador: "Constructora ABC",
  rncDesarrollador: "",
  estadoProyecto: "CREADO",
  estadoIntegridad: 0,
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-01T00:00:00Z",
  imagenUrl: "https://example.com/portada.jpg",
  imagenAdicional1: "https://example.com/foto1.jpg",
  imagenAdicional2: "https://example.com/foto2.jpg",
  imagenAdicional3: "https://example.com/foto3.jpg",
  imagenAdicional4: "",
  imagenAdicional5: null,
};

let capturedPutPayload: Record<string, unknown> | null = null;

test.describe("Persistencia de Imágenes Adicionales — E2E con Mock", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
    page.on("pageerror", (err) => console.error("BROWSER UNCAUGHT EXCEPTION:", err.message));

    capturedPutPayload = null;

    // Auth mocks
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "admin@verifinca.do",
          nombre: "Admin",
          apellido: "User",
          role: "admin",
          plan: "Profesional",
          subscriptionStatus: "active",
        }),
      });
    });

    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "mock-token" }),
      });
    });

    // Projects list mock
    await page.route("**/api/projects", async (route) => {
      const url = route.request().url();
      // Only handle the exact collection URL (no path after /api/projects)
      if (route.request().method() === "GET" && /\/api\/projects(\?|$)/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([projectDb]),
        });
        return;
      }
      // Fall through to other handlers for sub-paths like /api/projects/:id
      await route.fallback();
    });

    // Project detail + PUT capture
    await page.route("**/api/projects/**", async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === "PUT") {
        capturedPutPayload = route.request().postDataJSON();
        projectDb = { ...projectDb, ...capturedPutPayload };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb),
        });
      } else if (url.endsWith("/status-eligibility")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            documentCount: 0,
            hasObservaciones: false,
            currentStatus: projectDb.estadoProyecto,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(projectDb),
        });
      }
    });

    // Mock image URLs so they don't 404
    await page.route(/https:\/\/example\.com\/.*\.jpg/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "base64",
        ),
      });
    });
  });

  test("UPDATE — envía imagenAdicional1-5 en el PUT y los persiste", async ({ page }) => {
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    // Change a field that IS in the form to trigger a save
    const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
    await nombreInput.clear();
    await nombreInput.fill("Proyecto Actualizado");

    // Click submit and wait for PUT to be captured
    await page.getByRole("button", { name: /Guardar Proyecto/i }).click();
    await expect(async () => {
      expect(capturedPutPayload).not.toBeNull();
    }).toPass({ timeout: 5000 });

    // Verify the PUT payload contained the ImagenAdicional fields
    expect(capturedPutPayload!.imagenAdicional1).toBe("https://example.com/foto1.jpg");
    expect(capturedPutPayload!.imagenAdicional2).toBe("https://example.com/foto2.jpg");
    expect(capturedPutPayload!.imagenAdicional3).toBe("https://example.com/foto3.jpg");
  });

  test("UPDATE — PUT preserva valores vacíos y nulos correctamente", async ({ page }) => {
    // Modify projectDb to have a mix of values
    projectDb = {
      ...projectDb,
      imagenAdicional1: "https://example.com/keep.jpg",
      imagenAdicional2: "",
      imagenAdicional3: null,
      imagenAdicional4: "",
      imagenAdicional5: null,
    };

    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    // Submit without changes
    await page.getByRole("button", { name: /Guardar Proyecto/i }).click();
    await expect(async () => {
      expect(capturedPutPayload).not.toBeNull();
    }).toPass({ timeout: 5000 });

    expect(capturedPutPayload!.imagenAdicional1).toBe("https://example.com/keep.jpg");
    expect(capturedPutPayload!.imagenAdicional2).toBe("");
    expect(capturedPutPayload!.imagenAdicional3).toBeNull();
    expect(capturedPutPayload!.imagenAdicional4).toBe("");
    expect(capturedPutPayload!.imagenAdicional5).toBeNull();
  });

  test("GET — devuelve imagenAdicional1-5 en el detalle del proyecto", async ({ page }) => {
    projectDb = {
      ...projectDb,
      imagenAdicional1: "https://example.com/foto-a.jpg",
      imagenAdicional2: "https://example.com/foto-b.jpg",
      imagenAdicional3: "https://example.com/foto-c.jpg",
      imagenAdicional4: "https://example.com/foto-d.jpg",
      imagenAdicional5: "https://example.com/foto-e.jpg",
    };

    // Navigate to edit form — triggers GET /api/projects/:id
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });

    // Submit without changes
    await page.getByRole("button", { name: /Guardar Proyecto/i }).click();
    await expect(async () => {
      expect(capturedPutPayload).not.toBeNull();
    }).toPass({ timeout: 5000 });

    // Verify PUT payload has all 5 images preserved
    expect(capturedPutPayload!.imagenAdicional1).toBe("https://example.com/foto-a.jpg");
    expect(capturedPutPayload!.imagenAdicional2).toBe("https://example.com/foto-b.jpg");
    expect(capturedPutPayload!.imagenAdicional3).toBe("https://example.com/foto-c.jpg");
    expect(capturedPutPayload!.imagenAdicional4).toBe("https://example.com/foto-d.jpg");
    expect(capturedPutPayload!.imagenAdicional5).toBe("https://example.com/foto-e.jpg");
  });
});
