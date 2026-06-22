# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects\project-crud.spec.ts >> CRUD Proyectos — E2E con Mock >> CREATE — no permite submit con campos requeridos vacíos
- Location: e2e\projects\project-crud.spec.ts:123:3

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByLabel(/Nombre del Proyecto/i)
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByLabel(/Nombre del Proyecto/i)
    14 × locator resolved to <input value="" id="nombre" required="" type="text" class="vf-input py-2.5"/>
       - unexpected value "inactive"

```

```yaml
- textbox "Nombre del Proyecto *"
```

# Test source

```ts
  33  |         body: JSON.stringify({
  34  |           id: "user-001",
  35  |           email: "admin@verifinca.do",
  36  |           name: "Admin User",
  37  |           role: "ADMIN"
  38  |         })
  39  |       });
  40  |     });
  41  | 
  42  |     // 2. Default projects mock list and creation POST route
  43  |     await page.route("**/api/projects", async (route) => {
  44  |       if (route.request().method() === "GET") {
  45  |         await route.fulfill({
  46  |           status: 200,
  47  |           contentType: "application/json",
  48  |           body: JSON.stringify([projectDb])
  49  |         });
  50  |       } else if (route.request().method() === "POST") {
  51  |         const payload = route.request().postDataJSON();
  52  |         const created = {
  53  |           id: "proj-new-123",
  54  |           codigoInterno: "VF-new-2026",
  55  |           estadoProyecto: 0,
  56  |           estadoIntegridad: 0,
  57  |           ...payload
  58  |         };
  59  |         await route.fulfill({
  60  |           status: 200,
  61  |           contentType: "application/json",
  62  |           body: JSON.stringify(created)
  63  |         });
  64  |       }
  65  |     });
  66  | 
  67  |     // 3. Default single project detail mock (GET, PUT, PATCH)
  68  |     await page.route(/\/api\/projects\/proj-/, async (route) => {
  69  |       const method = route.request().method();
  70  |       const url = route.request().url();
  71  |       console.log(`MOCK API INTERCEPT: ${method} ${url}`);
  72  |       if (method === "PUT") {
  73  |         const payload = route.request().postDataJSON();
  74  |         projectDb = { ...projectDb, ...payload };
  75  |         await route.fulfill({
  76  |           status: 200,
  77  |           contentType: "application/json",
  78  |           body: JSON.stringify(projectDb)
  79  |         });
  80  |       } else if (method === "PATCH") {
  81  |         const payload = route.request().postDataJSON();
  82  |         console.log(`MOCK API PATCH payload:`, payload);
  83  |         if (url.endsWith("/status")) {
  84  |           const apiStatus = payload.status;
  85  |           projectDb.estadoProyecto = apiStatus === "Activo" ? 1 : 2; // Published vs InReview
  86  |         }
  87  |         await route.fulfill({
  88  |           status: 200,
  89  |           contentType: "application/json",
  90  |           body: JSON.stringify(projectDb)
  91  |         });
  92  |       } else {
  93  |         await route.fulfill({
  94  |           status: 200,
  95  |           contentType: "application/json",
  96  |           body: JSON.stringify(projectDb)
  97  |         });
  98  |       }
  99  |     });
  100 |   });
  101 | 
  102 |   // ── CREATE ──────────────────────────────────────────────────────────────────
  103 | 
  104 |   test("CREATE — renderiza el formulario en /admin/projects/new", async ({ page }) => {
  105 |     await page.goto("/#/admin/projects/new");
  106 |     await expect(page.getByText(/Crear Nuevo Proyecto/i)).toBeVisible();
  107 |     await expect(page.getByLabel(/Nombre del Proyecto/i)).toBeVisible();
  108 |     await expect(page.getByLabel(/Ubicación/i)).toBeVisible();
  109 |     await expect(page.getByRole("button", { name: /Guardar/i })).toBeVisible();
  110 |   });
  111 | 
  112 |   test("CREATE — usuario puede crear un proyecto nuevo y es redirigido", async ({ page }) => {
  113 |     await page.goto("/#/admin/projects/new");
  114 | 
  115 |     await page.getByLabel(/Nombre del Proyecto/i).fill("Proyecto Playwright Test");
  116 |     await page.getByLabel(/Ubicación/i).fill("La Romana, RD");
  117 |     await page.getByRole("button", { name: /Guardar/i }).click();
  118 | 
  119 |     // After successful create, should navigate to /projects/:newId
  120 |     await expect(page).toHaveURL(/\/projects\/proj-/);
  121 |   });
  122 | 
  123 |   test("CREATE — no permite submit con campos requeridos vacíos", async ({ page }) => {
  124 |     await page.goto("/#/admin/projects/new");
  125 | 
  126 |     // Intentar submit sin llenar nada
  127 |     await page.getByRole("button", { name: /Guardar/i }).click();
  128 | 
  129 |     // Los campos required del HTML5 deben bloquear el submit
  130 |     // El formulario no debe navegar
  131 |     await expect(page).toHaveURL(/\/admin\/projects\/new/);
  132 |     const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
> 133 |     await expect(nombreInput).toBeFocused();
      |                               ^ Error: expect(locator).toBeFocused() failed
  134 |   });
  135 | 
  136 |   // ── READ ─────────────────────────────────────────────────────────────────────
  137 | 
  138 |   test("READ — lista de proyectos carga en /admin/projects", async ({ page }) => {
  139 |     await page.goto("/#/admin/projects");
  140 | 
  141 |     // Espera a que desaparezca cualquier spinner/loading
  142 |     await page.waitForLoadState("networkidle");
  143 | 
  144 |     // Debe haber al menos un proyecto visible (mock data)
  145 |     const projectCard = page.getByRole("heading", { name: "Residencial Las Palmas" }).first();
  146 |     await expect(projectCard).toBeVisible({ timeout: 5000 });
  147 |   });
  148 | 
  149 |   test("READ — detalle de proyecto carga en /projects/:id", async ({ page }) => {
  150 |     await page.goto(`/#/projects/${MOCK_PROJECT_ID}`);
  151 |     await page.waitForLoadState("networkidle");
  152 | 
  153 |     // El nombre del proyecto mock debe aparecer (using case-insensitive and robust text matching)
  154 |     await expect(page.locator("h1")).toContainText("Residencial", { timeout: 5000 });
  155 |   });
  156 | 
  157 |   // ── UPDATE ───────────────────────────────────────────────────────────────────
  158 | 
  159 |   test("UPDATE — formulario de edición se pre-carga con datos del proyecto", async ({ page }) => {
  160 |     await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
  161 |     await page.waitForLoadState("networkidle");
  162 | 
  163 |     await expect(page.getByText(/Editar Proyecto/i)).toBeVisible({ timeout: 5000 });
  164 |     const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
  165 |     await expect(nombreInput).not.toHaveValue("");
  166 |   });
  167 | 
  168 |   test("UPDATE — usuario puede editar y guardar un proyecto", async ({ page }) => {
  169 |     await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
  170 |     await page.waitForLoadState("networkidle");
  171 |     await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });
  172 | 
  173 |     const nombreInput = page.getByLabel(/Nombre del Proyecto/i);
  174 |     await nombreInput.clear();
  175 |     await nombreInput.fill("Proyecto Editado via Playwright");
  176 |     await page.getByRole("button", { name: /Guardar/i }).click();
  177 | 
  178 |     // Redirect to /projects/:id after successful update
  179 |     await expect(page).toHaveURL(new RegExp(`/projects/${MOCK_PROJECT_ID}`), { timeout: 5000 });
  180 |   });
  181 | 
  182 |   // ── STATUS ───────────────────────────────────────────────────────────────────
  183 | 
  184 |   test("STATUS — botones de estado visibles en modo edición", async ({ page }) => {
  185 |     await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
  186 |     await page.waitForLoadState("networkidle");
  187 |     await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });
  188 | 
  189 |     await expect(page.getByRole("button", { name: /InReview/i })).toBeVisible();
  190 |     await expect(page.getByRole("button", { name: /Published/i })).toBeVisible();
  191 |     await expect(page.getByRole("button", { name: /Draft/i })).toBeVisible();
  192 |   });
  193 | 
  194 |   test("STATUS — cambiar estado muestra toast de éxito", async ({ page }) => {
  195 |     await page.goto(`/#/admin/projects/${MOCK_PROJECT_ID}/edit`);
  196 |     await page.waitForLoadState("networkidle");
  197 |     await page.getByText(/Editar Proyecto/i).waitFor({ timeout: 5000 });
  198 | 
  199 |     await page.getByRole("button", { name: /InReview/i }).click();
  200 | 
  201 |     await expect(page.getByText(/actualizado exitosamente/i)).toBeVisible({ timeout: 3000 });
  202 |   });
  203 | });
  204 | 
```