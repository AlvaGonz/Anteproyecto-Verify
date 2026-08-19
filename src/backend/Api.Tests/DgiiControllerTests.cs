using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Api.Tests;

public class DgiiControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DgiiControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    public record DgiiTestResponse(
        string Rnc,
        string NombreRazonSocial,
        string NombreComercial,
        string Estado,
        string ActividadEconomica
    );

    [Fact]
    public async Task GetByRnc_WhenRncExistsInDgii_ReturnsDgiiRecord()
    {
        // Arrange
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var testRnc = "999999999";
        var existing = await context.DGII.FindAsync(testRnc);
        if (existing == null)
        {
            context.DGII.Add(new DGII
            {
                Rnc = testRnc,
                NombreRazonSocial = "Empresa de Prueba S.A.",
                NombreComercial = "Prueba Comercial",
                Estado = "ACTIVO",
                ActividadEconomica = "CONSTRUCCION"
            });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await client.GetAsync($"/api/dgii/rnc/{testRnc}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var data = await response.Content.ReadFromJsonAsync<DgiiTestResponse>();
        Assert.NotNull(data);
        Assert.Equal(testRnc, data.Rnc);
        Assert.Equal("Empresa de Prueba S.A.", data.NombreRazonSocial);
    }

    [Fact]
    public async Task GetByRnc_WhenRncDoesNotExistInDgiiButExistsInJce_ReturnsSimulatedDgiiRecord()
    {
        // Arrange
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var testCedula = "99999999999";
        
        // Remove from DGII if it exists to test fallback
        var dgiiRecord = await context.DGII.FindAsync(testCedula);
        if (dgiiRecord != null)
        {
            context.DGII.Remove(dgiiRecord);
            await context.SaveChangesAsync();
        }

        var existingCitizen = await context.JCE_Ciudadanos.FindAsync(testCedula);
        if (existingCitizen == null)
        {
            context.JCE_Ciudadanos.Add(new JCE_Ciudadano
            {
                Cedula = testCedula,
                Nombres = "Juan",
                Apellidos = "Perez",
                FechaNacimiento = new System.DateTime(1990, 1, 1),
                FechaExpiracion = new System.DateTime(2030, 1, 1)
            });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await client.GetAsync($"/api/dgii/rnc/{testCedula}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var data = await response.Content.ReadFromJsonAsync<DgiiTestResponse>();
        Assert.NotNull(data);
        Assert.Equal(testCedula, data.Rnc);
        Assert.Equal("Juan Perez", data.NombreRazonSocial);
        Assert.Equal("PERSONA FÍSICA", data.ActividadEconomica);
    }

    [Fact]
    public async Task GetByRnc_WhenDoesNotExistInEither_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();
        var nonexistent = "88888888888";

        // Act
        var response = await client.GetAsync($"/api/dgii/rnc/{nonexistent}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
