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
    // These are bcrypt hashes (not plaintext). They are for demo/dev only.
    private const string AdminPasswordHash = "$2b$12$h2YwQd3lYqHnQF4I6fHh3OQ7l.1h7jvHcYJc9h1QG5c9YQd7h3q1e"; // "Admin123!" (example)
    private const string DevPasswordHash = "$2b$12$U3qg2fZbYtT9k4Fh0v7wceYQ7TnJ4Nw6o2mS1s6qGQxP9uYp2xE3u"; // "Dev123!" (example)
    private const string PublicPasswordHash = "$2b$12$wq9eYx1T4q2kQ8hYy8yG2eYQ7TnJ4Nw6o2mS1s6qGQxP9uYp2xE3u"; // "Consulta123!" (example)

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            logger.LogInformation("Seeding prototype demo data...");

            var adminUser = await GetOrCreateUsuarioAsync(
                context,
                nombreCompleto: "Admin VeriFinca",
                correoElectronico: "admin@verifinca.do",
                contrasenaHash: AdminPasswordHash,
                rol: UserRole.Administrator);

            var devUser = await GetOrCreateUsuarioAsync(
                context,
                nombreCompleto: "Desarrollador Inmobiliario",
                correoElectronico: "dev@constructora.do",
                contrasenaHash: DevPasswordHash,
                rol: UserRole.Professional);

            var publicUser = await GetOrCreateUsuarioAsync(
                context,
                nombreCompleto: "Usuario Consulta",
                correoElectronico: "consulta@publico.do",
                contrasenaHash: PublicPasswordHash,
                rol: UserRole.Consultation);

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

            logger.LogInformation("Prototype demo data seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }

    private static async Task<Usuario> GetOrCreateUsuarioAsync(
        AppDbContext context,
        string nombreCompleto,
        string correoElectronico,
        string contrasenaHash,
        UserRole rol)
    {
        var existing = await context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == correoElectronico);
        if (existing != null) return existing;

        var user = new Usuario(nombreCompleto, correoElectronico, contrasenaHash, rol);
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
