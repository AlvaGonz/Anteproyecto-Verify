import { test, expect, request as apiRequest } from "@playwright/test";
import type { Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Documentos MOC seedeados (TDD ROJO)
// Spec: los 10 proyectos del seeder + "Torre Playa Dorada Beach" deben tener
// los 6 documentos MOC de test_docs/ (Título, Estado Jurídico, Mensura,
// Cédula, Certificación IPI, Poder Notarial).
// Assertion web-first sobre la página de validación del admin
// (/#/admin/projects/{id}/validations → RequiredDocumentsList): cada fila
// requirement-row-* está "subida" cuando el documento existe (muestra el
// <select> de asignación en vez del botón "Subir").
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:5000";
const ADMIN_EMAIL = "admin@verifinca.do";
const ADMIN_PASSWORD = "AdminVerifinca2026!";

const SEED_PROJECT_NAMES = [
  "Torre Bella Vista Piantini",
  "Residencial Los Cacicazgos",
  "Proyecto Costero La Romana",
  "Condominio Oasis",
  "Plaza del Sol",
  "Torre Lumiere",
  "Residencial Altos del Mar",
  "Villa Costa Marina",
  "Plaza Comercial Norte",
  "Condominio Vista Bella",
];

const TORRE_PLAYA_DORADA = "Torre Playa Dorada Beach";

// Los 6 tipos MOC en el orden del checklist (RequiredDocumentsList)
const REQUIREMENT_CODES = ["titulo", "estado_juridico", "mensura", "cedula", "certificacion_ipi", "poder"];

// Login fresco por test: el backend rota el refreshToken en cada /auth/refresh,
// así que un storageState compartido queda invalidado para el siguiente test.
async function newAuthedContext(browser: import("@playwright/test").Browser) {
  const ctx = await apiRequest.newContext({ baseURL: API_BASE });
  const res = await ctx.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok()) throw new Error(`Login falló (${res.status()}) — ¿backend arriba?`);
  const state = await ctx.storageState();
  await ctx.dispose();
  return browser.newContext({ storageState: state });
}

async function resolveProjectId(projectName: string, authState: string): Promise<string> {
  const ctx = await apiRequest.newContext({
    baseURL: API_BASE,
    storageState: JSON.parse(authState),
  });
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await ctx.get(`/api/projects?page=${page}&pageSize=100`);
      if (!res.ok()) throw new Error(`GET /api/projects falló (${res.status()})`);
      const body = (await res.json()) as { items: Array<{ id: string; nombre: string }> };
      const match = body.items.find((p) => p.nombre === projectName);
      if (match) return match.id;
      if (body.items.length === 0) break;
    }
    throw new Error(`Proyecto "${projectName}" no encontrado en /api/projects`);
  } finally {
    await ctx.dispose();
  }
}

async function expectSixMocDocuments(page: Page, projectId: string) {
  await page.goto(`/#/admin/projects/${projectId}/validations`);
  for (const code of REQUIREMENT_CODES) {
    const row = page.getByTestId(`requirement-row-${code}`);
    // La página de validación gatea sobre 3 APIs (resultado, hallazgos, auditoría) — margen amplio
    await expect(row).toBeVisible({ timeout: 20_000 });
    // Estado subido = sin botón "Subir" (solo se renderiza si el documento falta)
    await expect(row.getByRole("button", { name: "Subir", exact: true })).toHaveCount(0, { timeout: 20_000 });
  }
}

test.describe("Documentos MOC seedeados", () => {
  test.describe.configure({ mode: "serial" });

  for (const name of SEED_PROJECT_NAMES) {
    test(`'${name}' tiene los 6 tipos de documento`, async ({ browser }) => {
      test.setTimeout(90_000);
      const context = await newAuthedContext(browser);
      const page = await context.newPage();
      const authState = JSON.stringify(await context.storageState());
      const projectId = await resolveProjectId(name, authState);
      await expectSixMocDocuments(page, projectId);
      await context.close();
    });
  }

  test(`'${TORRE_PLAYA_DORADA}' tiene los 6 documentos MOC`, async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await newAuthedContext(browser);
    const page = await context.newPage();
    const authState = JSON.stringify(await context.storageState());
    const projectId = await resolveProjectId(TORRE_PLAYA_DORADA, authState);
    await expectSixMocDocuments(page, projectId);
    await context.close();
  });
});
