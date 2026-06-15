// SEED DE PROTOTIPO — Solo para ambiente de desarrollo
namespace Infrastructure.Persistence;

using System;
using System.Collections.Generic;
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

            var adminUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Admin",
                apellido: "VeriFinca",
                correoElectronico: "admin@verifinca.do",
                contrasenaHash: passwordHasher.HashPassword("Admin123!"),
                rol: UserRole.Administrator,
                telefono: "809-555-0100",
                cedula: "001-0000000-1");

            var devUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Desarrollador",
                apellido: "Inmobiliario",
                correoElectronico: "dev@constructora.do",
                contrasenaHash: passwordHasher.HashPassword("Dev123!"),
                rol: UserRole.Professional,
                telefono: "809-555-0200",
                cedula: "001-0000000-2");

            var publicUser = await GetOrCreateUsuarioAsync(
                context,
                nombre: "Usuario",
                apellido: "Consulta",
                correoElectronico: "consulta@publico.do",
                contrasenaHash: passwordHasher.HashPassword("Consulta123!"),
                rol: UserRole.Consultation,
                telefono: "809-555-0300",
                cedula: "001-0000000-3");

            var proyectos = new[]
            {
                new { Nombre = "Torre Bella Vista Piantini", Ubicacion = "Ensanche Piantini, Distrito Nacional", Categoria = ProjectCategory.Residencial, Dev = "Constructora ABC", Cat = "DC-12345", Status = ProjectStatus.Published },
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

            var p1 = proyectoEntities[0];
            var p2 = proyectoEntities[1];
            var p3 = proyectoEntities[2];

            await GetOrCreateDocumentoAsync(
                context,
                proyectoId: p1.Id,
                usuarioCargaId: devUser.Id,
                tipo: DocumentType.CertificadoTitulo,
                nombreOriginal: "Certificado_Titulo_BellaVista.pdf",
                url: "https://mockstorage.blob.core.windows.net/docs/Certificado_Titulo_BellaVista.pdf",
                status: DocumentStatus.Valid);

            await GetOrCreateDocumentoAsync(
                context,
                proyectoId: p1.Id,
                usuarioCargaId: devUser.Id,
                tipo: DocumentType.CertificadoEIA,
                nombreOriginal: "Permiso_Ambiental_BellaVista.pdf",
                url: "https://mockstorage.blob.core.windows.net/docs/Permiso_Ambiental_BellaVista.pdf",
                status: DocumentStatus.Valid);

            await GetOrCreateDocumentoAsync(
                context,
                proyectoId: p2.Id,
                usuarioCargaId: devUser.Id,
                tipo: DocumentType.PlanosArquitectonicos,
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

            // Seeding Legacy Profiles, Permissions, and Plans
            if (!await context.Perfiles.AnyAsync())
            {
                logger.LogInformation("Seeding legacy profiles...");
                var adminPerfil = new Perfil { NombrePerfil = "ADMIN" };
                var devPerfil = new Perfil { NombrePerfil = "DEVELOPER" };
                var valPerfil = new Perfil { NombrePerfil = "VALIDATOR" };
                context.Perfiles.AddRange(adminPerfil, devPerfil, valPerfil);
                await context.SaveChangesAsync();
            }

            if (!await context.Permisos.AnyAsync())
            {
                logger.LogInformation("Seeding legacy permissions...");
                var perm1 = new Permiso { Descripcion = "GestionarUsuarios" };
                var perm2 = new Permiso { Descripcion = "ConfigurarReglas" };
                var perm3 = new Permiso { Descripcion = "VisualizarAuditoria" };
                var perm4 = new Permiso { Descripcion = "CrearProyectos" };
                var perm5 = new Permiso { Descripcion = "ValidarProyectos" };
                context.Permisos.AddRange(perm1, perm2, perm3, perm4, perm5);
                await context.SaveChangesAsync();
            }

            if (!await context.PerfilPermisos.AnyAsync())
            {
                logger.LogInformation("Seeding legacy profile-permission relations...");
                var perfiles = await context.Perfiles.ToListAsync();
                var permisos = await context.Permisos.ToListAsync();

                var admin = perfiles.FirstOrDefault(p => p.NombrePerfil == "ADMIN");
                var dev = perfiles.FirstOrDefault(p => p.NombrePerfil == "DEVELOPER");
                var val = perfiles.FirstOrDefault(p => p.NombrePerfil == "VALIDATOR");

                if (admin != null)
                {
                    foreach (var perm in permisos)
                    {
                        context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = admin.IdPerfil, IdPermiso = perm.IdPermiso });
                    }
                }
                if (dev != null)
                {
                    var pCrear = permisos.FirstOrDefault(p => p.Descripcion == "CrearProyectos");
                    if (pCrear != null)
                        context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = dev.IdPerfil, IdPermiso = pCrear.IdPermiso });
                }
                if (val != null)
                {
                    var pCrear = permisos.FirstOrDefault(p => p.Descripcion == "CrearProyectos");
                    var pVal = permisos.FirstOrDefault(p => p.Descripcion == "ValidarProyectos");
                    if (pCrear != null)
                        context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = val.IdPerfil, IdPermiso = pCrear.IdPermiso });
                    if (pVal != null)
                        context.PerfilPermisos.Add(new PerfilPermiso { IdPerfil = val.IdPerfil, IdPermiso = pVal.IdPermiso });
                }
                await context.SaveChangesAsync();
            }

            if (!await context.PlanesSuscripcion.AnyAsync())
            {
                logger.LogInformation("Seeding legacy subscription plans...");
                context.PlanesSuscripcion.AddRange(
                    new PlanSuscripcion { NombrePlan = "Gratuito", Precio = 0.00m },
                    new PlanSuscripcion { NombrePlan = "Profesional", Precio = 3500.00m },
                    new PlanSuscripcion { NombrePlan = "Empresa", Precio = 10000.00m },
                    new PlanSuscripcion { NombrePlan = "Enterprise", Precio = 30000.00m }
                );
                await context.SaveChangesAsync();
            }

            // Sync default seeded users to legacy Usuario, Acceso, and Pagos
            var users = await context.Usuarios.ToListAsync();
            var perfilesList = await context.Perfiles.ToListAsync();
            var planesList = await context.PlanesSuscripcion.ToListAsync();

            var adminLegacyProfile = perfilesList.FirstOrDefault(p => p.NombrePerfil == "ADMIN");
            var devLegacyProfile = perfilesList.FirstOrDefault(p => p.NombrePerfil == "DEVELOPER");
            var valLegacyProfile = perfilesList.FirstOrDefault(p => p.NombrePerfil == "VALIDATOR");

            var freePlan = planesList.FirstOrDefault(p => p.NombrePlan == "Gratuito");
            var proPlan = planesList.FirstOrDefault(p => p.NombrePlan == "Profesional");

            foreach (var u in users)
            {
                var existingLegacy = await context.UsuariosLegacy.FirstOrDefaultAsync(ul => ul.Email == u.Email);
                if (existingLegacy == null)
                {
                    var legacyUser = new UsuarioLegacy
                    {
                        Nombre = u.Nombre,
                        Apellido = u.Apellido,
                        Email = u.Email,
                        ContrasenaHash = u.ContrasenaHash,
                        Telefono = u.Telefono,
                        Cedula = u.Cedula
                    };
                    context.UsuariosLegacy.Add(legacyUser);
                    await context.SaveChangesAsync();
                    existingLegacy = legacyUser;
                }

                var hasAcceso = await context.Accesos.AnyAsync(a => a.IdUsuario == existingLegacy.IdUsuario);
                if (!hasAcceso)
                {
                    var targetPerfil = u.Rol switch
                    {
                        UserRole.Administrator => adminLegacyProfile,
                        UserRole.Professional => devLegacyProfile,
                        UserRole.Consultation => valLegacyProfile,
                        _ => devLegacyProfile
                    };

                    if (targetPerfil != null)
                    {
                        context.Accesos.Add(new Acceso { IdUsuario = existingLegacy.IdUsuario, IdPerfil = targetPerfil.IdPerfil });
                    }
                }

                var hasPagos = await context.PagosLegacy.AnyAsync(p => p.IdUsuario == existingLegacy.IdUsuario);
                if (!hasPagos)
                {
                    var targetPlan = u.Rol == UserRole.Administrator ? proPlan : freePlan;
                    if (targetPlan != null)
                    {
                        context.PagosLegacy.Add(new Pago
                        {
                            IdUsuario = existingLegacy.IdUsuario,
                            Idsuscripcion = targetPlan.Idsuscripcion,
                            Monto = targetPlan.Precio,
                            FechaPago = DateTime.UtcNow
                        });
                    }
                }
            }
            await context.SaveChangesAsync();

            logger.LogInformation("Prototype demo data seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
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
            
            await context.SaveChangesAsync();
            return existing;
        }

        var user = new Usuario(nombre, apellido, correoElectronico, contrasenaHash, rol, telefono, cedula);
        context.Usuarios.Add(user);
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
}
