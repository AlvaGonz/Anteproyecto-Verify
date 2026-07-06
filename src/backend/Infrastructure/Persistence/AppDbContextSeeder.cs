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

            var adminUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Administrador",
                apellido: "Principal",
                correoElectronico: "admin@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("AdminVerifinca2026!"),
                rol: UserRole.Administrator,
                telefono: "809-555-1000",
                cedula: "001-1234567-8");

            var devUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Desarrollador",
                apellido: "Premium",
                correoElectronico: "dev@constructora.do",
                contrasenaHash: passwordHasher.HashPassword("DevVerifinca2026!"),
                rol: UserRole.Professional,
                telefono: "809-555-2000",
                cedula: "402-7654321-9");

            var publicUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Validador",
                correoElectronico: "validador@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("Validador2026!"),
                rol: UserRole.Consultation,
                telefono: "809-555-3000",
                cedula: "001-9876543-2");

            await SeedLegacyProfilesAndPermissionsAsync(context, logger, adminUser, devUser, publicUser);

            var proyectos = new[]
            {
                new { Nombre = "Torre Bella Vista Piantini", Ubicacion = "Ensanche Piantini, Distrito Nacional", Categoria = ProjectCategory.Residencial, Dev = "Constructora ABC", Cat = "DC-12345", Status = ProjectStatus.Validated },
                new { Nombre = "Residencial Los Cacicazgos", Ubicacion = "Los Cacicazgos, Distrito Nacional", Categoria = ProjectCategory.Residencial, Dev = "Desarrollos Inmobiliarios XYZ", Cat = "DC-67890", Status = ProjectStatus.Draft },
                new { Nombre = "Proyecto Costero La Romana", Ubicacion = "La Romana, RD", Categoria = ProjectCategory.Turistico, Dev = "Grupo Turístico del Este", Cat = "DC-11223", Status = ProjectStatus.InReview },
            };

            var proyectoEntities = new List<Proyecto>();
            foreach (var p in proyectos)
            {
                var proyecto = await GetOrCreateProyectoAsync(
                    context,
                    nombre: p.Nombre,
                    ubicacionTexto: p.Ubicacion,
                    usuarioCreadorId: devUser.Id,
                    categoria: p.Categoria,
                    datosDesarrollador: p.Dev,
                    designacionCatastral: p.Cat,
                    status: p.Status);
                proyectoEntities.Add(proyecto);
            }

            await SeedDashboardDummyDataAsync(context, logger, adminUser, devUser, publicUser, proyectoEntities);

            try {
                var p1 = proyectoEntities[0];
                var p2 = proyectoEntities[1];
                var p3 = proyectoEntities[2];

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p1.Id,
                    usuarioCargaId: devUser.Id,
                    tipo: DocumentType.TITLE,
                    nombreOriginal: "Certificado_Titulo_BellaVista.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Certificado_Titulo_BellaVista.pdf",
                    status: DocumentStatus.Valid);

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p1.Id,
                    usuarioCargaId: devUser.Id,
                    tipo: DocumentType.OTHER,
                    nombreOriginal: "Permiso_Ambiental_BellaVista.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Permiso_Ambiental_BellaVista.pdf",
                    status: DocumentStatus.Valid);

                await GetOrCreateDocumentoAsync(
                    context,
                    proyectoId: p2.Id,
                    usuarioCargaId: devUser.Id,
                    tipo: DocumentType.OTHER,
                    nombreOriginal: "Planos_LosCacicazgos.pdf",
                    url: "https://mockstorage.blob.core.windows.net/docs/Planos_LosCacicazgos.pdf",
                    status: DocumentStatus.Uploaded);

                await GetOrCreateValidacionAsync(context, proyectoId: p1.Id, status: ValidationStatus.Completed, esLegitimo: true);
                await GetOrCreateValidacionAsync(context, proyectoId: p3.Id, status: ValidationStatus.Failed, esLegitimo: false);

                await GetOrCreateHallazgoAsync(
                    context,
                    proyectoId: p3.Id,
                    titulo: "Permiso de construcción rechazado",
                    descripcion: "Falta firma del director de planeamiento urbano",
                    severidad: FindingSeverity.Critical,
                    fuente: "Ayuntamiento");

                await GetOrCreateAuditoriaAsync(
                    context,
                    usuarioId: devUser.Id,
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

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: devUser.Id,
                    mensaje: "El proyecto Torre Bella Vista Piantini ha sido publicado.",
                    tipo: "ProjectPublished",
                    ruta: $"/admin/projects/{p1.Id}",
                    markRead: false);

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: devUser.Id,
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
        if (!await context.PlanesSuscripcion.AnyAsync())
        {
            logger.LogInformation("Seeding modern subscription plans (Block 2)...");
            
            // Gratuito (Free)
            var gratuito = PlanSuscripcion.Create(
                id: Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"), nombrePlan: "Gratuito", precio: 0.00m,
                maxConsultas: 1, maxProyectos: 1, presentacionPublica: false,
                qrIncluido: false, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 0,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: false, integracionCrmDisponible: false,
                soporteTipo: "Comunidad", accesoApi: false);

            // Consultor (Legacy Free for tests)
            var consultor = PlanSuscripcion.Create(
                id: Guid.Parse("2E4F281E-47C2-43FF-BF58-9CC3A8C5B321"), nombrePlan: "Consultor", precio: 0.00m,
                maxConsultas: 5, maxProyectos: 5, presentacionPublica: false,
                qrIncluido: false, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 0,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: false, integracionCrmDisponible: false,
                soporteTipo: "Comunidad", accesoApi: false);

            // Profesional
            var profesional = PlanSuscripcion.Create(
                id: Guid.Parse("66AFDABF-632E-434C-86F4-6F9060D2656F"), nombrePlan: "Profesional", precio: 3500.00m,
                maxConsultas: 25, maxProyectos: 5, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 200,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: false,
                soporteTipo: "Email", accesoApi: false);

            // Empresa
            var empresa = PlanSuscripcion.Create(
                id: Guid.Parse("41037268-58B6-40A3-A8AE-C18EFE00C7D3"), nombrePlan: "Empresa", precio: 10000.00m,
                maxConsultas: 100, maxProyectos: 20, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 5, maxAlmacenamientoMb: 1024,
                alertasTiempoRealDisponible: false, modeloLmDisponible: true, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Prioritario", accesoApi: true);

            // Enterprise
            var enterprise = PlanSuscripcion.Create(
                id: Guid.Parse("F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"), nombrePlan: "Enterprise", precio: 30000.00m,
                maxConsultas: -1, maxProyectos: -1, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: -1, maxAlmacenamientoMb: 10240,
                alertasTiempoRealDisponible: true, modeloLmDisponible: true, validacionLoteDisponible: true,
                exportacionExcelDisponible: true, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Account Manager", accesoApi: true);

            context.PlanesSuscripcion.AddRange(gratuito, consultor, profesional, empresa, enterprise);
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

    private static async Task<Usuario> GetOrCreateUsuarioAsync(
        AppDbContext context,
        string nombre,
        string apellido,
        string correoElectronico,
        string contrasenaHash,
        UserRole rol,
        string telefono,
        string cedula)
    {
        var existing = await context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == correoElectronico);
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
            
            await context.SaveChangesAsync();
            return existing;
        }

        var user = new Usuario(nombre, apellido, correoElectronico, contrasenaHash, rol, telefono, cedula);
        context.Usuarios.Add(user);
        
        // Ensure user is marked as verified and active for seeding purposes
        context.Entry(user).Property("EmailVerificado").CurrentValue = true;
        context.Entry(user).Property("Activo").CurrentValue = true;
        
        await context.SaveChangesAsync();
        return user;
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

        var proyecto = new Proyecto(nombre, ubicacionTexto, usuarioCreadorId, categoria, datosDesarrollador, designacionCatastral);
        proyecto.UpdateStatus(status);
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

        var cert = new Certificacion(proyectoId, reporteId, codigoVerificacion, urlVerificacion, score, estadoIntegridad, emisorId, version: 1);
        cert.UpdateStatus(CertificationStatus.Vigente, score, version: 1);
        context.Certificaciones.Add(cert);
        await context.SaveChangesAsync();
        return cert;
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
