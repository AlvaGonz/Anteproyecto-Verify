// SEED DE PROTOTIPO — Solo para ambiente de desarrollo
namespace Infrastructure.Persistence;

using System;
using System.Collections.Generic;
using System.IO;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Storage;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public static class AppDbContextSeeder
{
    // Carpeta en test_docs → DocumentType canónico (mapea 1:1 a las 6 carpetas MOC)
    private static readonly (string Folder, DocumentType Tipo)[] TestDocumentFolders = new[]
    {
        ("Título de Propiedad", DocumentType.CertificadoTitulo),
        ("Estado Juridico", DocumentType.CertificacionEstadoJuridico),
        ("Planos de Mensura", DocumentType.PlanoMensuraCatastral),
        ("Cedula", DocumentType.ID),
        ("Certificación IPI", DocumentType.CertificacionIPI),
        ("Poder Notarial", DocumentType.PoderNotarial),
    };

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<Application.Abstractions.Security.IPasswordHasher>();

        try
        {
            logger.LogInformation("Seeding prototype demo data...");

            await SeedProvinciasAsync(context, logger);
            await SeedMunicipiosAsync(context, logger);
            await SeedPlanesSuscripcionAsync(context, logger);
            await SeedProyectoEstadosAsync(context, logger);
            await SeedTiposNotificacionesAsync(context, logger);

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
                new { Nombre = "Torre Bella Vista Piantini", Ubicacion = "Ensanche Piantini, Distrito Nacional", Categoria = 3, Dev = "Constructora ABC", Cat = "DC-12345", Status = ProjectStatus.Publicado }, // APARTAMENTOS
                new { Nombre = "Residencial Los Cacicazgos", Ubicacion = "Los Cacicazgos, Distrito Nacional", Categoria = 16, Dev = "Desarrollos Inmobiliarios XYZ", Cat = "DC-67890", Status = ProjectStatus.Creado }, // VIVIENDAS
                new { Nombre = "Proyecto Costero La Romana", Ubicacion = "La Romana, RD", Categoria = 12, Dev = "Grupo Turístico del Este", Cat = "DC-11223", Status = ProjectStatus.Revision }, // HOSPEDAJE
                new { Nombre = "Condominio Oasis", Ubicacion = "Bávaro, Punta Cana", Categoria = 3, Dev = "Desarrollos Inmobiliarios", Cat = "DC-22334", Status = ProjectStatus.Publicado }, // APARTAMENTOS
                new { Nombre = "Plaza del Sol", Ubicacion = "Santiago", Categoria = 8, Dev = "Grupo Constructor Sur", Cat = "DC-33445", Status = ProjectStatus.Publicado }, // COMERCIAL Y OFICINAS
                new { Nombre = "Torre Lumiere", Ubicacion = "Santo Domingo Centro", Categoria = 8, Dev = "Inversiones Caribe", Cat = "DC-44556", Status = ProjectStatus.Publicado }, // COMERCIAL Y OFICINAS
                new { Nombre = "Residencial Altos del Mar", Ubicacion = "Puerto Plata", Categoria = 16, Dev = "Constructora del Norte", Cat = "DC-55667", Status = ProjectStatus.Publicado }, // VIVIENDAS
                new { Nombre = "Villa Costa Marina", Ubicacion = "Samaná", Categoria = 12, Dev = "Desarrollos Marinos", Cat = "DC-66778", Status = ProjectStatus.Publicado }, // HOSPEDAJE
                new { Nombre = "Plaza Comercial Norte", Ubicacion = "Santo Domingo Norte", Categoria = 8, Dev = "Inmobiliaria del Este", Cat = "DC-77889", Status = ProjectStatus.Publicado }, // COMERCIAL Y OFICINAS
                new { Nombre = "Condominio Vista Bella", Ubicacion = "La Vega", Categoria = 3, Dev = "Constructora VIP", Cat = "DC-88990", Status = ProjectStatus.Publicado }, // APARTAMENTOS
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

            await SeedTestDocumentsAsync(context, scope.ServiceProvider, adminUser.Id, corporativoUser, proyectoEntities, logger);

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

                p1.UpdateDetails(p1.Nombre, p1.UbicacionTexto, null, null, p1.CategoriaId, p1.DatosDesarrollador, p1.DesignacionCatastral, "Propietario Test", "402-1234567-8", "1-01-99999-9");
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
                    nombre: "Sello de Integridad",
                    nivel: NivelSelloIntegridad.Bronce,
                    urlQr: $"http://localhost:3000/#/q/{GenerateSealToken(p1.Id, "VF-2026-ABC123XYZ")}",
                    firmaDigital: "firma-digital-simulada",
                    qrToken: GenerateSealToken(p1.Id, "VF-2026-ABC123XYZ"));

                // Seal seeding for remaining published projects
                var publishedProjectSeeds = new (int Index, string Codigo)[]
                {
                    (3, "VF-2026-OASIS001"),
                    (4, "VF-2026-PSOL001"),
                    (5, "VF-2026-LUMI001"),
                    (6, "VF-2026-ALTOS001"),
                    (7, "VF-2026-COSTA001"),
                    (8, "VF-2026-PCNOR001"),
                    (9, "VF-2026-VISTA001"),
                };

                foreach (var (idx, codigo) in publishedProjectSeeds)
                {
                    var proj = proyectoEntities[idx];
                    var token = GenerateSealToken(proj.Id, codigo);
                    await GetOrCreateSelloIntegridadAsync(
                        context,
                        proyectoId: proj.Id,
                        codigoSello: codigo,
                        nombre: "Sello de Integridad",
                        nivel: NivelSelloIntegridad.Bronce,
                        urlQr: $"http://localhost:3000/#/q/{token}",
                        firmaDigital: "firma-digital-simulada",
                        qrToken: token);
                }

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: profesionalUser.Id,
                    mensaje: "El proyecto Torre Bella Vista Piantini ha sido publicado.",
                    tipo: TipoNotificacionId.ProyectoPublicado.ToString(),
                    ruta: $"/admin/projects/{p1.Id}",
                    markRead: false);

                await GetOrCreateNotificacionAsync(
                    context,
                    usuarioId: profesionalUser.Id,
                    mensaje: "Validación fallida para Proyecto Costero La Romana.",
                    tipo: TipoNotificacionId.ProyectoObservacion.ToString(),
                    ruta: $"/admin/projects/{p3.Id}",
                    markRead: true);
            } catch (Exception ex) {
                logger.LogWarning($"Skipping domain seeding due to missing tables: {ex.Message}");
            }

            logger.LogInformation("Prototype demo data seeding completed successfully.");
            // await SeedDgiiAsync(context, logger); // Handled by python_env container (up_DGII.py) to prevent race conditions & memory issues

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

    private static async Task SeedProvinciasAsync(AppDbContext context, ILogger logger)
    {
        var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open) await connection.OpenAsync();
        using var cmd = connection.CreateCommand();
        cmd.CommandText = "SELECT COUNT(1) FROM Provincia";
        var count = (int)cmd.ExecuteScalar()!;
        if (count > 0) { logger.LogInformation("Provincias already seeded. Skipping."); return; }

        logger.LogInformation("Seeding Provincias...");

        var sql = @"
