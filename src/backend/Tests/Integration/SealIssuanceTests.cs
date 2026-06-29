using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Text.Json;
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
public class SealIssuanceTests : IntegrationTestBase
{
    public SealIssuanceTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task EmitirSello_ForEligibleProject_ReturnsSuccessAndSealCode()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("seal.issuer@test.com", "Password123!");
        SetBearerToken(token);

        Guid projectId = Guid.NewGuid();
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == "seal.issuer@test.com");
            
            var project = new Proyecto(
                "Seal Issuance Test Project", 
                "Location", 
                user.Id, 
                ProjectCategory.Residencial, 
                "Dev Data", 
                "CAT-SEAL-ISSUE");
            var projIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            projIdProp?.SetValue(project, projectId);
            
            db.Proyectos.Add(project);
            await db.SaveChangesAsync();
        }

        // Act
        var response = await Client.PostAsync($"/api/proyectos/{projectId}/sello-integridad", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        bool isSuccess = content.GetProperty("isSuccess").GetBoolean();
        isSuccess.Should().BeTrue();
        
        string sealCode = content.GetProperty("codigoSello").GetString()!;
        sealCode.Should().NotBeNullOrWhiteSpace();
        sealCode.Should().StartWith("VERIFINCA-");
    }

    [Fact]
    public async Task EmitirSello_WhenProjectAlreadyHasSeal_ReturnsError()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("seal.duplicate@test.com", "Password123!");
        SetBearerToken(token);

        Guid projectId = Guid.NewGuid();
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == "seal.duplicate@test.com");
            
            var project = new Proyecto(
                "Duplicate Seal Project", 
                "Location", 
                user.Id, 
                ProjectCategory.Residencial, 
                "Dev Data", 
                "CAT-SEAL-DUP");
            var projIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            projIdProp?.SetValue(project, projectId);
            db.Proyectos.Add(project);

            var existingSeal = new SelloIntegridad(
                projectId,
                "VERIFINCA-OLD-CODE",
                "Sello Bronce",
                NivelSelloIntegridad.Bronce,
                "https://url",
                "firma-dummy"
            );
            db.SellosIntegridad.Add(existingSeal);
            await db.SaveChangesAsync();
        }

        // Act
        var response = await Client.PostAsync($"/api/proyectos/{projectId}/sello-integridad", null);

        // Assert
        // In the controller: if (!result.IsSuccess) return BadRequest(result.Mensaje);
        // Wait, the handler returns a success DTO or error DTO, let's see. 
        // If the controller returns BadRequest(result.Mensaje), then we expect 400.
        // Let's assume BadRequest. If it returns 200 with IsSuccess=false, then OK. Let's check the controller.
        // From EmitirSelloCommandHandler: it returns EmitirSelloResultDto.
        // From controller (we saw earlier): `if (!result.IsSuccess) return BadRequest(new { Message = result.Mensaje });`
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
