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

    [Fact]
    public async Task VerificarCatastroAsync_ShouldReturn100PercentMatch_ForEstadoJuridicoMock()
    {
        var dbName = Guid.NewGuid().ToString();
        using (var seedDb = NewDb(dbName))
        {
            var mockEj = new CatastroTitulo
            {
                IdCatastroTitulo = Guid.Parse("31ABE1EA-A002-4D46-83C0-000AAD5D5C61"),
                CodigoDesignacionCatastral = "050045565100:0004",
                NumeroTitulo = "1670449489",
                Rnc = "133725444",
                Provincia = "San Pedro de Macoris",
                Municipio = "Consuelo",
                Latitud = 18.591951m,
                Longitud = -69.260373m,
                Superficie = 1497.05m,
                Matricula = "1989501603",
                Oficina = "SANTO DOMINGO ESTE",
                DesigCatastralPosicional = "115860565503",
                DesignCatastralOrigen = "Parc. 74, DC-50",
                FechaEmision = DateTime.Parse("2019-05-16T22:02:05"),
                FechaInscripcion = DateTime.Parse("2017-08-03T22:02:05"),
                VieneDe = "T.270,M.25"
            };
            seedDb.CatastroTitulos.Add(mockEj);
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
            Matricula = "1989501603",
            DesignacionCatastral = "050045565100:0004",
            VieneDe = "T.270,M.25",
            FechaEmision = "16-05-2019",
            Oficina = "Santo Domingo Este",
            Provincia = "San Pedro de Macorís",
            Municipio = "Consuelo",
            SuperficieM2 = "1497.05"
        };

        var result = await service.VerificarCatastroAsync(request);

        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.MatchPercentage.Should().Be(100m);
        result.FailedFields.Should().BeEmpty();
    }

    [Fact]
    public async Task VerificarCatastroAsync_ShouldReturn100PercentMatch_ForPlanoMensuraMock()
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

        // Plano de Mensura payload with 5 critical fields
        var request = new CatastroVerificationRequest
        {
            ProyectoId = Guid.NewGuid(),
            DocumentoId = Guid.NewGuid(),
            TipoDocumento = "catastro",
            DesigCatastralPosicional = "875568784706",
            DesignCatastralOrigen = "Parc. 87, DC-85",
            Provincia = "San Pedro de Macorís",
            Municipio = "San Pedro de Macorís",
            SuperficieM2 = "1183.36"
        };

        var result = await service.VerificarCatastroAsync(request);

        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.MatchPercentage.Should().Be(100m);
        result.FailedFields.Should().BeEmpty();
    }
}
