import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth to simulate admin user
    await page.route(/.*\/api\/auth\/me.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ 
          id: "admin-001", 
          email: "admin@verifinca.do", 
          name: "Admin User", 
          role: "admin", 
          aceptoDescargo: true
        })
      });
    });

    // Mock auth refresh
    await page.route(/.*\/api\/auth\/refresh.*/, async (route) => {
      console.log('Intercepted auth refresh request');
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ 
          accessToken: "fake-jwt-token", 
          user: { id: "admin-001", email: "admin@verifinca.do", role: "admin" } 
        })
      });
    });

// Mock dashboard stats endpoint
    await page.route(/.*\/api\/admin\/dashboard\/stats.*/, async (route) => {
      console.log('Intercepted dashboard stats request');
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalUsuarios: 150,
          suscripcionesActivas: 85,
          ingresosMensualesEstimados: 4250.50,
          totalProyectos: 42,
          proyectosPendientes: 8,
          proyectosAprobados: 29,
          proyectosRechazados: 5,
          totalConsultasRealizadas: 1250,
          totalProyectosRegistrados: 42,
          totalOfertas: 18,
          usuariosPorPlan: {
            "Corporativo": 25,
            "Empresa": 35,
            "Profesional": 20,
            "Consultor": 5,
            "Invitado": 15
          },
          proyectosPorMes: [
            { year: 2026, month: 1, count: 2 },
            { year: 2026, month: 2, count: 1 },
            { year: 2026, month: 3, count: 3 },
            { year: 2026, month: 4, count: 4 },
            { year: 2026, month: 5, count: 6 },
            { year: 2026, month: 6, count: 8 },
            { year: 2026, month: 7, count: 10 },
            { year: 2026, month: 8, count: 15 },
            { year: 2026, month: 9, count: 12 },
            { year: 2026, month: 10, count: 8 },
            { year: 2026, month: 11, count: 5 },
            { year: 2026, month: 12, count: 3 }
          ],
          suscripcionesRecientes: [
            {
              fechaAlta: "2026-07-20T10:30:00Z",
              plan: "Profesional",
              correo: "usuario1@example.com",
              estado: "Activa"
            }
          ],
          proyectosRecientes: [
            {
              fechaRegistro: "2026-07-15T08:00:00Z",
              nombre: "Residencial Villa del Mar",
              desarrollador: "Constructora ABC SRL",
              estado: "Publicado",
              imagenUrl: "/projects/villa-del-mar.jpg"
            }
          ]
        })
      });
    });
  });

  test('admin dashboard loads successfully', async ({ page }) => {
    await page.goto('/#/admin/dashboard');
    
    // Wait for the dashboard to load
    await expect(page.locator('text=Dashboard Operativo')).toBeVisible();
    
    // Check that the stats cards are present
    await expect(page.locator('p:has-text("Total Proyectos")')).toBeVisible();
    await expect(page.locator('p:has-text("En Revision")')).toBeVisible();
    await expect(page.locator('p:has-text("Publicados")')).toBeVisible();
    await expect(page.locator('p:has-text("Ofertas")')).toBeVisible();
    
    // Check that the sparkline chart is rendered (at least has some SVG content)
    await expect(page.locator('div:has(> h3:has-text("Proyectos por Mes")) >> svg')).toBeVisible();
    
    // Check that tabs are present
    await expect(page.locator('button:has-text("Flujo de Proyectos")')).toBeVisible();
    await expect(page.locator('button:has-text("Flujo de Usuarios")')).toBeVisible();
    
    // Check that recent projects section is present
    await expect(page.locator('text=Proyectos Recientes')).toBeVisible();
  });
   
  test('non-admin dashboard loads successfully', async ({ page }) => {
    // Mock auth to simulate regular user (non-admin)
    await page.route(/.*\/api\/auth\/me.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ 
          id: "user-001", 
          email: "user@verifinca.do", 
          name: "Regular User", 
          role: "user", 
          aceptoDescargo: true
        })
      });
    });

    // Mock auth refresh
    await page.route(/.*\/api\/auth\/refresh.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ 
          accessToken: "fake-jwt-token", 
          user: { id: "user-001", email: "user@verifinca.do", role: "user" } 
        })
      });
    });

    // Mock dashboard stats endpoint (non-admin will get user-scoped stats)
    await page.route(/.*\/api\/admin\/dashboard\/user-stats.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
totalUsuarios: 0, // Non-admin users don't see total users
            suscripcionesActivas: 1,
            ingresosMensualesEstimados: 25.00,
            totalProyectos: 3,
            proyectosPendientes: 1,
            proyectosAprobados: 2,
            proyectosRechazados: 0,
            totalConsultasRealizadas: 45,
            totalProyectosRegistrados: 3,
            totalOfertas: 2,
            usuariosPorPlan: {
              "Profesional": 1
            },
            proyectosPorMes: [
              { year: 2026, month: 6, count: 1 },
              { year: 2026, month: 7, count: 2 }
            ],
            suscripcionesRecientes: [
              {
                fechaAlta: "2026-07-20T10:30:00Z",
                plan: "Profesional",
                correo: "user@verifinca.do",
                estado: "Activa"
              }
            ],
            proyectosRecientes: [
              {
                fechaRegistro: "2026-07-15T08:00:00Z",
                nombre: "Mi Primer Proyecto",
                desarrollador: "Yo Mismo",
                estado: "Publicado",
                imagenUrl: "/projects/mi-proyecto.jpg"
              }
            ]
          })
      });
    });

    await page.goto('/#/admin/dashboard');
    
    // Wait for the dashboard to load
    await expect(page.locator('text=Dashboard Operativo')).toBeVisible();
    
    // Check that the stats cards are present (but with user-scoped data)
    await expect(page.locator('p:has-text("Total Proyectos")')).toBeVisible();
    await expect(page.locator('p:has-text("En Revision")')).toBeVisible();
    await expect(page.locator('p:has-text("Publicados")')).toBeVisible();
    await expect(page.locator('p:has-text("Ofertas")')).toBeVisible();
    
    // Check that the sparkline chart is rendered
    await expect(page.locator('div:has(> h3:has-text("Proyectos por Mes")) >> svg')).toBeVisible();
    
    // Check that recent projects section is present
    await expect(page.locator('text=Proyectos Recientes')).toBeVisible();
  });
});