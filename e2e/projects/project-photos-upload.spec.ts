import { test, expect } from "@playwright/test";

// Mock del proyecto y sus documentos
const MOCK_PROJECT_ID = "proj-001";
let projectDb = {
  id: MOCK_PROJECT_ID,
  codigoInterno: "VF-001-2026",
  nombre: "Proyecto Fotos E2E",
  ubicacionTexto: "Santo Domingo, RD",
  categoria: 1, // Residencial
  estadoProyecto: 0, // Draft
  estadoIntegridad: 0, // Pending
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-01T00:00:00Z"
};

// Empezamos con el proyecto sin documentos de imagen
let documentsDb: any[] = [];

test.describe("Subida y Persistencia de Fotos de Proyecto — E2E con Mock stateful", () => {
  test.beforeEach(async ({ page }) => {
    // Escuchar errores para debug
    page.on("pageerror", (err) => {
      console.error("BROWSER UNCAUGHT EXCEPTION:", err.message);
    });

    // 1. Interceptar /api/auth/me para usuario autenticado
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
          subscriptionStatus: "active"
        })
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

    // 2. Mock del proyecto en listado (/api/projects) y detalle (/api/projects/proj-001)
    await page.route("**/api/projects", async (route) => {
      if (route.request().method() === "GET") {
        // Enviar con imagenUrl si hay alguna foto subida que sirva de portada
        const portraitDoc = documentsDb.find(d => 
          d.nombreArchivoOriginal.endsWith('.jpg') || 
          d.nombreArchivoOriginal.endsWith('.png')
        );
        
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            { ...projectDb, imagenUrl: portraitDoc ? portraitDoc.fileUrl : null }
          ])
        });
      }
    });

    await page.route(`**/api/projects/${MOCK_PROJECT_ID}`, async (route) => {
      const portraitDoc = documentsDb.find(d => 
        d.nombreArchivoOriginal.endsWith('.jpg') || 
        d.nombreArchivoOriginal.endsWith('.png')
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...projectDb, imagenUrl: portraitDoc ? portraitDoc.fileUrl : null })
      });
    });

    // 3. Mock GET /api/projects/:id/documents para cargar la persistencia actual
    await page.route(`**/api/projects/${MOCK_PROJECT_ID}/documents`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(documentsDb)
        });
      } else if (route.request().method() === "POST") {
        // Mock POST: simular éxito en la subida
        const formData = await route.request().postData(); // en form-data raw
        
        const newDocId = `doc-${Date.now()}`;
        const newDoc = {
          id: newDocId,
          proyectoId: MOCK_PROJECT_ID,
          tipoDocumento: 1, // Simulando valor enviado
          nombreArchivoOriginal: "uploaded-portrait.jpg",
          rutaBlob: `projects/${MOCK_PROJECT_ID}/${newDocId}.jpg`,
          estado: 0,
          hashDocumento: "dummy-hash",
          fileUrl: `https://example.com/mock-uploaded-${newDocId}.jpg`,
          usuarioSubidaId: "user-001",
          uploadedAtUtc: new Date().toISOString()
        };

        // Persistir en nuestra base de datos mock
        documentsDb.push(newDoc);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(newDoc)
        });
      }
    });

    // 4. Interceptar las imágenes mock para que no fallen y devuelvan una imagen real (1x1 px)
    await page.route(/https:\/\/example\.com\/mock-uploaded-/, async (route) => {
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

  // Limpiar la "base de datos" entre tests
  test.afterEach(() => {
    documentsDb = [];
  });

  test("Debería permitir subir una foto de portada, persistirla y usarla de thumbnail en el listado", async ({ page }) => {
    // 1. Navegar a la vista de edición del proyecto
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    // removed networkidle wait

    // Verificar que estemos en la sección de fotos
    const titleFotos = page.getByText("Fotos del Proyecto");
    await expect(titleFotos).toBeVisible();

    // Crear un archivo falso para subir
    const fileBuffer = Buffer.from("fake-image-content");

    // Subir la imagen simulando el input de tipo file oculto de la portada
    // La sección de portada tiene un botón "Agregar portada" que clica un input.
    // Con playwright usamos setInputFiles en el input específico.
    // Hay dos inputs hidden en el componente:
    const fileInput = page.locator('#input-portada');
    await fileInput.setInputFiles({
      name: "test-portada.jpg",
      mimeType: "image/jpeg",
      buffer: fileBuffer,
    });

    // Verificar que aparece la previsualización (un img con src blob:...)
    const pendingThumbnail = page.locator('img[alt="Vista previa de portada"]');
    await expect(pendingThumbnail).toBeVisible();

    // Click en "Guardar Proyecto"
    const btnSubir = page.getByRole("button", { name: /Guardar Proyecto/i });
    await expect(btnSubir).toBeVisible();
    await btnSubir.click();

    // Esperar a que navegue a la lista de proyectos indicando éxito
    await expect(page).toHaveURL(/.*\/#\/admin\/projects$/);

    // 2. Navegar al listado de proyectos y verificar que la foto persiste como thumbnail
    const projectCard = page.locator('.vf-card', { hasText: 'Proyecto Fotos E2E' });
    await expect(projectCard).toBeVisible();

    // Verificamos el thumbnail principal
    const thumbnailImg = projectCard.locator('img');
    await expect(thumbnailImg).toBeVisible();
    await expect(thumbnailImg).toHaveAttribute("src", /https:\/\/example\.com\/mock-uploaded-/);
    await expect(thumbnailImg).toHaveAttribute("alt", "Portada de Proyecto Fotos E2E");

    // 3. Volver a entrar al detalle/edición del proyecto y verificar que la foto persiste
    await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
    // removed networkidle wait
    
    // Verificamos nuevamente "Portada actual" renderizada gracias al GET mockeado
    const actualPortadaPersistida = page.locator('img[alt="Portada actual"]');
    await expect(actualPortadaPersistida).toBeVisible();
    await expect(actualPortadaPersistida).toHaveAttribute("src", /https:\/\/example\.com\/mock-uploaded-/);
  });
});