INSERT INTO Provincia (NombreProvincia, Latitud, Longitud) VALUES
('Distrito Nacional', 18.47186, -69.93988),
('Azua', 18.45320, -70.73490),
('Bahoruco', 18.50000, -71.30000),
('Barahona', 18.20850, -71.10080),

('Dajabón', 19.54000, -71.70000),
('Duarte', 19.30000, -70.25000),
('El Seibo', 18.76000, -69.04000),
('Elías Piña', 18.88000, -71.68000),
('Espaillat', 19.50000, -70.50000),
('Hato Mayor', 18.76000, -69.25000),
('Hermanas Mirabal', 19.38000, -70.35000),
('Independencia', 18.40000, -71.60000),
('La Altagracia', 18.61890, -68.70830),
('La Romana', 18.42730, -68.97280),
('La Vega', 19.22000, -70.53000),
('María Trinidad Sánchez', 19.38000, -69.95000),
('Monseñor Nouel', 18.91000, -70.43000),
('Monte Cristi', 19.72000, -71.58000),
('Monte Plata', 18.80700, -69.78900),
('Pedernales', 18.03000, -71.74000),
('Peravia', 18.28000, -70.33000),
('Puerto Plata', 19.79340, -70.68840),
('Samaná', 19.20000, -69.33000),
('San Cristóbal', 18.41667, -70.10000),
('San José de Ocoa', 18.55000, -70.50000),
('San Juan', 18.80580, -71.22990),
('San Pedro de Macorís', 18.45390, -69.30820),
('Sánchez Ramírez', 19.00160, -70.14920),
('Santiago', 19.45170, -70.69703),
('Santiago Rodríguez', 19.48000, -71.34000),
('Santo Domingo', 18.54118, -69.83988),
('Valverde', 19.58000, -71.07000)";

        await context.Database.ExecuteSqlRawAsync(sql);
        logger.LogInformation("Provincias seeded (32 provinces).");
    }

    private static async Task SeedMunicipiosAsync(AppDbContext context, ILogger logger)
    {
        var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open) await connection.OpenAsync();
        using var cmd = connection.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM Municipio";
        var count = (int)cmd.ExecuteScalar()!;
        if (count > 0) { logger.LogInformation("Municipios already seeded. Skipping."); return; }

        logger.LogInformation("Seeding Municipios...");

        // Province names here match exactly what was inserted in SeedProvinciasAsync (accented)
        var sql = @"
