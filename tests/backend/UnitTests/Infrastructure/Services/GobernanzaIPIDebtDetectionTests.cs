namespace UnitTests.Infrastructure.Services;

using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using global::Application.Abstractions.Notifications;
using global::Application.Abstractions.Persistence;
using global::Application.Contracts.Gobernanza;
using global::Domain.Entities;
using global::Infrastructure.Persistence;
using global::Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

public class GobernanzaIPIDebtDetectionTests
{
    private static AppDbContext NewDb(string name) =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(name).Options);

    [Fact]
    public async Task VerificarIpi_NoPagado_UpdatesProyectoAndCreatesNotification()
    {
        var dbName = nameof(VerificarIpi_NoPagado_UpdatesProyectoAndCreatesNotification);
        var proyectoId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var documentoId = Guid.NewGuid();

        using (var seedDb = NewDb(dbName))
        {
            var proyecto = new Proyecto("Test", "Loc", usuarioId, 8);
            typeof(Domain.Common.EntityBase).GetProperty("Id")!.SetValue(proyecto, proyectoId);
            seedDb.Proyectos.Add(proyecto);
            seedDb.PagosIPI.Add(new PagoIPI
            {
                Rnc = "123456789", Cuota_ipi = 5000m, Estatus = "No Pagado",
                NoCertificacion = "CERT-001", NoInmueble = "INM-001", ParcelaNo = "P-001"
            });
            seedDb.Documentos.Add(new Documento(proyectoId, "test.pdf", "application/pdf", 1024, "/blob/test.pdf", Domain.Enums.DocumentType.CertificacionIPI));
            await seedDb.SaveChangesAsync();
        }

        var notifFactoryMock = new Mock<INotificationFactory>();
        notifFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(usuarioId, "IPI Pendiente", "Info"));
        var notifRepoMock = new Mock<INotificacionRepository>();

        using (var db = NewDb(dbName))
        {
            var service = new GobernanzaDeDatosService(db, notifFactoryMock.Object, notifRepoMock.Object);

            var request = new IpiVerificationRequest
            {
                ProyectoId = proyectoId, DocumentoId = documentoId,
                Rnc = "123456789", NoCertificacion = "CERT-001",
                NoInmueble = "INM-001", ParcelaNo = "P-001",
                TipoDocumento = "CertificacionIPI"
            };

            var result = await service.VerificarIpiAsync(request);
            Assert.True(result.IsValid);
        }

        using (var verifyDb = NewDb(dbName))
        {
            var proyecto = await verifyDb.Proyectos.FindAsync(proyectoId);
            Assert.Equal("PAGO_PENDIENTE", proyecto?.EstatusIpi);
        }

        notifFactoryMock.Verify(f => f.CreateAsync(
            usuarioId, Domain.Enums.TipoNotificacionId.IpiPendiente,
            It.IsAny<string>(), It.IsAny<string>(),
            proyectoId, "Proyecto",
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task VerificarIpi_Idempotent_DoesNotDuplicatePendingAlert()
    {
        var dbName = nameof(VerificarIpi_Idempotent_DoesNotDuplicatePendingAlert);
        var proyectoId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var documentoId = Guid.NewGuid();

        using (var seedDb = NewDb(dbName))
        {
            var proyecto = new Proyecto("Test", "Loc", usuarioId, 8);
            typeof(Domain.Common.EntityBase).GetProperty("Id")!.SetValue(proyecto, proyectoId);
            seedDb.Proyectos.Add(proyecto);
            seedDb.PagosIPI.Add(new PagoIPI
            {
                Rnc = "123456789", Cuota_ipi = 5000m, Estatus = "No Pagado",
                NoCertificacion = "CERT-001", NoInmueble = "INM-001", ParcelaNo = "P-001"
            });
            seedDb.Documentos.Add(new Documento(proyectoId, "test.pdf", "application/pdf", 1024, "/blob/test.pdf", Domain.Enums.DocumentType.CertificacionIPI));
            seedDb.Documentos.Add(new Documento(proyectoId, "test2.pdf", "application/pdf", 1024, "/blob/test2.pdf", Domain.Enums.DocumentType.CertificacionIPI));
            await seedDb.SaveChangesAsync();
        }

        var notifFactoryMock = new Mock<INotificationFactory>();
        notifFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(usuarioId, "IPI Pendiente", "Info"));
        var notifRepoMock = new Mock<INotificacionRepository>();

        var request = new IpiVerificationRequest
        {
            ProyectoId = proyectoId, DocumentoId = documentoId,
            Rnc = "123456789", NoCertificacion = "CERT-001",
            NoInmueble = "INM-001", ParcelaNo = "P-001",
            TipoDocumento = "CertificacionIPI"
        };

        using (var db1 = NewDb(dbName))
        {
            var svc1 = new GobernanzaDeDatosService(db1, notifFactoryMock.Object, notifRepoMock.Object);
            await svc1.VerificarIpiAsync(request);
        }

        using (var db2 = NewDb(dbName))
        {
            var svc2 = new GobernanzaDeDatosService(db2, notifFactoryMock.Object, notifRepoMock.Object);
            await svc2.VerificarIpiAsync(request);
        }

        notifFactoryMock.Verify(f => f.CreateAsync(
            It.IsAny<Guid>(), Domain.Enums.TipoNotificacionId.IpiPendiente,
            It.IsAny<string>(), It.IsAny<string>(),
            proyectoId, It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task VerificarIpi_PagadoAfterPendiente_ResolvesAlert()
    {
        var dbName = nameof(VerificarIpi_PagadoAfterPendiente_ResolvesAlert);
        var proyectoId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var documentoId = Guid.NewGuid();

        using (var seedDb = NewDb(dbName))
        {
            var proyecto = new Proyecto("Test", "Loc", usuarioId, 8);
            typeof(Domain.Common.EntityBase).GetProperty("Id")!.SetValue(proyecto, proyectoId);
            seedDb.Proyectos.Add(proyecto);
            seedDb.Documentos.Add(new Documento(proyectoId, "test.pdf", "application/pdf", 1024, "/blob/test.pdf", Domain.Enums.DocumentType.CertificacionIPI));
            seedDb.PagosIPI.Add(new PagoIPI
            {
                Rnc = "123456789", Cuota_ipi = 5000m, Estatus = "No Pagado",
                NoCertificacion = "CERT-001", NoInmueble = "INM-001", ParcelaNo = "P-001"
            });
            await seedDb.SaveChangesAsync();
        }

        var notifFactoryMock = new Mock<INotificationFactory>();
        notifFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(usuarioId, "IPI", "Info"));
        var notifRepoMock = new Mock<INotificacionRepository>();

        var request = new IpiVerificationRequest
        {
            ProyectoId = proyectoId, DocumentoId = documentoId,
            Rnc = "123456789", NoCertificacion = "CERT-001",
            NoInmueble = "INM-001", ParcelaNo = "P-001",
            TipoDocumento = "CertificacionIPI"
        };

        using (var db1 = NewDb(dbName))
        {
            var svc1 = new GobernanzaDeDatosService(db1, notifFactoryMock.Object, notifRepoMock.Object);
            await svc1.VerificarIpiAsync(request);
        }

        using (var updateDb = NewDb(dbName))
        {
            var ipiRecord = await updateDb.PagosIPI.FindAsync("123456789");
            ipiRecord!.Estatus = "Pagado";
            await updateDb.SaveChangesAsync();
        }

        using (var db2 = NewDb(dbName))
        {
            var svc2 = new GobernanzaDeDatosService(db2, notifFactoryMock.Object, notifRepoMock.Object);
            await svc2.VerificarIpiAsync(request);
        }

        using (var verifyDb = NewDb(dbName))
        {
            var proyecto = await verifyDb.Proyectos.FindAsync(proyectoId);
            Assert.Equal("AL_DIA", proyecto?.EstatusIpi);
        }

        notifFactoryMock.Verify(f => f.CreateAsync(
            It.IsAny<Guid>(), Domain.Enums.TipoNotificacionId.IpiResuelto,
            It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<Guid?>(), It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
