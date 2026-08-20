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

public class GobernanzaValidationPersistenceTests
{
    private static AppDbContext NewDb(string name) =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(name).Options);

    [Fact]
    public async Task ObtenerResultadoPorDocumentoAsync_ReturnsNull_WhenNoValidationExists()
    {
        var dbName = nameof(ObtenerResultadoPorDocumentoAsync_ReturnsNull_WhenNoValidationExists);
        var notifFactoryMock = new Mock<INotificationFactory>();
        var notifRepoMock = new Mock<INotificacionRepository>();

        using var db = NewDb(dbName);
        var service = new GobernanzaDeDatosService(db, notifFactoryMock.Object, notifRepoMock.Object);

        var result = await service.ObtenerResultadoPorDocumentoAsync(Guid.NewGuid());
        Assert.Null(result);
    }

    [Fact]
    public async Task ObtenerResultadoPorDocumentoAsync_ReturnsPersistedResult_WhenDatoValidadoExists()
    {
        var dbName = nameof(ObtenerResultadoPorDocumentoAsync_ReturnsPersistedResult_WhenDatoValidadoExists);
        var proyectoId = Guid.NewGuid();
        var documentoId = Guid.NewGuid();

        using (var seedDb = NewDb(dbName))
        {
            var dato = new DatoValidado(proyectoId, documentoId, "Catastro");
            dato.UpdateResultados("{\"matricula\":\"123\"}", "{\"matricula\":\"123\"}", 100.0);
            seedDb.DatosValidados.Add(dato);
            await seedDb.SaveChangesAsync();
        }

        var notifFactoryMock = new Mock<INotificationFactory>();
        var notifRepoMock = new Mock<INotificacionRepository>();

        using (var db = NewDb(dbName))
        {
            var service = new GobernanzaDeDatosService(db, notifFactoryMock.Object, notifRepoMock.Object);
            var result = await service.ObtenerResultadoPorDocumentoAsync(documentoId);

            Assert.NotNull(result);
            Assert.True(result.IsValid);
            Assert.Equal(100m, result.MatchPercentage);
            Assert.NotNull(result.MatchedData);
        }
    }
}
