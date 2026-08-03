import { test, expect } from "@playwright/test";

const FIXTURE_PROJECT_ID = "ecc3f121-f494-d477-6ce5-00069f8a27ab";

const STATUS_HISTORY_FIXTURE = [
  {
    id: "hist-001",
    proyectoId: FIXTURE_PROJECT_ID,
    estadoAnterior: null,
    estadoAnteriorNombre: null,
    estadoNuevo: "CREADO",
    estadoNuevoNombre: "Creado",
    usuarioId: "user-001",
    usuarioNombre: "Admin Test",
    fechaCambioUtc: "2026-07-01T10:00:00Z",
  },
  {
    id: "hist-002",
    proyectoId: FIXTURE_PROJECT_ID,
    estadoAnterior: "CREADO",
    estadoAnteriorNombre: "Creado",
    estadoNuevo: "EDITADO",
    estadoNuevoNombre: "Editado",
    usuarioId: "user-001",
    usuarioNombre: "Admin Test",
    fechaCambioUtc: "2026-07-02T14:30:00Z",
  },
  {
    id: "hist-003",
    proyectoId: FIXTURE_PROJECT_ID,
    estadoAnterior: "EDITADO",
    estadoAnteriorNombre: "Editado",
    estadoNuevo: "REVISION",
    estadoNuevoNombre: "En Revisión",
    usuarioId: "user-001",
    usuarioNombre: "Admin Test",
    fechaCambioUtc: "2026-07-03T09:15:00Z",
  },
];

test.describe("Historial de Estatus — Project Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      console.error("BROWSER UNCAUGHT EXCEPTION:", err.message);
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "admin@test.com",
          nombre: "Admin",
          apellido: "Test",
          role: "admin",
          aceptoDescargo: true,
          cedula: "",
          telefono: "",
          plan: "Profesional",
          subscriptionStatus: "active",
        }),
      });
    });

    await page.route("**/api/v1/subscriptions/my-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: "Profesional",
          subscriptionStatus: "active",
          isGuest: false,
        }),
      });
    });

    await page.route(`**/api/projects/${FIXTURE_PROJECT_ID}/status-history`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(STATUS_HISTORY_FIXTURE),
      });
    });

    await page.goto(`/#/admin/projects/${FIXTURE_PROJECT_ID}/reports`);
  });

  test("muestra el heading de Historial de Estatus", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Historial de Estatus" })
    ).toBeVisible();
  });

  test("muestra entradas del historial de transiciones de estado", async ({ page }) => {
    const entries = page.getByTestId("status-history-entry");
    await expect(entries.first()).toBeVisible();
    await expect(entries.first()).toContainText("En Revisión");
  });

  test("el historial se ordena del más reciente al más antiguo", async ({ page }) => {
    const entries = page.getByTestId("status-history-entry");
    await expect(entries.first()).toBeVisible();
    const count = await entries.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const timestamps = await entries.locator("time").allTextContents();
    const dates = timestamps.map((t: string) => new Date(t).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });
});
