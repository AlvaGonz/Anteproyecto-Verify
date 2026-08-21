namespace UnitTests.Infrastructure.Services;

using System;
using System.Threading.Tasks;
using FluentAssertions;
using global::Application.Abstractions.Notifications;
using global::Application.Abstractions.Persistence;
using global::Application.Contracts.Gobernanza;
using global::Domain.Entities;
using global::Infrastructure.Persistence;
using global::Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

public class GobernanzaCatastroMatchTests
{
    private static AppDbContext NewDb(string name) =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(name).Options);

    private static CatastroTitulo CreateMockCatastroTitulo() => new()
    {
        IdCatastroTitulo = Guid.Parse("907B72E6-F8F8-4BDC-89F3-0001201D1897"),
        CodigoDesignacionCatastral = "050036294345:0053",
        NumeroTitulo = "1670448638",
        Rnc = "131950213",
        Provincia = "San Pedro de Macoris",
        Municipio = "San Pedro de Macoris",
        Latitud = 18.491015m,
        Longitud = -69.269868m,
        Superficie = 1183.36m,
        Matricula = "1989500752",
        Oficina = "PUERTO PLATA",
        DesigCatastralPosicional = "875568784706",
        DesignCatastralOrigen = "Parc. 87, DC-85",
        FechaEmision = DateTime.Parse("2024-07-09T22:02:05"),
        FechaInscripcion = DateTime.Parse("2018-07-31T22:02:05"),
        VieneDe = "F.414,X.85"
    };

    [Fact]
    public async Task VerificarCatastroAsync_ShouldReturn100PercentMatch_WithAccentedDropdownsAndFormattedValues()
    {
        var dbName = Guid.NewGuid().ToString();
        using (var seedDb = NewDb(dbName))
        {
            seedDb.CatastroTitulos.Add(CreateMockCatastroTitulo());
            await seedDb.SaveChangesAsync();
        }

        using var db = NewDb(dbName);
        var notifFactoryMock = new Mock<INotificationFactory>();
        var notifRepoMock = new Mock<INotificacionRepository>();
        var service = new GobernanzaDeDatosService(db, notifFactoryMock.Object, notifRepoMock.Object);

        var request = new CatastroVerificationRequest
        {
            ProyectoId = Guid.NewGuid(),
            DocumentoId = Guid.NewGuid(),
            TipoDocumento = "catastro",
            Matricula = "1989500752",
            DesignacionCatastral = "050036294345:0053",
            Oficina = "PUERTO PLATA",
            FechaInscripcion = "2018-07-31",
            VieneDe = "F.414, X.85", // Space variation from OCR
            Provincia = "San Pedro de Macorís", // Accent from frontend catalog
            Municipio = "San Pedro de Macorís", // Accent from frontend catalog
            SuperficieM2 = "1,183.36" // Formatted with comma
        };

        var result = await service.VerificarCatastroAsync(request);

        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.MatchPercentage.Should().Be(100m);
        result.FailedFields.Should().BeEmpty();
    }

    [Fact]
    public async Task VerificarCatastroAsync_ShouldMatchDatesInVariousFormats()
    {
        var dbName = Guid.NewGuid().ToString();
        using (var seedDb = NewDb(dbName))
        {
            seedDb.CatastroTitulos.Add(CreateMockCatastroTitulo());
            await seedDb.SaveChangesAsync();
        }

        using var db = NewDb(dbName);
        var notifFactoryMock = new Mock<INotificationFactory>();
        var notifRepoMock = new Mock<INotificacionRepository>();
        var service = new GobernanzaDeDatosService(db, notifFactoryMock.Object, notifRepoMock.Object);

        var request = new CatastroVerificationRequest
        {
            ProyectoId = Guid.NewGuid(),
            DocumentoId = Guid.NewGuid(),
            TipoDocumento = "catastro",
            Matricula = "1989500752",
            FechaInscripcion = "31-07-2018" // DD-MM-YYYY format
        };

        var result = await service.VerificarCatastroAsync(request);

        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.FailedFields.Should().NotContain("FechaInscripcion");
    }
}