-- Provincias lookup table via MERGE-like INSERT with JOIN
DECLARE @m TABLE (NombreMunicipio VARCHAR(100), NombreProvincia VARCHAR(100), Latitud DECIMAL(9,6), Longitud DECIMAL(9,6));

INSERT INTO @m (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
('Distrito Nacional', 'Distrito Nacional', 18.485, -69.93),
('Santo Domingo Este', 'Santo Domingo', 18.526, -69.802),
('Santo Domingo Oeste', 'Santo Domingo', 18.463, -69.992),
('Santo Domingo Norte', 'Santo Domingo', 18.612, -69.912),
('Boca Chica', 'Santo Domingo', 18.457, -69.615),
('San Antonio de Guerra', 'Santo Domingo', 18.581, -69.654),
('Santiago de los Caballeros', 'Santiago', 19.517, -70.697),
('Tamboril', 'Santiago', 19.488, -70.608),
('Villa Gonzalez', 'Santiago', 19.45, -70.7),
('Licey al Medio', 'Santiago', 19.428, -70.619),
('Bisono', 'Santiago', 19.45, -70.7),
('Janico', 'Santiago', 19.249, -70.764),
('Lopez', 'Santiago', 19.428, -70.619),
('Punal', 'Santiago', 19.398, -70.637),
('Sabana Iglesia', 'Santiago', 19.342, -70.745),
('Higuey', 'La Altagracia', 18.708, -68.687),
('La Otra Banda', 'La Altagracia', 18.65, -70.75),
('San Rafael del Yuma', 'La Altagracia', 18.373, -68.727),
('San Pedro de Macorís', 'San Pedro de Macorís', 18.482, -69.26),
('Consuelo', 'San Pedro de Macorís', 18.594, -69.253),
('Ramon Santana', 'San Pedro de Macorís', 18.45, -69.3),
('Quisqueya', 'San Pedro de Macorís', 18.546, -69.423),
('Guayacanes', 'San Pedro de Macorís', 18.447, -69.433),
('La Romana', 'La Romana', 18.155, -68.677),
('Guaymate', 'La Romana', 18.567, -68.951),
('Villa Hermosa', 'La Romana', 18.451, -69.051),
('San Felipe de Puerto Plata', 'Puerto Plata', 19.71, -70.692),
('Sosua', 'Puerto Plata', 19.666, -70.491),
('Cabarete', 'Puerto Plata', 19.7833, -70.6833),
('Imbert', 'Puerto Plata', 19.765, -70.872),
('Altamira', 'Puerto Plata', 19.651, -70.793),
('Guananico', 'Puerto Plata', 19.697, -70.923),
('Los Hidalgos', 'Puerto Plata', 19.746, -71.015),
('Villa Isabela', 'Puerto Plata', 19.809, -71.136),
('Villa Montellano', 'Puerto Plata', 19.705, -70.577),
('San Francisco de Macoris', 'Duarte', 19.339, -70.206),
('Arenoso', 'Duarte', 19.189, -69.77),
('Castillo', 'Duarte', 19.24, -70.028),
('Eugenio Maria de Hostos', 'Duarte', 19.141, -70.021),
('Las Guaranas', 'Duarte', 19.2, -70.232),
('Pimentel', 'Duarte', 19.216, -70.147),
('Villa Riva', 'Duarte', 19.152, -69.903),
('El Seibo', 'El Seibo', 18.741, -69.031),
('Miches', 'El Seibo', 18.962, -68.981),
('Comendador', 'Elías Piña', 18.919, -71.696),
('Banica', 'Elías Piña', 19.018, -71.645),
('El Llano', 'Elías Piña', 18.816, -71.672),
('Hondo Valle', 'Elías Piña', 18.711, -71.698),
('Juan Santiago', 'Elías Piña', 18.729, -71.602),
('Pedro Santana', 'Elías Piña', 19.173, -71.479),
('Moca', 'Espaillat', 19.478, -70.505),
('Gaspar Hernandez', 'Espaillat', 19.614, -70.241),
('Cayetano Germosen', 'Espaillat', 19.344, -70.472),
('Jamao al Norte', 'Espaillat', 19.597, -70.467),
('Hato Mayor del Rey', 'Hato Mayor', 18.709, -69.326),
('Sabana de la Mar', 'Hato Mayor', 19.008, -69.412),
('El Valle', 'Hato Mayor', 18.944, -69.385),
('Salcedo', 'Hermanas Mirabal', 19.447, -70.389),
('Tenares', 'Hermanas Mirabal', 19.448, -70.307),
('Villa Tapia', 'Hermanas Mirabal', 19.291, -70.39),
('Jimani', 'Independencia', 18.501, -71.844),
('Cristobal', 'Independencia', 18.342, -71.299),
('Dulverge', 'Independencia', 18.32, -71.621),
('La Descubierta', 'Independencia', 18.598, -71.756),
('Postrer Rio', 'Independencia', 18.599, -71.119),
('Azua de Compostela', 'Azua', 18.459, -70.754),
('Estebania', 'Azua', 18.594, -70.769),
('Guayabal', 'Azua', 18.722, -70.768),
('Las Charcas', 'Azua', 18.72, -70.786),
('Las Yayas de Viajama', 'Azua', 18.594, -71.034),
('Padre Las Casas', 'Azua', 18.833, -70.895),
('Peralta', 'Azua', 18.591, -70.933),
('Pueblo Viejo', 'Azua', 18.401, -70.769),
('Sabana Yegua', 'Azua', 18.419, -70.88),
('Tabara Arriba', 'Azua', 18.484, -70.907),
('Neiba', 'Bahoruco', 18.419, -71.262),
('Gulvan', 'Bahoruco', 18.4833, -71.4167),
('Los Rios', 'Bahoruco', 18.565, -71.582),
('Tamayo', 'Bahoruco', 18.477, -71.161),
('Villa Jaragua', 'Bahoruco', 18.544, -71.493),
('Barahona', 'Barahona', 18.187, -71.139),
('Cabral', 'Barahona', 18.195, -71.248),
('El Penon', 'Barahona', 18.294, -71.214),
('Enriquillo', 'Barahona', 17.979, -71.339),
('Fundacion', 'Barahona', 18.262, -71.163),
('Jaquimeyes', 'Barahona', 18.304, -71.123),
('La Cienaga', 'Barahona', 18.095, -71.142),
('Paraiso', 'Barahona', 18.017, -71.21),
('Polo', 'Barahona', 18.121, -71.323),
('Vicente Noble', 'Barahona', 18.41, -71.088),
('Las Salinas', 'Barahona', 18.237, -71.337),
('Dajabon', 'Dajabon', 19.571, -71.622),
('El Pino', 'Dajabon', 19.406, -71.489),
('Loma de Cabrera', 'Dajabon', 19.433, -71.618),
('Partido', 'Dajabon', 19.506, -71.513),
('Restauracion', 'Dajabon', 19.304, -71.633),
('San Fernando de Monte Cristi', 'Monte Cristi', 19.76, -71.652),
('Castanuelas', 'Monte Cristi', 19.737, -71.509),
('Guayubin', 'Monte Cristi', 19.688, -71.309),
('Las Matas de Santa Cruz', 'Monte Cristi', 19.626, -71.501),
('Pepillo Salcedo', 'Monte Cristi', 19.661, -71.655),
('Villa Vusquez', 'Monte Cristi', 19.809, -71.443),
('Monte Plata', 'Monte Plata', 18.76, -69.839),
('Bayaguana', 'Monte Plata', 18.815, -69.592),
('Peralvillo', 'Monte Plata', 18.857, -70.066),
('Sabana Grande de Boya', 'Monte Plata', 18.976, -69.775),
('Yamasa', 'Monte Plata', 18.768, -70.085),
('Pedernales', 'Pedernales', 18.064, -71.743),
('Oviedo', 'Pedernales', 17.827, -71.46),
('Jose Francisco Pena Gomez', 'Pedernales', 17.9, -71.277),
('Juancho', 'Pedernales', 17.857, -71.543),
('Banil', 'Peravia', 18.351, -70.37),
('Nizao', 'Peravia', 18.269, -70.21),
('San Cristóbal', 'San Cristóbal', 18.415, -70.11),
('Bajos de Haina', 'San Cristóbal', 18.432, -70.031),
('Cambita Garabitos', 'San Cristóbal', 18.471, -70.223),
('Los Cacaos', 'San Cristóbal', 18.61, -70.326),
('Sabana Grande de Palenque', 'San Cristóbal', 18.258, -70.162),
('San Gregorio de Nigua', 'San Cristóbal', 18.353, -70.086),
('Villa Altagracia', 'San Cristóbal', 18.656, -70.179),
('Yaguate', 'San Cristóbal', 18.34, -70.188),
('San José de Ocoa', 'San José de Ocoa', 18.557, -70.439),
('Sabana Larga', 'San José de Ocoa', 19.47, -71.047),
('Rancho Arriba', 'San José de Ocoa', 18.774, -70.457),
('San Juan de la Maguana', 'San Juan', 18.897, -71.326),
('Bohechio', 'San Juan', 18.909, -71.021),
('El Cercado', 'San Juan', 18.71, -71.512),
('Juan de Herrera', 'San Juan', 18.876, -71.201),
('Las Matas de Farfan', 'San Juan', 18.954, -71.493),
('Vallejuelo', 'San Juan', 18.667, -71.11),
('Cotuil', 'Sánchez Ramírez', 18.998, -70.131),
('Fantino', 'Sánchez Ramírez', 19.103, -70.303),
('Cevicos', 'Sánchez Ramírez', 19.007, -69.976),
('La Mata', 'Sánchez Ramírez', 19.433, -70.464),
('San Ignacio de Roland', 'Santiago Rodríguez', 19.369, -71.327),
('Moncion', 'Santiago Rodríguez', 19.391, -71.081),
('Villa Los Comicos', 'Santiago Rodríguez', 19.336, -71.439),
('Mao', 'Valverde', 19.534, -71.042),
('Esperanza', 'Valverde', 19.63, -70.96),
('Laguna Salada', 'Valverde', 19.669, -71.101),
('Nagua', 'María Trinidad Sánchez', 19.35, -70.003),
('Cabrera', 'María Trinidad Sánchez', 19.58, -69.98),
('El Factor', 'María Trinidad Sánchez', 19.294, -69.931),
('Rio San Juan', 'María Trinidad Sánchez', 19.567, -70.089),
('Bonao', 'Monseñor Nouel', 18.943, -70.441),
('Mainon', 'Monseñor Nouel', 18.888, -70.27),
('Piedra Blanca', 'Monseñor Nouel', 18.812, -70.331),
('La Vega', 'La Vega', 19.208, -70.458),
('Constanza', 'La Vega', 18.865, -70.691),
('Jarabacoa', 'La Vega', 19.106, -70.702),
('Jima Abajo', 'La Vega', 19.118, -70.38),
('Santa Barbara de Samana', 'Samaná', 19.272, -69.32),
('Sanchez', 'Samaná', 19.143, -69.678),
('Las Terrenas', 'Samaná', 19.284, -69.566);

INSERT INTO Municipio (IdProvincia, NombreMunicipio, Latitud, Longitud)
SELECT p.IdProvincia, m.NombreMunicipio, m.Latitud, m.Longitud
FROM @m m
INNER JOIN Provincia p ON p.NombreProvincia = m.NombreProvincia
WHERE NOT EXISTS (
    SELECT 1 FROM Municipio mu
    INNER JOIN Provincia pu ON pu.IdProvincia = mu.IdProvincia
    WHERE mu.NombreMunicipio = m.NombreMunicipio AND pu.NombreProvincia = m.NombreProvincia
);";

        await context.Database.ExecuteSqlRawAsync(sql);
        using var countCmd = connection.CreateCommand();
        countCmd.CommandText = "SELECT COUNT(*) FROM Municipio";
        var finalCount = (int)countCmd.ExecuteScalar()!;
        logger.LogInformation("Municipios: seeded {Count} municipalities.", finalCount);
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
                id: Guid.Parse("66AFDABF-632E-434C-86F4-6F9060D2656F"), nombrePlan: "Profesional", precio: 60.00m,
                maxConsultas: 25, maxProyectos: 5, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 0, maxAlmacenamientoMb: 200,
                alertasTiempoRealDisponible: false, modeloLmDisponible: false, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: false,
                soporteTipo: "Email", accesoApi: false),

            // Empresa
            PlanSuscripcion.Create(
                id: Guid.Parse("41037268-58B6-40A3-A8AE-C18EFE00C7D3"), nombrePlan: "Empresa", precio: 170.00m,
                maxConsultas: 100, maxProyectos: 10, presentacionPublica: true,
                qrIncluido: true, maxUsuariosSecundarios: 5, maxAlmacenamientoMb: 1024,
                alertasTiempoRealDisponible: false, modeloLmDisponible: true, validacionLoteDisponible: false,
                exportacionExcelDisponible: false, exportacionPdfDisponible: true, integracionCrmDisponible: true,
                soporteTipo: "Prioritario", accesoApi: true),

            // Corporativo
            PlanSuscripcion.Create(
                id: Guid.Parse("F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4"), nombrePlan: "Corporativo", precio: 500.00m,
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

    private static async Task SeedTiposNotificacionesAsync(AppDbContext context, ILogger logger)
    {
        if (await context.TiposNotificaciones.AnyAsync()) return;

        logger.LogInformation("Seeding notification types taxonomy...");

        var tipos = new (string Codigo, string Nombre, string Categoria, byte Prioridad, string Canales)[]
        {
            ("BIENVENIDA_REGISTRO",     "Bienvenida a VeriFinca",            "Cuenta",       4, "InApp,Email"),
            ("CUENTA_CREADA",           "Cuenta creada",                     "Cuenta",       4, "InApp"),
            ("EMAIL_VERIFICADO",        "Email verificado",                  "Cuenta",       4, "InApp,Email"),
            ("CAMBIO_CONTRASENA",       "Contraseña actualizada",            "Cuenta",       2, "Email"),
            ("SUSCRIPCION_ACTIVADA",    "Suscripción activada",              "Billing",      2, "InApp,Email"),
            ("SUSCRIPCION_CANCELADA",   "Suscripción cancelada",             "Billing",      2, "InApp,Email"),
            ("PAGO_FALLIDO",            "Pago rechazado",                    "Billing",      1, "InApp,Email,Push"),
            ("PROYECTO_CREADO",         "Proyecto registrado",               "Proyectos",    4, "InApp"),
            ("PROYECTO_EDITADO",        "Proyecto actualizado",              "Proyectos",    5, "InApp"),
            ("PROYECTO_EN_REVISION",    "Proyecto en revisión",              "Proyectos",    3, "InApp,Email"),
            ("PROYECTO_PUBLICADO",      "Proyecto verificado y publicado",   "Proyectos",    2, "InApp,Email"),
            ("PROYECTO_OBSERVACION",    "Proyecto con observaciones",        "Proyectos",    2, "InApp,Email"),
            ("DOCUMENTO_SUBIDO",        "Documento cargado",                 "Documentos",   5, "InApp"),
            ("DOCUMENTO_VALIDADO",      "Documento validado",                "Documentos",   3, "InApp"),
            ("DOCUMENTO_RECHAZADO",     "Documento rechazado",               "Documentos",   2, "InApp,Email"),
            ("INTERES_REGISTRADO",      "Interés registrado en tu proyecto", "Social",       3, "InApp,Email"),
            ("INVITACION_RECIBIDA",     "Invitación de delegación recibida", "Social",       3, "InApp,Email"),
            ("LIMITES_DELEGACION",      "Límites de delegación actualizados","Social",       5, "InApp"),
            ("IPI_PENDIENTE",           "Deuda IPI detectada",               "Validaciones", 2, "InApp,Email"),
            ("IPI_RESUELTO",            "Deuda IPI resuelta",                "Validaciones", 3, "InApp"),
        };

        var entities = tipos.Select(t => new TipoNotificacion(
            t.Codigo, t.Nombre, t.Categoria, t.Prioridad, t.Canales));

        context.TiposNotificaciones.AddRange(entities);
        await context.SaveChangesAsync();
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
    /// Seed de documentos MOC (carpetas test_docs/) para los proyectos del seed
    /// + "Torre Playa Dorada Beach". Idempotente por (ProyectoId, TipoDocumento).
    /// Dev-only: SeedAsync solo corre con ASPNETCORE_ENVIRONMENT=Development o UseMockData=true.
    /// Los archivos se copian al blob storage real (IBlobStorageService) con fallback
    /// a URL mock si el storage no está disponible.
    /// </summary>
    private static async Task SeedTestDocumentsAsync(
        AppDbContext context,
        IServiceProvider serviceProvider,
        Guid usuarioCargaId,
        Usuario corporativoUser,
        List<Proyecto> seedProjects,
        ILogger logger)
    {
        var config = serviceProvider.GetService<Microsoft.Extensions.Configuration.IConfiguration>();
        var configuredPath = config?["Seed:TestDocumentsPath"];
        var basePath = !string.IsNullOrWhiteSpace(configuredPath)
            ? configuredPath!
            : new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "test_docs"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "test_docs"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "test_docs"),
            }.FirstOrDefault(Directory.Exists) ?? Path.Combine(Directory.GetCurrentDirectory(), "test_docs");

        if (!Directory.Exists(basePath))
        {
            logger.LogWarning("SeedTestDocuments: carpeta test_docs no encontrada en '{Path}'. Documentos MOC omitidos.", basePath);
            return;
        }

        var torre = await context.Proyectos.FirstOrDefaultAsync(p => p.Nombre == "Torre Playa Dorada Beach");
        if (torre == null)
        {
            torre = await GetOrCreateProyectoAsync(
                context,
                nombre: "Torre Playa Dorada Beach",
                ubicacionTexto: "Piedra Blanca, Monsenor Nouel",
                usuarioCreadorId: corporativoUser.Id,
                categoria: 12,
                datosDesarrollador: "BORDSHIPP DOMINICANA SRL",
                designacionCatastral: "120260167201:0091",
                status: ProjectStatus.Publicado);
        }

        // Seed QR seal for Torre Playa Dorada Beach
        var torreCodigo = "VF-2026-TORRE001";
        var torreToken = GenerateSealToken(torre.Id, torreCodigo);
        await GetOrCreateSelloIntegridadAsync(
            context,
            proyectoId: torre.Id,
            codigoSello: torreCodigo,
            nombre: "Sello de Integridad",
            nivel: NivelSelloIntegridad.Bronce,
            urlQr: $"http://localhost:3000/#/q/{torreToken}",
            firmaDigital: "firma-digital-simulada",
            qrToken: torreToken);

        var targetProjects = seedProjects.Concat(new[] { torre }).ToList();

        IBlobStorageService? blob = null;
        try { blob = serviceProvider.GetService<IBlobStorageService>(); }
        catch { blob = null; } // storage no configurado → fallback URL mock

        int inserted = 0, skipped = 0;
        foreach (var proyecto in targetProjects)
        {
            foreach (var (folder, tipo) in TestDocumentFolders)
            {
                if (await context.Documentos.AnyAsync(d => d.ProyectoId == proyecto.Id && d.TipoDocumento == tipo))
                {
                    skipped++;
                    continue;
                }

                var folderPath = Path.Combine(basePath, folder);
                if (!Directory.Exists(folderPath))
                {
                    logger.LogWarning("SeedTestDocuments: carpeta '{Folder}' no existe en test_docs", folder);
                    continue;
                }

                var file = Directory.GetFiles(folderPath).OrderBy(f => f).FirstOrDefault();
                if (file == null)
                {
                    logger.LogWarning("SeedTestDocuments: carpeta '{Folder}' vacía", folder);
                    continue;
                }

                var safeName = Path.GetFileName(file); // sanitiza: solo nombre de archivo, nunca rutas
                var ext = Path.GetExtension(safeName).ToLowerInvariant();
                var contentType = ext switch
                {
                    ".pdf" => "application/pdf",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".webp" => "image/webp",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    _ => "application/octet-stream",
                };

                var bytes = await File.ReadAllBytesAsync(file);
                var blobName = $"seed/{proyecto.Id}/{safeName}";
                var url = $"https://mockstorage.blob.core.windows.net/docs/{blobName}";
                if (blob != null)
                {
                    try
                    {
                        using var stream = new MemoryStream(bytes);
                        var result = await blob.UploadAsync(stream, blobName, contentType);
                        url = result.Url;
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "SeedTestDocuments: fallback a URL mock para '{File}' (blob no disponible)", safeName);
                    }
                }

                context.Documentos.Add(new Documento(
                    proyecto.Id, tipo, safeName, safeName, url,
                    contentType, ext.TrimStart('.'), bytes.Length, usuarioCargaId));
                inserted++;
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("SeedTestDocuments: {Inserted} documentos MOC insertados, {Skipped} ya existentes (idempotente).", inserted, skipped);
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
            var tipoBienvenida = await context.TiposNotificaciones
                .FindAsync(TipoNotificacionId.BienvenidaRegistro);
            var welcomeNotification = tipoBienvenida != null
                ? new Notificacion(
                    usuarioId: returnUser.Id,
                    mensaje: $"¡Bienvenido a VeriFinca, {returnUser.Nombre}! Tu cuenta ha sido activada correctamente.",
                    tipoNotificacionId: tipoBienvenida.Id,
                    tipoCodigo: tipoBienvenida.Codigo,
                    prioridad: tipoBienvenida.Prioridad,
                    canales: tipoBienvenida.Canales.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries),
                    enlaceRelacionado: "/dashboard")
                : new Notificacion(returnUser.Id,
                    $"¡Bienvenido a VeriFinca, {returnUser.Nombre}! Tu cuenta ha sido activada correctamente.",
                    "Info", "/dashboard");
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
        int categoria,
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
        string firmaDigital,
        string qrToken = "")
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
            firmaDigital,
            qrToken);
            
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

        // ponytail: int Id es fuente de verdad. Codigo string preserved as metadata.
        Notificacion notif;
        if (int.TryParse(tipo, out var tipoId))
        {
            var tipoFromCatalog = await context.TiposNotificaciones.FindAsync(tipoId);
            if (tipoFromCatalog != null)
            {
                var canales = tipoFromCatalog.Canales
                    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                notif = new Notificacion(usuarioId, mensaje, tipoFromCatalog.Id, tipoFromCatalog.Codigo,
                    tipoFromCatalog.Prioridad, canales, ruta);
            }
            else
            {
                notif = new Notificacion(usuarioId, mensaje, tipo, ruta);
            }
        }
        else
        {
            notif = new Notificacion(usuarioId, mensaje, tipo, ruta);
        }

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

    private static string GenerateSealToken(Guid projectId, string codigoSello)
    {
        const string signingSecret = "VERIFINCA_SEAL_SIGNING_KEY_2026";
        var payload = $"{projectId}|{codigoSello}|{DateTime.UtcNow:yyyyMMddHHmmss}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(signingSecret));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var token = Convert.ToBase64String(hashBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        return $"{Convert.ToBase64String(Encoding.UTF8.GetBytes(payload))}.{token}";
    }
}
