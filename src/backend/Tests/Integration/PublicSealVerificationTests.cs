using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Tests.Integration.Infrastructure;
using Xunit;

namespace Tests.Integration;

[Collection("Database")]
public class PublicSealVerificationTests : IntegrationTestBase
{
    public PublicSealVerificationTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task VerifyCode_WhenCodeIsValid_Returns200AndVerificationData()
    {
        // Arrange
        var sealCode = $"SEAL-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
        
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var user = new Usuario("Test", "Seal", $"test.seal.{Guid.NewGuid()}@domain.com", "hash", UserRole.User, "8095551234", "001-0000000-1");
            var userIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            userIdProp?.SetValue(user, Guid.NewGuid());
            db.Usuarios.Add(user);
            
            var project = new Proyecto(
                "Test Project for Seal", 
                "Location", 
                user.Id, 
                16, 
                "Dev Data", 
                "CAT-SEAL");
            var projIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            projIdProp?.SetValue(project, Guid.NewGuid());
            db.Proyectos.Add(project);

            var cert = new Certificacion(
                project.Id,
                sealCode,
                "https://mock-url.com"
            );
            db.Certificaciones.Add(cert);
            
            await db.SaveChangesAsync();
        }

        // Act
        var response = await Client.GetAsync($"/api/public/verify/{sealCode}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<Application.DTOs.Public.PublicProjectVerificationDto>();
        content.Should().NotBeNull();
        content!.PublicCode.Should().Be(sealCode);
        content.IsVerifiable.Should().BeTrue();
    }

    [Fact]
    public async Task VerifyCode_WhenCodeIsInvalid_Returns404()
    {
        // Act
        var response = await Client.GetAsync($"/api/public/verify/INVALID-CODE");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
