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
                contrasenaHash: passwordHasher.HashPassword("Dev1234!"),
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
            await SeedDgiiRncAsync(context, logger);
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

    private static async Task SeedDgiiRncAsync(AppDbContext context, ILogger logger)
    {
        if (await context.DgiiRnc.AnyAsync())
        {
            logger.LogInformation("DGII RNC table already has data. Skipping seed.");
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
            logger.LogWarning("DGII_RNC.TXT source file not found. Skipping DGII RNC database seed.");
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
                await SeedDgiiRncViaBulkCopyAsync(connection, filePath, logger);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "SqlBulkCopy failed. Retrying with EF batch seeding...");
                await SeedDgiiRncViaEFAsync(context, filePath, logger);
            }
        }
        else
        {
            await SeedDgiiRncViaEFAsync(context, filePath, logger);
        }
    }

    private static async Task SeedDgiiRncViaBulkCopyAsync(System.Data.Common.DbConnection connection, string filePath, ILogger logger)
    {
        var bulkCopyType = Type.GetType("Microsoft.Data.SqlClient.SqlBulkCopy, Microsoft.Data.SqlClient");
        if (bulkCopyType == null)
        {
            throw new InvalidOperationException("SqlBulkCopy type not found in assembly.");
        }

        using var bulkCopy = (IDisposable)Activator.CreateInstance(bulkCopyType, connection)!;

        bulkCopyType.GetProperty("DestinationTableName")!.SetValue(bulkCopy, "DgiiRnc");
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

    private static async Task SeedDgiiRncViaEFAsync(AppDbContext context, string filePath, ILogger logger)
    {
        var list = new List<Domain.Entities.DgiiRnc>();
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

            var record = new Domain.Entities.DgiiRnc
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
                await context.DgiiRnc.AddRangeAsync(list);
                await context.SaveChangesAsync();
                list.Clear();
                logger.LogInformation($"EF seed progress: {count} rows saved.");
            }
        }

        if (list.Count > 0)
        {
            await context.DgiiRnc.AddRangeAsync(list);
            await context.SaveChangesAsync();
            logger.LogInformation($"EF seed complete! Total rows: {count}.");
        }
    }
}
