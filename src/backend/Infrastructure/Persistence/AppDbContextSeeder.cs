// SEED DE PROTOTIPO — Solo para ambiente de desarrollo
namespace Infrastructure.Persistence;

using System;
using System.Collections.Generic;
using System.IO;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public static class AppDbContextSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<Application.Abstractions.Security.IPasswordHasher>();

        try
        {
            logger.LogInformation("Seeding prototype demo data...");

            await SeedPlanesSuscripcionAsync(context, logger);
            await SeedProyectoEstadosAsync(context, logger);

            var adminUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Administrador",
                apellido: "Principal",
                correoElectronico: "admin@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("AdminVerifinca2026!"),
                rol: UserRole.Administrator,
                telefono: "809-555-1000",
                cedula: "001-1234567-8",
                genero: "M",
                logger: logger);
            adminUser.AsignarPlan(Guid.Parse("99999999-9999-9999-9999-999999999999"));
            adminUser.UpdateProfileExtension("Calle El Conde 102, Zona Colonial", "Distrito Nacional", "admin_vf");
            adminUser.UpdateRnc("131-000001-2", "VeriFinca RD SRL", "VeriFinca", "Servicios inmobiliarios");

            var freemiumUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Freemium",
                correoElectronico: "freemium@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("FreemiumVerifinca2026!"),
                rol: UserRole.User,
                telefono: "809-555-2001",
                cedula: "402-0000001-1",
                genero: "F",
                logger: logger);
            freemiumUser.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
            freemiumUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
            freemiumUser.UpdateProfileExtension("Av. Independencia 55", "Santo Domingo", "freemium_usr");
            freemiumUser.UpdateRnc("131-000007-2");

            var consultorUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Consultor",
                correoElectronico: "consultor@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("ConsultorVerifinca2026!"),
                rol: UserRole.User,
                telefono: "809-555-2002",
                cedula: "402-0000002-1",
                genero: "M",
                logger: logger);
            consultorUser.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2")); // Consultor plan
            consultorUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
            consultorUser.UpdateProfileExtension("Calle Las Palmas 12, Naco", "Distrito Nacional", "consultor_usr");
            consultorUser.UpdateRnc("131-000002-3", "Consultoría Legal RD", "Consultoría Legal");

            var profesionalUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Profesional",
                correoElectronico: "profesional@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("ProfesionalVerifinca2026!"),
                rol: UserRole.User,
                telefono: "809-555-2003",
                cedula: "402-0000003-1",
                genero: "M",
                logger: logger);
            profesionalUser.AsignarPlan(Guid.Parse("66AFDABF-632E-434C-86F4-6F9060D2656F"));
            profesionalUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
            profesionalUser.UpdateProfileExtension("Av. Abraham Lincoln 305", "Distrito Nacional", "profe_usr");
            profesionalUser.UpdateRnc("131-000003-5", "Arquitectura & Desarrollo Pro", "ArquiPro", "Arquitectura");

            var empresaUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Empresa",
                correoElectronico: "empresa@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("EmpresaVerifinca2026!"),
                rol: UserRole.User,
                telefono: "809-555-2004",
                cedula: "402-0000004-1",
                genero: "F",
                logger: logger);
            empresaUser.AsignarPlan(Guid.Parse("41037268-58B6-40A3-A8AE-C18EFE00C7D3"));
            empresaUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
            empresaUser.UpdateProfileExtension("Av. 27 de Febrero 555, Ens. Ozama", "Santo Domingo Este", "empresa_usr");
            empresaUser.UpdateRnc("131-000004-7", "Constructora del Este SRL", "ConstrEste", "Construcción inmobiliaria");

            var corporativoUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Corporativo",
                correoElectronico: "corporativo@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("CorporativoVerifinca2026!"),
                rol: UserRole.User,
                telefono: "809-555-2005",
                cedula: "402-0000005-1",
                genero: "M",
                logger: logger);
            corporativoUser.AsignarPlan(Guid.Parse("F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"));
            corporativoUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
            corporativoUser.UpdateProfileExtension("Calle Gustavo Mejía Ricart 88, Piantini", "Distrito Nacional", "corpo_usr");
            corporativoUser.UpdateRnc("131-000005-9", "Corporación Inmobiliaria RD S.A.", "Corporativo Inmobiliario", "Desarrollo inmobiliario");

            await context.SaveChangesAsync();

            // Create a test user with a known GUID for development/testing
            var testUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var testUser = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == testUserId);
            if (testUser == null)
            {
                testUser = new Usuario(
                    "Test",
                    "User",
                    "test@verifinca.do",
                    passwordHasher.HashPassword("TestVerifinca2026!"),
                    UserRole.User,
                    "809-555-9999",
                    "402-9999999-9");
                testUser.GetType().GetProperty("Id")?.SetValue(testUser, testUserId);
                context.Usuarios.Add(testUser);
                context.Entry(testUser).Property("EmailVerificado").CurrentValue = true;
                context.Entry(testUser).Property("Activo").CurrentValue = true;
                var testAvatar = GetRandomProfilePhoto("M", logger);
                if (testAvatar != null) testUser.UpdateAvatarUrl(testAvatar);
                testUser.UpdateProfileExtension("Calle Test 123, Zona Universitaria", "Distrito Nacional", "test_user");
                testUser.UpdateRnc("131-000006-0", "Test Developer Solutions", "TestDev", "Testing inmobiliario");
                testUser.AsignarPlan(Guid.Parse("66AFDABF-632E-434C-86F4-6F9060D2656F")); // Profesional plan
                testUser.UpdateStripeSubscription(null, "active", DateTime.UtcNow.AddYears(1));
                await context.SaveChangesAsync();
            }

            await SeedLegacyProfilesAndPermissionsAsync(context, logger, adminUser, profesionalUser, freemiumUser);

            var proyectos = new[]
            {
                new { Nombre = "Torre Bella Vista Piantini", Ubicacion = "Ensanche Piantini, Distrito Nacional", Categoria = ProjectCategory.Residencial, Dev = "Constructora ABC", Cat = "DC-12345", Status = ProjectStatus.Publicado },
                new { Nombre = "Residencial Los Cacicazgos", Ubicacion = "Los Cacicazgos, Distrito Nacional", Categoria = ProjectCategory.Residencial, Dev = "Desarrollos Inmobiliarios XYZ", Cat = "DC-67890", Status = ProjectStatus.Creado },
                new { Nombre = "Proyecto Costero La Romana", Ubicacion = "La Romana, RD", Categoria = ProjectCategory.Turistico, Dev = "Grupo Turístico del Este", Cat = "DC-11223", Status = ProjectStatus.Revision },
                new { Nombre = "Condominio Oasis", Ubicacion = "Bávaro, Punta Cana", Categoria = ProjectCategory.Residencial, Dev = "Desarrollos Inmobiliarios", Cat = "DC-22334", Status = ProjectStatus.Publicado },
                new { Nombre = "Plaza del Sol", Ubicacion = "Santiago", Categoria = ProjectCategory.Comercial, Dev = "Grupo Constructor Sur", Cat = "DC-33445", Status = ProjectStatus.Publicado },
                new { Nombre = "Torre Lumiere", Ubicacion = "Santo Domingo Centro", Categoria = ProjectCategory.Residencial, Dev = "Inversiones Caribe", Cat = "DC-44556", Status = ProjectStatus.Publicado },
                new { Nombre = "Residencial Altos del Mar", Ubicacion = "Puerto Plata", Categoria = ProjectCategory.Residencial, Dev = "Constructora del Norte", Cat = "DC-55667", Status = ProjectStatus.Publicado },
                new { Nombre = "Villa Costa Marina", Ubicacion = "Samaná", Categoria = ProjectCategory.Turistico, Dev = "Desarrollos Marinos", Cat = "DC-66778", Status = ProjectStatus.Publicado },
                new { Nombre = "Plaza Comercial Norte", Ubicacion = "Santo Domingo Norte", Categoria = ProjectCategory.Comercial, Dev = "Inmobiliaria del Este", Cat = "DC-77889", Status = ProjectStatus.Publicado },
                new { Nombre = "Condominio Vista Bella", Ubicacion = "La Vega", Categoria = ProjectCategory.Residencial, Dev = "Constructora VIP", Cat = "DC-88990", Status = ProjectStatus.Publicado },
            };

            var proyectoEntities = new List<Proyecto>();
            foreach (var p in proyectos)
            {
                var proyecto = await GetOrCreateProyectoAsync(
                    context,
                    nombre: p.Nombre,
                    ubicacionTexto: p.Ubicacion,
                    usuarioCreadorId: corporativoUser.Id,
                    categoria: p.Categoria,
                    datosDesarrollador: p.Dev,
                    designacionCatastral: p.Cat,
                    status: p.Status);
                proyectoEntities.Add(proyecto);
            }

            await SeedDashboardDummyDataAsync(context, logger, adminUser, corporativoUser, freemiumUser, proyectoEntities);

            var currentInterests = await context.Set<ProyectoInteresado>().CountAsync();
            if (currentInterests < 10)
            {
                logger.LogInformation("Seeding interests...");
                var intereses = new List<ProyectoInteresado>();
                
                // Generar 10 intereses donde corporativo (corporativoUser) es el creador y otros están interesados
                for (int i = 0; i < 5; i++)
                {
                    intereses.Add(new ProyectoInteresado(proyectoEntities[i].Id, corporativoUser.Id, adminUser.Id));
                }
                for (int i = 5; i < 10; i++)
                {
                    intereses.Add(new ProyectoInteresado(proyectoEntities[i].Id, corporativoUser.Id, freemiumUser.Id));
                }

                context.Set<ProyectoInteresado>().AddRange(intereses);
                await context.SaveChangesAsync();
            }
            
            var currentSaved = await context.Set<ProyectoGuardado>().CountAsync();
            if (currentSaved < 10)
            {
                logger.LogInformation("Seeding saved projects...");
                var guardados = new List<ProyectoGuardado>();
                
                // Generar 10 proyectos guardados por el usuario corporativo (corporativoUser)
                for (int i = 0; i < 10; i++)
                {
                    guardados.Add(new ProyectoGuardado(proyectoEntities[i].Id, corporativoUser.Id, corporativoUser.Id));
                }

                context.Set<ProyectoGuardado>().AddRange(guardados);
                await context.SaveChangesAsync();
            }

            try {
                var p1 = proyectoEntities[0];
                var p2 = proyectoEntities[1];
                var p3 = proyectoEntities[2];

                p1.UpdateDetails(p1.Nombre, p1.UbicacionTexto, null, null, p1.Categoria, p1.DatosDesarrollador, p1.DesignacionCatastral, "Propietario Test", "402-1234567-8", "1-01-99999-9");
                p1.UpdateRncYMatricula("1-30-12345-1", "001-02-003");
                await context.SaveChangesAsync();

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p1.Id,
                    usuarioCargaId: profesionalUser.Id,
                    tipo: DocumentType.TITLE,
                    nombreOriginal: "Certificado_Titulo_BellaVista.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Certificado_Titulo_BellaVista.pdf",
                    status: DocumentStatus.Valid);

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p1.Id,
                    usuarioCargaId: profesionalUser.Id,
                    tipo: DocumentType.OTHER,
                    nombreOriginal: "Permiso_Ambiental_BellaVista.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Permiso_Ambiental_BellaVista.pdf",
                    status: DocumentStatus.Valid);

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p2.Id,
                    usuarioCargaId: profesionalUser.Id,
                    tipo: DocumentType.OTHER,
                    nombreOriginal: "Planos_LosCacicazgos.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Planos_LosCacicazgos.pdf",
                    status: DocumentStatus.Uploaded);

                await GetOrCreateValidacionAsync(context, proyectoId: p1.Id, status: ValidationStatus.Completed, esLegitimo: true);
                await GetOrCreateValidacionAsync(context, proyectoId: p3.Id, status: ValidationStatus.Failed, esLegitimo: false);

                await GetOrCreateHallazgoAsync(
                    context,
                    proyectoId: p3.Id,
                    titulo: "Plano de mensura rechazado",
                    descripcion: "Falta firma del agrimensor",
                    severidad: FindingSeverity.Critical,
                    fuente: "Ayuntamiento");

                await GetOrCreateAuditoriaAsync(
                    context,
                    usuarioId: profesionalUser.Id,
                    accion: "ProjectCreated",
                    tipoEvento: "PROYECTO",
                    entidad: "Proyecto",
                    entidadId: p1.Id.ToString(),
                    proyectoId: p1.Id,
                    detalle: "Proyecto Torre Bella Vista Piantini creado");

                await GetOrCreateAuditoriaAsync(
                    context,
                    usuarioId: adminUser.Id,
                    accion: "ValidationExecuted",
                    tipoEvento: "VALIDACION",
                    entidad: "Validacion",
                    entidadId: p1.Id.ToString(),
                    proyectoId: p1.Id,
                    detalle: "Validación interna ejecutada con resultado: Completado");

                var reporte = await GetOrCreateReporteAsync(context, proyectoId: p1.Id, generadoPorUsuarioId: adminUser.Id);
                if (reporte.EstadoReporte != ReportStatus.Published)
                {
                    reporte.UpdateStatus(
                        ReportStatus.Published,
                        resumen: "Reporte interno de validación completado. Sin hallazgos críticos.",
                        detalle: "Proyecto validado para demo.",
                        esApto: true);
                    await context.SaveChangesAsync();
                }

                await GetOrCreateCertificacionAsync(
                    context,
                    proyectoId: p1.Id,
                    reporteId: reporte.Id,
                    emisorId: adminUser.Id,
                    codigoVerificacion: "VF-2026-ABC123XYZ",
                    urlVerificacion: "https://verifinca.do/verify/VF-2026-ABC123XYZ",
                    score: 95,
                    estadoIntegridad: IntegrityStatus.Valid);

                await GetOrCreateSelloIntegridadAsync(
                    context,
                    proyectoId: p1.Id,
                    codigoSello: "VF-2026-ABC123XYZ",
                    nombre: "Sello VeriFinca Oro",
                    nivel: NivelSelloIntegridad.Oro,
                    urlQr: "https://verifinca.do/verify/VF-2026-ABC123XYZ",
                    firmaDigital: "firma-digital-simulada");

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: profesionalUser.Id,
                    mensaje: "El proyecto Torre Bella Vista Piantini ha sido publicado.",
                    tipo: "ProjectPublished",
                    ruta: $"/admin/projects/{p1.Id}",
                    markRead: false);

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: profesionalUser.Id,
                    mensaje: "Validación fallida para Proyecto Costero La Romana.",
                    tipo: "ValidationFailed",
                    ruta: $"/admin/projects/{p3.Id}",
                    markRead: true);
            } catch (Exception ex) {
                logger.LogWarning($"Skipping domain seeding due to missing tables: {ex.Message}");
            }

            logger.LogInformation("Prototype demo data seeding completed successfully.");
            await SeedDgiiAsync(context, logger);

            var config = scope.ServiceProvider.GetService<Microsoft.Extensions.Configuration.IConfiguration>();
            if (config != null && config["IsTestingEnvironment"] == "true")
            {
                logger.LogInformation("Testing environment.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }

    private static async Task SeedPlanesSuscripcionAsync(AppDbContext context, ILogger logger)
    {
        logger.LogInformation("Sincronizando planes de suscripción (Upsert dinámico)...");

        // Única fuente de verdad para los planes
        var expectedPlans = new List<PlanSuscripcion>
        {
            // Administrador
            PlanSuscripcion.Create(
                id: Guid.Parse("99999999-9999-9999-9999-999999999999"), nombrePlan: "Administrador", precio: 0.00m,
                maxConsultas: -1, maxProyectos: -1, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: -1, maxAlmacenamientoMb: -1,
                alertasTiempoRealDisponible: true, modeloLmDisponible: true, validacionLoteDisponible: true,
                exportacionExcelDisponible: true, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Dedicado", accesoApi: true),

            // Consultor
            PlanSuscripcion.Create(
                id: Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"), nombrePlan: "Consultor", precio: 0.00m,
                maxConsultas: 1, maxProyectos: 1, presentacionPublica: false,
                qrIncluido: false, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 0,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: false, integracionCrmDisponible: false,
                soporteTipo: "Comunidad", accesoApi: false),

            // Profesional
            PlanSuscripcion.Create(
                id: Guid.Parse("66AFDABF-632E-434C-86F4-6F9060D2656F"), nombrePlan: "Profesional", precio: 3500.00m,
                maxConsultas: 25, maxProyectos: 5, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 200,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: false,
                soporteTipo: "Email", accesoApi: false),

            // Empresa
            PlanSuscripcion.Create(
                id: Guid.Parse("41037268-58B6-40A3-A8AE-C18EFE00C7D3"), nombrePlan: "Empresa", precio: 10000.00m,
                maxConsultas: 100, maxProyectos: 10, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 5, maxAlmacenamientoMb: 1024,
                alertasTiempoRealDisponible: false, modeloLmDisponible: true, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Prioritario", accesoApi: true),

            // Corporativo
            PlanSuscripcion.Create(
                id: Guid.Parse("F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"), nombrePlan: "Corporativo", precio: 30000.00m,
                maxConsultas: -1, maxProyectos: 50, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 30, maxAlmacenamientoMb: 10240,
                alertasTiempoRealDisponible: true, modeloLmDisponible: true, validacionLoteDisponible: true,
                exportacionExcelDisponible: true, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Account Manager", accesoApi: true)
        };

        var existingPlans = await context.PlanesSuscripcion.ToListAsync();
        bool hasChanges = false;

        foreach (var expected in expectedPlans)
        {
            var existing = existingPlans.FirstOrDefault(p => p.Idsuscripcion == expected.Idsuscripcion);
            if (existing == null)
            {
                context.PlanesSuscripcion.Add(expected);
                hasChanges = true;
            }
            else
            {
                // Sobrescribimos el plan existente con los valores esperados.
                // EF Core (ChangeTracker) es lo suficientemente inteligente para solo marcar el objeto
                // como "Modified" si realmente algún valor cambió, por lo que no ejecutará UPDATEs innecesarios.
                existing.UpdatePlan(
                    expected.NombrePlan, expected.Precio, expected.MaxConsultas, expected.MaxProyectos,
                    expected.PresentacionPublica, expected.QrIncluido, expected.MaxUsuariosSecundarios,
                    expected.MaxAlmacenamientoMb, expected.AlertasTiempoRealDisponible, expected.ModeloLmDisponible,
                    expected.ValidacionLoteDisponible, expected.ExportacionExcelDisponible, expected.ExportacionPdfDisponible,
                    expected.IntegracionCrmDisponible, expected.SoporteTipo, expected.AccesoApi
                );
                
                // Forzamos que se guarden cambios para que el tracker haga el commit si hubo modificaciones.
                hasChanges = true;
            }
        }

        // Lógica de migración legacy para limpiar el plan Consultor viejo
        var consultorLegacy = existingPlans.FirstOrDefault(p => p.Idsuscripcion == Guid.Parse("2E4F281E-47C2-43FF-BF58-9CC3A8C5B321"));
        if (consultorLegacy != null)
        {
            var usersWithLegacy = await context.Usuarios.Where(u => u.PlanSuscripcionId == consultorLegacy.Idsuscripcion).ToListAsync();
            foreach (var u in usersWithLegacy)
            {
                u.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
            }
            
            context.PlanesSuscripcion.Remove(consultorLegacy);
            hasChanges = true;
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedProyectoEstadosAsync(AppDbContext context, ILogger logger)
    {
        if (!await context.ProyectoEstados.AnyAsync())
        {
            logger.LogInformation("Seeding ProyectoEstados...");

            var estados = new List<ProyectoEstado>
            {
                new ProyectoEstado(
                    ProjectStatusCodes.Creado,
                    "Creado",
                    "Estado por defecto al crear un proyecto.",
                    "El proyecto acaba de ser registrado. Requiere completar información y subir documentos obligatorios.",
                    "#9BACD8"), // Soft blue
                new ProyectoEstado(
                    ProjectStatusCodes.Editado,
                    "Editado",
                    "El proyecto ha sido modificado.",
                    "Se ha actualizado información o documentos. Requiere validación de los cambios.",
                    "#F98513"), // Orange/Warning
                new ProyectoEstado(
                    ProjectStatusCodes.Revision,
                    "En Revisión",
                    "Proyecto en proceso de revisión por los asesores.",
                    "Se están verificando los documentos y la información proporcionada. No se pueden realizar cambios.",
                    "#EAB308"), // Yellow/Gold
                new ProyectoEstado(
                    ProjectStatusCodes.Observacion,
                    "Con Observación",
                    "El proyecto tiene observaciones que deben ser corregidas.",
                    "Se han encontrado inconsistencias o faltan documentos. El desarrollador debe subsanar las observaciones.",
                    "#EF4444"), // Red/Error
                new ProyectoEstado(
                    ProjectStatusCodes.Publicado,
                    "Publicado",
                    "Proyecto verificado y publicado exitosamente.",
                    "El proyecto ha pasado todas las validaciones y cuenta con el sello de integridad. Visible para el público.",
                    "#10B981")  // Green/Success
            };

            context.ProyectoEstados.AddRange(estados);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedLegacyProfilesAndPermissionsAsync(AppDbContext context, ILogger logger, Usuario adminUser, Usuario devUser, Usuario publicUser)
    {
        if (!await context.Permisos.AnyAsync())
        {
            logger.LogInformation("Seeding legacy profiles and permissions...");

            var permisos = new List<Permiso>
            {
                new Permiso { IdPermiso = Guid.NewGuid(), Descripcion = "CrearProyectos" },
                new Permiso { IdPermiso = Guid.NewGuid(), Descripcion = "ValidarProyectos" },
                new Permiso { IdPermiso = Guid.NewGuid(), Descripcion = "ConfigurarSistema" },
                new Permiso { IdPermiso = Guid.NewGuid(), Descripcion = "ConsultarSello" }
            };
            context.Permisos.AddRange(permisos);

            var adminPerfil = new Perfil { IdPerfil = Guid.NewGuid(), NombrePerfil = "Administrator" };
            var devPerfil = new Perfil { IdPerfil = Guid.NewGuid(), NombrePerfil = "Professional" };
            var publicPerfil = new Perfil { IdPerfil = Guid.NewGuid(), NombrePerfil = "Consultation" };

            context.Perfiles.AddRange(adminPerfil, devPerfil, publicPerfil);
            await context.SaveChangesAsync();

            foreach (var perm in permisos)
            {
                context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = adminPerfil.IdPerfil, IdPermiso = perm.IdPermiso });
            }

            var pCrear = permisos.FirstOrDefault(p => p.Descripcion == "CrearProyectos");
            if (pCrear != null)
                context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = devPerfil.IdPerfil, IdPermiso = pCrear.IdPermiso });

            var pConsultar = permisos.FirstOrDefault(p => p.Descripcion == "ConsultarSello");
            if (pConsultar != null)
                context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = publicPerfil.IdPerfil, IdPermiso = pConsultar.IdPermiso });

            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedDashboardDummyDataAsync(AppDbContext context, ILogger logger, Usuario adminUser, Usuario devUser, Usuario publicUser, List<Proyecto> projects)
    {
        if (!await context.LogConsultas.AnyAsync())
        {
            logger.LogInformation("Seeding dummy data for dashboard...");

            var today = DateTime.UtcNow;
            
            // Seed some random LogConsultas over the last 30 days
            var random = new Random(1234);
            var logs = new List<LogConsulta>();
            
            for (int i = 0; i < 50; i++)
            {
                var daysAgo = random.Next(0, 30);
                var isDev = random.Next(0, 2) == 0;
                var userId = isDev ? devUser.Id : publicUser.Id;
                
                var logConsulta = new LogConsulta(userId, random.Next(0, 10) > 1, "Consulta automatizada (Seeder)");
                typeof(LogConsulta).GetProperty("FechaConsulta")?.SetValue(logConsulta, today.AddDays(-daysAgo).AddHours(-random.Next(0, 24)));
                logs.Add(logConsulta);
            }
            
            context.LogConsultas.AddRange(logs);
            
            // Seed LogProyectos
            if (projects != null && projects.Any())
            {
                var logProyectos = new List<LogProyecto>();
                for (int i = 0; i < 15; i++)
                {
                    var daysAgo = random.Next(0, 30);
                    var project = projects[random.Next(projects.Count)];
                    
                    var logProyecto = new LogProyecto(devUser.Id, project.Id, "Creacion de proyecto (Seeder)");
                    typeof(LogProyecto).GetProperty("FechaCreacion")?.SetValue(logProyecto, today.AddDays(-daysAgo).AddHours(-random.Next(0, 24)));
                    logProyectos.Add(logProyecto);
                }
                
                context.LogProyectos.AddRange(logProyectos);
            }
            
            await context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Picks a random profile photo from the seed folder. Returns null gracefully when:
    /// - The folder doesn't exist at any known path
    /// - The folder is empty or has no .jpg files
    /// - A file can't be read (corrupt, permissions, etc.)
    /// </summary>
    private static string? GetRandomProfilePhoto(string genero, ILogger? logger = null)
    {
        var subfolder = genero == "M" ? "Hombres" : "Mujeres";

        var possiblePaths = new[]
        {
            // Published output (Docker): content items maintain relative path from project
            Path.Combine(AppContext.BaseDirectory, "Persistence", "SeedData", "ProfilePhotos", subfolder),
            Path.Combine(Directory.GetCurrentDirectory(), "Persistence", "SeedData", "ProfilePhotos", subfolder),
            // Alternative without Persistence prefix (some publish configs strip it)
            Path.Combine(AppContext.BaseDirectory, "SeedData", "ProfilePhotos", subfolder),
            Path.Combine(Directory.GetCurrentDirectory(), "SeedData", "ProfilePhotos", subfolder),
            // Local dev from the Infrastructure project root
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Infrastructure", "Persistence", "SeedData", "ProfilePhotos", subfolder),
            Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "Persistence", "SeedData", "ProfilePhotos", subfolder),
        };

        string? resolvedFolder = null;
        foreach (var p in possiblePaths)
        {
            if (Directory.Exists(p)) { resolvedFolder = p; break; }
        }

        if (resolvedFolder == null)
        {
            logger?.LogWarning("ProfilePhotos folder not found for {Genero}. Tried:\n  {Paths}",
                subfolder, string.Join("\n  ", possiblePaths));
            return null;
        }

        var files = Directory.GetFiles(resolvedFolder, "*.jpg");
        if (files.Length == 0)
        {
            logger?.LogWarning("No .jpg files found in {Folder}", resolvedFolder);
            return null;
        }

        try
        {
            var random = new Random();
            var selected = files[random.Next(files.Length)];
            var bytes = File.ReadAllBytes(selected);
            return $"data:image/jpeg;base64,{Convert.ToBase64String(bytes)}";
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "Failed to read profile photo from {Folder}", resolvedFolder);
            return null;
        }
    }

    private static async Task<Usuario> GetOrCreateUsuarioAsync(
        AppDbContext context,
        string nombre,
        string apellido,
        string correoElectronico,
        string contrasenaHash,
        UserRole rol,
        string telefono,
        string cedula,
        string? genero = null,
        ILogger? logger = null)
    {
        var existing = await context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == correoElectronico);
        Usuario returnUser;
        if (existing != null)
        {
            context.Entry(existing).Property("Nombre").CurrentValue = nombre;
            context.Entry(existing).Property("Apellido").CurrentValue = apellido;
            context.Entry(existing).Property("Telefono").CurrentValue = telefono;
            context.Entry(existing).Property("Cedula").CurrentValue = cedula;
            context.Entry(existing).Property("Rol").CurrentValue = rol;
            context.Entry(existing).Property("ContrasenaHash").CurrentValue = contrasenaHash;
            context.Entry(existing).Property("EmailVerificado").CurrentValue = true;
            context.Entry(existing).Property("Activo").CurrentValue = true;

            if (!string.IsNullOrEmpty(genero) && existing.AvatarUrl == null)
            {
                var avatar = GetRandomProfilePhoto(genero, logger);
                if (avatar != null) existing.UpdateAvatarUrl(avatar);
            }
            
            await context.SaveChangesAsync();
            returnUser = existing;
        }
        else
        {
            var user = new Usuario(nombre, apellido, correoElectronico, contrasenaHash, rol, telefono, cedula);
            context.Usuarios.Add(user);

            if (!string.IsNullOrEmpty(genero))
            {
                var avatar = GetRandomProfilePhoto(genero, logger);
                if (avatar != null) user.UpdateAvatarUrl(avatar);
            }
            
            // Ensure user is marked as verified and active for seeding purposes
            context.Entry(user).Property("EmailVerificado").CurrentValue = true;
            context.Entry(user).Property("Activo").CurrentValue = true;
            
            await context.SaveChangesAsync();
            returnUser = user;
        }

        var hasWelcome = await context.Notificaciones.AnyAsync(n => n.UsuarioId == returnUser.Id && n.Mensaje.Contains("¡Bienvenido a VeriFinca"));
        if (!hasWelcome)
        {
            var welcomeNotification = new Notificacion(
                usuarioId: returnUser.Id,
                mensaje: $"¡Bienvenido a VeriFinca, {returnUser.Nombre}! Tu cuenta ha sido activada correctamente.",
                tipo: "Info",
                enlaceRelacionado: "/dashboard"
            );
            context.Notificaciones.Add(welcomeNotification);
            await context.SaveChangesAsync();
        }

        return returnUser;
    }

    private static async Task<Proyecto> GetOrCreateProyectoAsync(
        AppDbContext context,
        string nombre,
        string ubicacionTexto,
        Guid usuarioCreadorId,
        ProjectCategory categoria,
        string? datosDesarrollador,
        string? designacionCatastral,
        ProjectStatus status)
    {
        var existing = await context.Proyectos.FirstOrDefaultAsync(p => p.Nombre == nombre && p.UsuarioCreadorId == usuarioCreadorId);
        if (existing != null) return existing;

        var estado = await context.ProyectoEstados.FirstOrDefaultAsync(e => e.CodigoUnico == status.ToCodigoUnico());
        if (estado == null) throw new InvalidOperationException($"Estado {status} no encontrado. Asegúrate de ejecutar SeedProyectoEstadosAsync primero.");

        var proyecto = new Proyecto(nombre, ubicacionTexto, usuarioCreadorId, categoria, datosDesarrollador, designacionCatastral);
        proyecto.UpdateEstado(estado);
        context.Proyectos.Add(proyecto);
        await context.SaveChangesAsync();
        return proyecto;
    }

    private static async Task<Documento> GetOrCreateDocumentoAsync(
        AppDbContext context,
        Guid proyectoId,
        Guid usuarioCargaId,
        DocumentType tipo,
        string nombreOriginal,
        string url,
        DocumentStatus status)
    {
        var existing = await context.Documentos.FirstOrDefaultAsync(d =>
            d.ProyectoId == proyectoId && d.NombreArchivoOriginal == nombreOriginal && d.TipoDocumento == tipo);
        if (existing != null) return existing;

        var doc = new Documento(proyectoId, tipo, nombreOriginal, nombreOriginal, url, "application/pdf", ".pdf", 1024 * 256, usuarioCargaId);
        doc.UpdateStatus(status);
        context.Documentos.Add(doc);
        await context.SaveChangesAsync();
        return doc;
    }

    private static async Task<Validacion> GetOrCreateValidacionAsync(
        AppDbContext context,
        Guid proyectoId,
        ValidationStatus status,
        bool esLegitimo)
    {
        var existing = await context.Validaciones.FirstOrDefaultAsync(v => v.ProyectoId == proyectoId && v.FuenteValidacion == "Interna");
        if (existing != null) return existing;

        var v = new Validacion(proyectoId);
        v.UpdateStatus(status, esLegitimo);
        context.Validaciones.Add(v);
        await context.SaveChangesAsync();
        return v;
    }

    private static async Task<Hallazgo> GetOrCreateHallazgoAsync(
        AppDbContext context,
        Guid proyectoId,
        string titulo,
        string descripcion,
        FindingSeverity severidad,
        string fuente)
    {
        var existing = await context.Hallazgos.FirstOrDefaultAsync(h =>
            h.ProyectoId == proyectoId && h.Titulo == titulo && h.Severidad == severidad);
        if (existing != null) return existing;

        var hallazgo = new Hallazgo(proyectoId, null, titulo, descripcion, severidad, null, fuente);
        context.Hallazgos.Add(hallazgo);
        await context.SaveChangesAsync();
        return hallazgo;
    }

    private static async Task<Auditoria> GetOrCreateAuditoriaAsync(
        AppDbContext context,
        Guid usuarioId,
        string accion,
        string tipoEvento,
        string entidad,
        string entidadId,
        Guid proyectoId,
        string detalle)
    {
        var existing = await context.Auditorias.FirstOrDefaultAsync(a =>
            a.UsuarioId == usuarioId && a.Accion == accion && a.ProyectoId == proyectoId);
        if (existing != null) return existing;

        var audit = new Auditoria(usuarioId, accion, tipoEvento, entidad, entidadId, proyectoId, detalle);
        context.Auditorias.Add(audit);
        await context.SaveChangesAsync();
        return audit;
    }

    private static async Task<Reporte> GetOrCreateReporteAsync(
        AppDbContext context,
        Guid proyectoId,
        Guid? generadoPorUsuarioId)
    {
        var existing = await context.Reportes.FirstOrDefaultAsync(r => r.ProyectoId == proyectoId);
        if (existing != null) return existing;

        var reporte = new Reporte(proyectoId, generadoPorUsuarioId, version: 1);
        context.Reportes.Add(reporte);
        await context.SaveChangesAsync();
        return reporte;
    }

    private static async Task<Certificacion> GetOrCreateCertificacionAsync(
        AppDbContext context,
        Guid proyectoId,
        Guid? reporteId,
        Guid emisorId,
        string codigoVerificacion,
        string urlVerificacion,
        int score,
        IntegrityStatus estadoIntegridad)
    {
        var existing = await context.Certificaciones.FirstOrDefaultAsync(c =>
            c.ProyectoId == proyectoId && c.CodigoVerificacion == codigoVerificacion);
        if (existing != null) return existing;

        var entity = new Certificacion(
            proyectoId,
            reporteId,
            codigoVerificacion,
            urlVerificacion,
            score,
            estadoIntegridad,
            emisorId);
        
        context.Certificaciones.Add(entity);
        await context.SaveChangesAsync();
        return entity;
    }

    private static async Task<SelloIntegridad> GetOrCreateSelloIntegridadAsync(
        AppDbContext context,
        Guid proyectoId,
        string codigoSello,
        string nombre,
        NivelSelloIntegridad nivel,
        string urlQr,
        string firmaDigital)
    {
        var existing = await context.SellosIntegridad.FirstOrDefaultAsync(s => 
            s.ProyectoId == proyectoId && s.CodigoSello == codigoSello);
        if (existing != null) return existing;

        var entity = new SelloIntegridad(
            proyectoId,
            codigoSello,
            nombre,
            nivel,
            urlQr,
            firmaDigital);
            
        context.SellosIntegridad.Add(entity);
        await context.SaveChangesAsync();
        return entity;
    }

    private static async Task<Notificacion> GetOrCreateNotificacionAsync(
        AppDbContext context,
        Guid usuarioId,
        string mensaje,
        string tipo,
        string ruta,
        bool markRead)
    {
        var existing = await context.Notificaciones.FirstOrDefaultAsync(n =>
            n.UsuarioId == usuarioId && n.Mensaje == mensaje && n.Tipo == tipo);
        if (existing != null) return existing;

        var notif = new Notificacion(usuarioId, mensaje, tipo, ruta);
        if (markRead) notif.MarkAsRead();
        context.Notificaciones.Add(notif);
        await context.SaveChangesAsync();
        return notif;
    }

    private static async Task SeedDgiiAsync(AppDbContext context, ILogger logger)
    {
        if (await context.DGII.AnyAsync())
        {
            logger.LogInformation("DGII table already has data. Skipping seed.");
            return;
        }

        var possiblePaths = new[]
        {
            "/src/Bots/DGII/src/DGII_RNC.TXT",
            "../Bots/DGII/src/DGII_RNC.TXT",
            "Bots/DGII/src/DGII_RNC.TXT",
            Path.Combine(AppContext.BaseDirectory, "Bots", "DGII", "src", "DGII_RNC.TXT"),
            Path.Combine(AppContext.BaseDirectory, "..", "Bots", "DGII", "src", "DGII_RNC.TXT"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "Bots", "DGII", "src", "DGII_RNC.TXT"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Bots", "DGII", "src", "DGII_RNC.TXT")
        };

        string? filePath = null;
        foreach (var path in possiblePaths)
        {
            if (File.Exists(path))
            {
                filePath = path;
                break;
            }
        }

        if (filePath == null)
        {
            logger.LogWarning("DGII_RNC.TXT source file not found. Skipping DGII database seed.");
            return;
        }

        logger.LogInformation($"Found DGII RNC file at {filePath}. Starting bulk seeding...");

        var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        if (connection.GetType().Name.Contains("SqlConnection"))
        {
            try
            {
                await SeedDgiiViaBulkCopyAsync(connection, filePath, logger);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "SqlBulkCopy failed. Retrying with EF batch seeding...");
                await SeedDgiiViaEFAsync(context, filePath, logger);
            }
        }
        else
        {
            await SeedDgiiViaEFAsync(context, filePath, logger);
        }
    }

    private static async Task SeedDgiiViaBulkCopyAsync(System.Data.Common.DbConnection connection, string filePath, ILogger logger)
    {
        var bulkCopyType = Type.GetType("Microsoft.Data.SqlClient.SqlBulkCopy, Microsoft.Data.SqlClient");
        if (bulkCopyType == null)
        {
            throw new InvalidOperationException("SqlBulkCopy type not found in assembly.");
        }

        using var bulkCopy = (IDisposable)Activator.CreateInstance(bulkCopyType, connection)!;

        bulkCopyType.GetProperty("DestinationTableName")!.SetValue(bulkCopy, "DGII");
        bulkCopyType.GetProperty("BatchSize")!.SetValue(bulkCopy, 50000);
        bulkCopyType.GetProperty("BulkCopyTimeout")!.SetValue(bulkCopy, 600);

        var mappings = (System.Collections.IList)bulkCopyType.GetProperty("ColumnMappings")!.GetValue(bulkCopy)!;
        var mappingType = Type.GetType("Microsoft.Data.SqlClient.SqlBulkCopyColumnMapping, Microsoft.Data.SqlClient")!;

        void AddMapping(string source, string dest)
        {
            var mapping = Activator.CreateInstance(mappingType, source, dest);
            mappings.Add(mapping);
        }

        AddMapping("Rnc", "Rnc");
        AddMapping("NombreRazonSocial", "NombreRazonSocial");
        AddMapping("NombreComercial", "NombreComercial");
        AddMapping("Categoria", "Categoria");
        AddMapping("RegimenPagos", "RegimenPagos");
        AddMapping("Estado", "Estado");
        AddMapping("ActividadEconomica", "ActividadEconomica");
        AddMapping("AdministracionLocal", "AdministracionLocal");
        AddMapping("FacturadorElectronico", "FacturadorElectronico");
        AddMapping("LicenciasVhm", "LicenciasVhm");
        AddMapping("FechaModificacion", "FechaModificacion");

        using var dataTable = new System.Data.DataTable();
        dataTable.Columns.Add("Rnc", typeof(string));
        dataTable.Columns.Add("NombreRazonSocial", typeof(string));
        dataTable.Columns.Add("NombreComercial", typeof(string));
        dataTable.Columns.Add("Categoria", typeof(string));
        dataTable.Columns.Add("RegimenPagos", typeof(string));
        dataTable.Columns.Add("Estado", typeof(string));
        dataTable.Columns.Add("ActividadEconomica", typeof(string));
        dataTable.Columns.Add("AdministracionLocal", typeof(string));
        dataTable.Columns.Add("FacturadorElectronico", typeof(string));
        dataTable.Columns.Add("LicenciasVhm", typeof(string));
        dataTable.Columns.Add("FechaModificacion", typeof(DateTime));

        int rowCount = 0;
        var lines = File.ReadLines(filePath, System.Text.Encoding.UTF8);
        var writeMethod = bulkCopyType.GetMethod("WriteToServerAsync", new[] { typeof(System.Data.DataTable) })!;

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split('|');
            if (parts.Length < 2) continue;

            var row = dataTable.NewRow();
            row["Rnc"] = parts[0].Trim();
            row["NombreRazonSocial"] = parts[1].Trim();
            row["NombreComercial"] = parts.Length > 2 ? parts[2].Trim() : null;
            row["ActividadEconomica"] = parts.Length > 3 ? parts[3].Trim() : null;
            row["Categoria"] = parts.Length > 4 ? parts[4].Trim() : null;
            row["RegimenPagos"] = parts.Length > 5 ? parts[5].Trim() : null;
            row["AdministracionLocal"] = parts.Length > 6 ? parts[6].Trim() : null;
            row["FacturadorElectronico"] = parts.Length > 7 ? parts[7].Trim() : null;

            DateTime? modDate = null;
            if (parts.Length > 8 && !string.IsNullOrWhiteSpace(parts[8]))
            {
                if (DateTime.TryParseExact(parts[8].Trim(), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
                {
                    modDate = d;
                }
            }
            row["FechaModificacion"] = (object?)modDate ?? DBNull.Value;

            row["Estado"] = parts.Length > 9 ? parts[9].Trim() : null;
            row["LicenciasVhm"] = parts.Length > 10 ? parts[10].Trim() : null;

            dataTable.Rows.Add(row);
            rowCount++;

            if (rowCount % 50000 == 0)
            {
                var task = (Task)writeMethod.Invoke(bulkCopy, new object[] { dataTable })!;
                await task;
                dataTable.Clear();
                logger.LogInformation($"Bulk copy progress: {rowCount} rows written.");
            }
        }

        if (dataTable.Rows.Count > 0)
        {
            var task = (Task)writeMethod.Invoke(bulkCopy, new object[] { dataTable })!;
            await task;
            logger.LogInformation($"Bulk copy complete! Total rows: {rowCount}.");
        }
    }

    private static async Task SeedDgiiViaEFAsync(AppDbContext context, string filePath, ILogger logger)
    {
        var list = new List<Domain.Entities.DGII>();
        int count = 0;
        var lines = File.ReadLines(filePath, System.Text.Encoding.UTF8);

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split('|');
            if (parts.Length < 2) continue;

            DateTime? modDate = null;
            if (parts.Length > 8 && !string.IsNullOrWhiteSpace(parts[8]))
            {
                if (DateTime.TryParseExact(parts[8].Trim(), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
                {
                    modDate = d;
                }
            }

            var record = new Domain.Entities.DGII
            {
                Rnc = parts[0].Trim(),
                NombreRazonSocial = parts[1].Trim(),
                NombreComercial = parts.Length > 2 ? parts[2].Trim() : null,
                ActividadEconomica = parts.Length > 3 ? parts[3].Trim() : null,
                Categoria = parts.Length > 4 ? parts[4].Trim() : null,
                RegimenPagos = parts.Length > 5 ? parts[5].Trim() : null,
                AdministracionLocal = parts.Length > 6 ? parts[6].Trim() : null,
                FacturadorElectronico = parts.Length > 7 ? parts[7].Trim() : null,
                FechaModificacion = modDate,
                Estado = parts.Length > 9 ? parts[9].Trim() : null,
                LicenciasVhm = parts.Length > 10 ? parts[10].Trim() : null
            };

            list.Add(record);
            count++;

            if (count % 10000 == 0)
            {
                await context.DGII.AddRangeAsync(list);
                await context.SaveChangesAsync();
                list.Clear();
                logger.LogInformation($"EF seed progress: {count} rows saved.");
            }
        }

        if (list.Count > 0)
        {
            await context.DGII.AddRangeAsync(list);
            await context.SaveChangesAsync();
            logger.LogInformation($"EF seed complete! Total rows: {count}.");
        }
    }
}
