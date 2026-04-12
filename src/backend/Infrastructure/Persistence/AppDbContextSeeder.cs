using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

public static class AppDbContextSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            // Only seed if the database is empty
            if (!await context.Usuarios.AnyAsync())
            {
                logger.LogInformation("Seeding mock data for VeriFinca...");

                // 1. Seed Usuarios
                var adminUser = new Usuario("Admin VeriFinca", "admin@verifinca.do", "Admin123!", UserRole.Administrator);
                var devUser = new Usuario("Desarrollador Inmobiliario", "dev@constructora.do", "Dev123!", UserRole.Professional);
                var publicUser = new Usuario("Usuario Consulta", "consulta@publico.do", "Consulta123!", UserRole.Consultation);

                context.Usuarios.AddRange(adminUser, devUser, publicUser);
                await context.SaveChangesAsync();

                // 2. Seed Proyectos
                var proyecto1 = new Proyecto("Torre Bella Vista Piantini", "Ensanche Piantini, Distrito Nacional", devUser.Id, ProjectCategory.Residencial, "Constructora ABC", "DC-12345");
                proyecto1.UpdateStatus(ProjectStatus.Published);
                
                var proyecto2 = new Proyecto("Residencial Los Cacicazgos", "Los Cacicazgos, Distrito Nacional", devUser.Id, ProjectCategory.Residencial, "Desarrollos Inmobiliarios XYZ", "DC-67890");
                proyecto2.UpdateStatus(ProjectStatus.Draft);

                var proyecto3 = new Proyecto("Proyecto Costero La Romana", "La Romana, RD", devUser.Id, ProjectCategory.Turistico, "Grupo Turístico del Este", "DC-11223");
                proyecto3.UpdateStatus(ProjectStatus.InReview);

                var proyecto4 = new Proyecto("Plaza Comercial Naco", "Ensanche Naco, Distrito Nacional", devUser.Id, ProjectCategory.Comercial, "Inversiones Comerciales Naco", "DC-44556");
                proyecto4.UpdateStatus(ProjectStatus.Published);

                var proyecto5 = new Proyecto("Condominio Las Terrenas", "Las Terrenas, Samaná", devUser.Id, ProjectCategory.Turistico, "Samaná Real Estate", "DC-77889");
                proyecto5.UpdateStatus(ProjectStatus.Draft);

                var proyecto6 = new Proyecto("Residencial Santiago Norte", "Gurabo, Santiago de los Caballeros", devUser.Id, ProjectCategory.Residencial, "Constructora Cibao", "DC-99001");
                proyecto6.UpdateStatus(ProjectStatus.InReview);

                context.Proyectos.AddRange(proyecto1, proyecto2, proyecto3, proyecto4, proyecto5, proyecto6);
                await context.SaveChangesAsync();

                // 3. Seed Documentos
                var doc1 = new Documento(proyecto1.Id, "Certificado_Titulo_BellaVista.pdf", "application/pdf", 1024 * 1024 * 2, "https://mockstorage.blob.core.windows.net/docs/Certificado_Titulo_BellaVista.pdf", DocumentType.CertificadoTitulo);
                doc1.UpdateStatus(DocumentStatus.Valid);

                var doc2 = new Documento(proyecto1.Id, "Permiso_Ambiental_BellaVista.pdf", "application/pdf", 1024 * 500, "https://mockstorage.blob.core.windows.net/docs/Permiso_Ambiental_BellaVista.pdf", DocumentType.CertificadoEIA);
                doc2.UpdateStatus(DocumentStatus.Valid);

                var doc3 = new Documento(proyecto2.Id, "Planos_LosCacicazgos.pdf", "application/pdf", 1024 * 1024 * 5, "https://mockstorage.blob.core.windows.net/docs/Planos_LosCacicazgos.pdf", DocumentType.PlanosArquitectonicos);
                doc3.UpdateStatus(DocumentStatus.Uploaded);

                context.Documentos.AddRange(doc1, doc2, doc3);
                await context.SaveChangesAsync();

                // 4. Seed Validaciones
                var validacion1 = new Validacion(proyecto1.Id);
                validacion1.UpdateStatus(ValidationStatus.Completed, true, 2, 0, 0);

                var validacion2 = new Validacion(proyecto3.Id);
                validacion2.UpdateStatus(ValidationStatus.Failed, false, 0, 0, 1);

                context.Validaciones.AddRange(validacion1, validacion2);
                await context.SaveChangesAsync();

                // 5. Seed Hallazgos
                var hallazgo1 = new Hallazgo(proyecto3.Id, null, "Permiso de construcción rechazado", "Falta firma del director de planeamiento urbano", FindingSeverity.Critical, null, "Ayuntamiento");
                
                context.Hallazgos.Add(hallazgo1);
                await context.SaveChangesAsync();

                // 6. Seed Auditorias
                var audit1 = new Auditoria(devUser.Id, "ProjectCreated", "PROYECTO", "Proyecto", proyecto1.Id.ToString(), proyecto1.Id, "Proyecto Torre Bella Vista Piantini creado");
                var audit2 = new Auditoria(adminUser.Id, "ValidationExecuted", "VALIDACION", "Validacion", validacion1.Id.ToString(), proyecto1.Id, "Validación interna ejecutada con resultado: Completado");

                context.Auditorias.AddRange(audit1, audit2);
                await context.SaveChangesAsync();

                // 7. Seed Reportes
                var reporte1 = new Reporte(proyecto1.Id, adminUser.Id, 1);
                reporte1.UpdateStatus(ReportStatus.Published, "Reporte interno de validación completado. Sin hallazgos críticos.", "El proyecto Torre Bella Vista Piantini ha superado exitosamente todas las validaciones de integridad. Los documentos legales y permisos ambientales se encuentran en orden y vigentes.", true);

                context.Reportes.Add(reporte1);
                await context.SaveChangesAsync();

                // 8. Seed Certificaciones
                var cert1 = new Certificacion(proyecto1.Id, reporte1.Id, "VF-2026-ABC123XYZ", "https://verifinca.do/verify/VF-2026-ABC123XYZ", 95, IntegrityStatus.Valid, adminUser.Id, 1);
                cert1.UpdateStatus(CertificationStatus.Vigente, 95, 2);

                context.Certificaciones.Add(cert1);
                await context.SaveChangesAsync();

                // 9. Seed Notificaciones
                var notif1 = new Notificacion(devUser.Id, "El proyecto Torre Bella Vista Piantini ha sido publicado.", "ProjectPublished", $"/admin/projects/{proyecto1.Id}");
                var notif2 = new Notificacion(devUser.Id, "Validación fallida para Proyecto Costero La Romana.", "ValidationFailed", $"/admin/projects/{proyecto3.Id}");
                notif2.MarkAsRead();

                context.Notificaciones.AddRange(notif1, notif2);
                await context.SaveChangesAsync();

                logger.LogInformation("Mock data seeding completed successfully.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
