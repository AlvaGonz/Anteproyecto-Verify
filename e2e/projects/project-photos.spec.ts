import { test, expect } from "@playwright/test";

const MOCK_PROJECT_WITH_PHOTO = {
  id: "proj-with-photo",
  codigoInterno: "VF-PHOTO-2026",
  nombre: "Proyecto Con Foto",
  ubicacionTexto: "Santo Domingo, RD",
  categoria: 1, // Residencial
  estadoProyecto: 0, // Draft
  estadoIntegridad: 0, // Pending
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-01T00:00:00Z",
  imagenUrl: "https://example.com/mock-photo.jpg"
};

const MOCK_PROJECT_WITHOUT_PHOTO = {
  id: "proj-no-photo",
  codigoInterno: "VF-NOPHOTO-2026",
  nombre: "Proyecto Sin Foto",
  ubicacionTexto: "Santiago, RD",
  categoria: 1,
  estadoProyecto: 0,
  estadoIntegridad: 0,
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-02T00:00:00Z",
  imagenUrl: null
};

test.describe("Renderizado de Fotos de Proyecto — E2E con Mock", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Intercept /api/auth/me to automatically simulate authenticated state
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-001",
          email: "admin@verifinca.do",
          name: "Admin User",
          role: "admin", aceptoDescargo: true})
      });
    await page.route('**/api/v1/subscriptions/my-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: 'Profesional',
          subscriptionStatus: 'active',
          planPrice: 0,
          isGuest: false,
          inviterPlan: null,
          inviterName: null,
          planLimits: {
            maxConsultas: -1,
            maxProyectos: -1,
            presentacionPublica: true,
            qrIncluido: true,
            maxUsuariosSecundarios: -1,
            maxAlmacenamientoMb: -1,
            alertasTiempoReal: true,
            modeloLm: true,
            validacionLote: true,
            exportacionExcel: true,
            exportacionPdf: true,
            integracionCrm: true,
            soporteTipo: 'Prioritario',
            accesoApi: true,
            consultasUsadas: 0,
            proyectosCreados: 0
          }
        })
      });
    });
    });

    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: "mock-token" })
      });
    });

    // 2. Default projects mock list
    await page.route(/\/api\/projects(\?.*)?$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([MOCK_PROJECT_WITH_PHOTO, MOCK_PROJECT_WITHOUT_PHOTO])
        });
      }
    });

    // 3. Intercept mock image to prevent onError fallback
    await page.route("https://example.com/mock-photo.jpg", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "base64"
        )
      });
    });
  });

  test("Listado muestra foto si imagenUrl existe y placeholder si es null", async ({ page }) => {
    await page.goto("/#/admin/projects");
    await page.waitForLoadState("networkidle");

    // Proyecto con foto
    const projectWithPhoto = page.locator('.vf-card', { hasText: 'Proyecto Con Foto' });
    await expect(projectWithPhoto).toBeVisible();
    
    // Verificamos que la imagen se está renderizando con el src correcto
    const img = projectWithPhoto.locator('img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', 'https://example.com/mock-photo.jpg');
    await expect(img).toHaveAttribute('alt', 'Portada de Proyecto Con Foto');

    // Proyecto sin foto
    const projectNoPhoto = page.locator('.vf-card', { hasText: 'Proyecto Sin Foto' });
    await expect(projectNoPhoto).toBeVisible();
    
    // Verificamos que no hay tag img, sino el div placeholder (role="img")
    await expect(projectNoPhoto.locator('img')).toHaveCount(0);
    const placeholder = projectNoPhoto.locator('div[role="img"]');
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toHaveAttribute('aria-label', 'Sin imagen de portada para Proyecto Sin Foto');
  });
});
