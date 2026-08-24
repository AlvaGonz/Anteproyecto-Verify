using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tests.Integration.Infrastructure;
using Xunit;

namespace Tests.Integration;

[Collection("Database")]
public class GlobalSearchTests : IntegrationTestBase
{
    public GlobalSearchTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task SearchGlobal_WithCertType_AndValidCode_Returns200AndResult()
    {
        // Arrange
        var sealCode = $"VF-TEST-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
        
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var cedula = "001-0000000-2";
            db.JCE_Ciudadanos.Add(new Domain.Entities.JCE_Ciudadano
            {
                Cedula = cedula,
                Nombres = "Test",
                Apellidos = "User",
                FechaNacimiento = DateTime.UtcNow.AddYears(-30),
                FechaExpiracion = DateTime.UtcNow.AddYears(10)
            });

            var user = new Usuario("Test", "Search", $"test.search.{Guid.NewGuid()}@domain.com", "hash", UserRole.User, "8095551234", cedula);
            var userIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            userIdProp?.SetValue(user, Guid.NewGuid());
            db.Usuarios.Add(user);
            
            var project = new Proyecto(
                "Test Project for Global Search", 
                "Location", 
                user.Id, 
                3, 
                "Dev Data", 
                "CAT-SEARCH");
            var projIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            projIdProp?.SetValue(project, Guid.NewGuid());
            var estadoCreado = await db.ProyectoEstados.FirstAsync();
            project.UpdateEstado(estadoCreado.Id);
            db.Proyectos.Add(project);

            // The seal table is SellosIntegridad, which handles the "cert" search
            var sello = new SelloIntegridad(
                project.Id,
                sealCode,
                "Sello de Prueba",
                NivelSelloIntegridad.Bronce,
                "http://test.qr",
                "test-signature",
                "token"
            );
            db.SellosIntegridad.Add(sello);
            
            await db.SaveChangesAsync();
        }

        // Act
        var response = await Client.GetAsync($"/api/v1/search/global?type=cert&q={sealCode}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<SearchResultDto>();
        content.Should().NotBeNull();
        content!.EsValido.Should().BeTrue();
        content.TipoConsulta.Should().Be("Certificación");
        content.TituloPrincipal.Should().Be("Sello de Prueba");
        content.Detalles.Should().ContainKey("Código");
        content.Detalles["Código"].Should().Be(sealCode);
    }
}
