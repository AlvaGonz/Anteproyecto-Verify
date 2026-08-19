import { test, expect } from "@playwright/test";

const MOCK_PROJECT_ID = "6ee5ffba-8b00-492c-b4e0-01ce58a59bde";
const MOCK_DOCUMENT_ID = "doc-titulo-001";

test.describe("Global Discrepancy Validation Toggle E2E (TDD Gate)", () => {
  let globalDiscrepancyEnabled = true;

  test.beforeEach(async ({ page }) => {
    globalDiscrepancyEnabled = true;

    await page.addInitScript(() => {
      localStorage.setItem("vf_has_session", "true");
    });

    // Mock Admin Auth
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "admin-user-001",
          email: "admin@verifinca.do",
          nombre: "Admin",
          apellido: "Principal",
          role: "admin",
          aceptoDescargo: true,
          plan: "Empresarial",
          subscriptionStatus: "active",
        }),
      });
    });

    await page.route("**/api/v1/subscriptions/my-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: "Empresarial",
          subscriptionStatus: "active",
          planPrice: 0,
          isGuest: false,
          planLimits: { maxConsultas: -1, maxProyectos: -1 },
        }),
      });
    });

    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: "mock-token" }) });
    });

    await page.route("**/api/notifications*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    // Mock Global Discrepancy Rule Endpoints
    await page.route("**/api/validationrules/global/discrepancy-enabled**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(globalDiscrepancyEnabled),
        });
        return;
      }
      if (method === "PUT") {
        const body = route.request().postDataJSON();
        globalDiscrepancyEnabled = !!body.enabled;
        await route.fulfill({ status: 204 });
        return;
      }
      await route.continue();
    });

    // Mock Admin Rules list
    await page.route("**/api/admin/rules**", async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (url.includes("/global/discrepancy-enabled")) {
        if (method === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(globalDiscrepancyEnabled),
          });
          return;
        }
        if (method === "PUT") {
          const body = route.request().postDataJSON();
          globalDiscrepancyEnabled = !!body.enabled;
          await route.fulfill({ status: 204 });
          return;
        }
      }

      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "00000000-0000-0000-0000-000000000008",
              codigo: "RULE-008-SUPERFICIE",
              nombre: "Tolerancia Superficie vs Mensura",
              descripcion: "Valida tolerancia de superficie",
              valorUmbral: 0.05,
              activa: true,
              nivelAlerta: "Media",
            },
          ]),
        });
        return;
      }
      await route.continue();
    });

    // Mock Project Details (with Matricula: 12345)
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_PROJECT_ID,
          nombre: "Torre Bella Vista",
          ubicacionTexto: "La Romana",
          matricula: "12345",
          designacionCatastral: "DC-123",
          superficieM2: 1500,
          estadoProyecto: 1,
          categoriaId: 16,
        }),
      });
    });

    // Mock Project Documents (with Matched Document Matricula: 67890 -> Discrepancy!)
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: MOCK_DOCUMENT_ID,
            proyectoId: MOCK_PROJECT_ID,
            tipoDocumento: 21, // CertificadoTitulo
            activo: true,
            estadoDocumento: 2,
            nombreArchivoOriginal: "titulo.pdf",
            certificadoTituloExtraction: {
              processorName: "TituloExtractor",
              processorVersion: "1.0",
              extractionStatus: "Completed",
              provincia: { rawValue: "La Altagracia", normalizedValue: "La Altagracia", status: "Extracted", confidence: 0.99, sourcePage: 1 },
              matricula: { rawValue: "67890", normalizedValue: "67890", status: "Extracted", confidence: 0.99, sourcePage: 1 },
              designacionCatastral: { rawValue: "DC-123", normalizedValue: "DC-123", status: "Extracted", confidence: 0.99, sourcePage: 1 },
              superficieM2: { rawValue: "1500", normalizedValue: "1500", status: "Extracted", confidence: 0.99, sourcePage: 1 },
            },
          },
        ]),
      });
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents/diagnosis`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ requirements: [], documents: [] }) });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/validation-result`, async (route) => {
      await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/findings`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/audit`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route("**/api/geo/provincias", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "romana", nombre: "La Romana" },
          { id: "altagracia", nombre: "La Altagracia" },
        ]),
      });
    });
  });

  test.afterEach(async () => {
    globalDiscrepancyEnabled = true;
  });

  test("1. Admin sees Global Discrepancy Toggle in /admin/rules with correct ARIA attributes", async ({ page }) => {
    await page.goto("http://localhost:3000/#/admin/rules");
    await page.waitForSelector('[data-testid="discrepancy-validation-toggle"]', { timeout: 10000 });

    const toggle = page.getByTestId("discrepancy-validation-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("role", "switch");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("discrepancy-validation-status")).toHaveText(/Habilitada|Activa/i);
  });

  test("2. Admin toggles Discrepancy Validation to disabled and state persists across reload", async ({ page }) => {
    await page.goto("http://localhost:3000/#/admin/rules");
    const toggle = page.getByTestId("discrepancy-validation-toggle");
    await expect(toggle).toBeVisible();

    // Toggle off
    const putRequestPromise = page.waitForRequest(
      (req) => req.url().includes("discrepancy-enabled") && req.method() === "PUT"
    );
    await toggle.click();

    const putRequest = await putRequestPromise;
    expect(putRequest.postDataJSON()).toEqual({ enabled: false });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("discrepancy-validation-status")).toHaveText(/Deshabilitada|Inactiva/i);

    // Reload page to verify persistence
    await page.reload();
    const reloadedToggle = page.getByTestId("discrepancy-validation-toggle");
    await expect(reloadedToggle).toHaveAttribute("aria-checked", "false");
  });

  test("3. When Discrepancy Validation is ENABLED, discrepancy alert appears on mismatch", async ({ page }) => {
    globalDiscrepancyEnabled = true;
    await page.goto(`http://localhost:3000/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    const card = page.getByTestId("titulo-extraction-card");
    await expect(card).toBeVisible({ timeout: 10000 });

    // Validate button click
    await page.getByRole("button", { name: /Validar contra Estado\/Gobernanza/i }).click();

    // Alert dialog must be shown due to mismatch
    const alertDialog = page.getByRole("alertdialog");
    await expect(alertDialog).toBeVisible();
    await expect(alertDialog).toContainText("matricula");
  });

  test("4. When Discrepancy Validation is DISABLED, comparison is bypassed with warning banner and status skipped", async ({ page }) => {
    globalDiscrepancyEnabled = false;

    // Mock governance verification response when disabled
    await page.route("**/api/gobernanzadedatos/verificar/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isValid: true,
          matchPercentage: 100,
          message: "Validación de discrepancias omitida por configuración administrativa.",
          discrepancyCheck: {
            status: "skipped",
            reason: "disabled_by_admin",
            hasDiscrepancies: null,
            findings: [],
          },
        }),
      });
    });

    await page.goto(`http://localhost:3000/#/admin/projects/${MOCK_PROJECT_ID}/validations`);

    // Banner warning should be visible
    const warningBanner = page.getByTestId("validation-bypass-warning");
    await expect(warningBanner).toBeVisible({ timeout: 10000 });
    await expect(warningBanner).toContainText("Validación de discrepancias omitida");

    const card = page.getByTestId("titulo-extraction-card");
    await expect(card).toBeVisible();

    const verifyReqPromise = page.waitForRequest(
      (req) => req.url().includes("/gobernanzadedatos/verificar/") && req.method() === "POST"
    );

    // Validate directly without prompt dialog
    await page.getByRole("button", { name: /Validar contra Estado\/Gobernanza/i }).click();

    const verifyReq = await verifyReqPromise;
    expect(verifyReq).toBeDefined();

    // No modal should have opened
    const alertDialog = page.getByRole("alertdialog");
    await expect(alertDialog).toBeHidden();
  });

  test("5. Non-admin user receives 403 and cannot toggle discrepancy setting", async ({ page }) => {
    await page.route("**/api/validationrules/global/discrepancy-enabled**", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ mensaje: "Acceso denegado. Se requiere rol de Administrador." }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("http://localhost:3000/#/admin/rules");
    const toggle = page.getByTestId("discrepancy-validation-toggle");
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator("text=Acceso denegado").or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 });
  });

  test("6. Concurrency conflict (HTTP 409) is handled with clear warning", async ({ page }) => {
    await page.route("**/api/validationrules/global/discrepancy-enabled**", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ mensaje: "La configuración fue modificada concurrentemente por otro usuario." }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("http://localhost:3000/#/admin/rules");
    const toggle = page.getByTestId("discrepancy-validation-toggle");
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator("text=modificada concurrentemente").or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 });
  });
});
