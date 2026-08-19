import { test, expect } from '@playwright/test';

const RULE_8_ID = '00000000-0000-0000-0000-000000000008';

test.describe('Regla 8: Tolerancia Superficie vs Mensura (Admin Management & 1%, 5%, 20% Thresholds)', () => {
  let savedTolerancePayloads: number[] = [];

  test.beforeEach(async ({ page }) => {
    savedTolerancePayloads = [];

    await page.addInitScript(() => {
      localStorage.setItem('vf_has_session', 'true');
    });

    // Mock Auth
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin-001',
          email: 'admin@verifinca.do',
          nombre: 'Admin',
          apellido: 'Principal',
          role: 'admin',
          aceptoDescargo: true,
          cedula: '001-1234567-8',
          telefono: '809-555-0100',
          plan: 'Empresarial',
          subscriptionStatus: 'active',
        }),
      });
    });

    await page.route('**/api/v1/subscriptions/my-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: 'Empresarial',
          subscriptionStatus: 'active',
          planPrice: 0,
          isGuest: false,
          planLimits: { maxConsultas: -1, maxProyectos: -1, presentacionPublica: true, qrIncluido: true, consultasUsadas: 0, proyectosCreados: 0 }
        }),
      });
    });

    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token' }) });
    });

    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock Rules endpoint
    await page.route('**/api/admin/rules**', async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      // Dynamic Evaluation endpoint
      if (url.includes('/evaluar') && method === 'POST') {
        const body = route.request().postDataJSON();
        const diff = Math.abs(body.superficieProyecto - body.superficieCatastro);
        const ratio = diff / body.superficieCatastro;
        // Default rule tolerance or active threshold
        const umbral = 0.05;
        const cumple = ratio <= umbral;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reglaId: body.reglaId,
            reglaNombre: 'Tolerancia Superficie vs Mensura',
            reglaCodigo: 'RULE-008-SUPERFICIE',
            cumple,
            nivelAlerta: 'Media',
            mensaje: cumple
              ? `Superficie dentro de tolerancia (${(ratio * 100).toFixed(2)}% <= ${(umbral * 100).toFixed(2)}%)`
              : `Superficie fuera de tolerancia (${(ratio * 100).toFixed(2)}% > ${(umbral * 100).toFixed(2)}%)`,
            valorCalculado: ratio,
            valorUmbral: umbral,
            superficieProyecto: body.superficieProyecto,
            superficieCatastro: body.superficieCatastro,
            diferenciaAbsoluta: diff,
          }),
        });
        return;
      }

      if (url.endsWith(`/${RULE_8_ID}`) && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: RULE_8_ID,
            codigo: 'RULE-008-SUPERFICIE',
            nombre: 'Tolerancia Superficie vs Mensura',
            descripcion: 'Valida que la diferencia entre la superficie declarada y catastro no exceda la tolerancia configurada.',
            condicionLogica: 'Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= 0.05',
            expresion: '|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia',
            valorUmbral: 0.05,
            minValor: 0.01,
            maxValor: 0.20,
            tipoDocumentoAplicable: 'PlanoMensuraCatastral',
            nivelAlerta: 'Media',
            tipoProyecto: 'Residencial',
            activa: true,
            version: 1,
            fechaCreacionUtc: '2026-01-01T00:00:00Z',
            rowVersion: 'AQIDBAUGBwg=',
          }),
        });
        return;
      }

      if (url.includes(`/${RULE_8_ID}`) && method === 'PUT') {
        const body = route.request().postDataJSON();
        if (body.valorUmbral !== undefined) {
          savedTolerancePayloads.push(body.valorUmbral);
        }

        if (body.valorUmbral === 0.09) {
          // Simulate Concurrency Conflict (409)
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              mensaje: 'La regla fue modificada por otro usuario. Recarga la página para ver los cambios más recientes.',
            }),
          });
        } else {
          await route.fulfill({ status: 204 });
        }
        return;
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: RULE_8_ID,
              codigo: 'RULE-008-SUPERFICIE',
              nombre: 'Tolerancia Superficie vs Mensura',
              descripcion: 'Valida que la diferencia entre la superficie declarada y catastro no exceda la tolerancia configurada.',
              condicionLogica: 'Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= 0.05',
              expresion: '|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia',
              valorUmbral: 0.05,
              minValor: 0.01,
              maxValor: 0.20,
              tipoDocumentoAplicable: 'PlanoMensuraCatastral',
              nivelAlerta: 'Media',
              tipoProyecto: 'Residencial',
              activa: true,
              version: 1,
              fechaCreacionUtc: '2026-01-01T00:00:00Z',
              rowVersion: 'AQIDBAUGBwg=',
            },
          ]),
        });
        return;
      }

      await route.continue();
    });
  });

  test('1. Tarjeta de administración: ajusta tolerancias al 1%, 5% y 20% y guarda en /admin/rules', async ({ page }) => {
    await page.goto('http://localhost:3000/#/admin/rules');
    await page.waitForSelector('text=Tolerancia Superficie vs Mensura', { timeout: 15000 });

    const card = page.locator('.vf-card', { hasText: 'Tolerancia Superficie vs Mensura' });

    // Probar el funcionamiento del Toggle de Activa/Inactiva
    const toggleBtn = card.locator('#rule-active-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(card.locator('text=Activa').first()).toBeVisible();
    await toggleBtn.click();
    await expect(card.locator('text=Inactiva').first()).toBeVisible();
    await toggleBtn.click();
    await expect(card.locator('text=Activa').first()).toBeVisible();

    // Estado inicial: 5% por defecto
    await expect(card.locator('text=5.0%').first()).toBeVisible();

    const rangeInput = card.locator('input[type="range"]');

    // Cambiar a 1.0% (mínimo permitido)
    await rangeInput.fill('0.01');
    await expect(card.locator('text=1.0%').first()).toBeVisible();
    await card.locator('#save-tolerance-btn').click();
    await expect(card.locator('text=Guardado')).toBeVisible({ timeout: 5000 });

    // Cambiar a 20.0% (máximo permitido)
    await rangeInput.fill('0.2');
    await expect(card.locator('text=20.0%').first()).toBeVisible();
    await card.locator('#save-tolerance-btn').click();
    await expect(card.locator('text=Guardado')).toBeVisible({ timeout: 5000 });

    // Validar payloads enviados al backend
    expect(savedTolerancePayloads).toContain(0.01);
    expect(savedTolerancePayloads).toContain(0.20);
  });

  test('2. Vista de edición y Sandbox: evalúa discrepancias con umbrales al 1%, 5% y 20%', async ({ page }) => {
    await page.goto(`http://localhost:3000/#/admin/rules/${RULE_8_ID}/edit`);
    await page.waitForSelector('#tolerance-number-input', { timeout: 15000 });

    const numberInput = page.locator('#tolerance-number-input');
    const supProyectoInput = page.locator('#sim-sup-declarada');
    const supCatastroInput = page.locator('#sim-sup-catastro');

    // Test del toggle Activa/Inactiva en vista edición
    const toggleBtn = page.locator('#rule-active-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(page.locator('text=Activa para validaciones').first()).toBeVisible();
    await toggleBtn.click();
    await expect(page.locator('text=Inactiva (Omitida)').first()).toBeVisible();
    await toggleBtn.click();
    await expect(page.locator('text=Activa para validaciones').first()).toBeVisible();

    // --- Caso A: Tolerancia estricta al 1% (0.01) ---
    await numberInput.fill('0.01');
    await supCatastroInput.fill('1000');

    // Desviación 0.5% (1005m² vs 1000m²) -> Cumple al 1%
    await supProyectoInput.fill('1005');
    await expect(page.locator('text=Cumple la Regla')).toBeVisible();
    await expect(page.locator('text=0.50% ≤ 1.00%')).toBeVisible();

    // Desviación 2.0% (1020m² vs 1000m²) -> Fuera de Rango al 1%
    await supProyectoInput.fill('1020');
    await expect(page.locator('text=Fuera de Rango')).toBeVisible();
    await expect(page.locator('text=2.00% > 1.00%')).toBeVisible();

    // --- Caso B: Tolerancia estándar al 5% (0.05) ---
    await numberInput.fill('0.05');

    // Desviación 4.0% (1040m² vs 1000m²) -> Cumple al 5%
    await supProyectoInput.fill('1040');
    await expect(page.locator('text=Cumple la Regla')).toBeVisible();
    await expect(page.locator('text=4.00% ≤ 5.00%')).toBeVisible();

    // Desviación 8.0% (1080m² vs 1000m²) -> Fuera de Rango al 5%
    await supProyectoInput.fill('1080');
    await expect(page.locator('text=Fuera de Rango')).toBeVisible();
    await expect(page.locator('text=8.00% > 5.00%')).toBeVisible();

    // --- Caso C: Tolerancia amplia al 20% (0.20) ---
    await numberInput.fill('0.20');

    // Desviación 18.0% (1180m² vs 1000m²) -> Cumple al 20%
    await supProyectoInput.fill('1180');
    await expect(page.locator('text=Cumple la Regla')).toBeVisible();
    await expect(page.locator('text=18.00% ≤ 20.00%')).toBeVisible();

    // Desviación 25.0% (1250m² vs 1000m²) -> Fuera de Rango al 20%
    await supProyectoInput.fill('1250');
    await expect(page.locator('text=Fuera de Rango')).toBeVisible();
    await expect(page.locator('text=25.00% > 20.00%')).toBeVisible();

    // Guardar regla con tolerancia al 20%
    await page.click('#save-rule-btn');
    await expect(page.locator('span:has-text("Regla actualizada exitosamente")')).toBeVisible({ timeout: 5000 });
    expect(savedTolerancePayloads).toContain(0.20);
  });

  test('3. Guardrails y límites legales: rechaza valores fuera de [1%, 20%]', async ({ page }) => {
    await page.goto(`http://localhost:3000/#/admin/rules/${RULE_8_ID}/edit`);
    await page.waitForSelector('#tolerance-number-input', { timeout: 15000 });

    const numberInput = page.locator('#tolerance-number-input');

    // Probar valor por debajo de 1% (0.005 = 0.5%)
    await numberInput.fill('0.005');
    await page.click('#save-rule-btn');
    await expect(page.locator('span:has-text("La tolerancia mínima permitida es 1% (0.01)")')).toBeVisible();

    // Probar valor por encima de 20% (0.25 = 25%)
    await numberInput.fill('0.25');
    await page.click('#save-rule-btn');
    await expect(page.locator('span:has-text("La tolerancia máxima permitida es 20% (0.20)")')).toBeVisible();

    // Restaurar a 1% válido y guardar
    await numberInput.fill('0.01');
    await page.click('#save-rule-btn');
    await expect(page.locator('span:has-text("Regla actualizada exitosamente")')).toBeVisible({ timeout: 5000 });
  });

  test('4. Manejo de conflicto de concurrencia (HTTP 409)', async ({ page }) => {
    await page.goto(`http://localhost:3000/#/admin/rules/${RULE_8_ID}/edit`);
    await page.waitForSelector('#tolerance-number-input', { timeout: 15000 });

    // Modificar a 0.09 (gatilla simulación de conflicto 409)
    await page.fill('#tolerance-number-input', '0.09');
    await page.click('#save-rule-btn');

    await expect(page.locator('strong:has-text("La regla fue modificada por otro usuario")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Recargar Regla')).toBeVisible();
  });
});
