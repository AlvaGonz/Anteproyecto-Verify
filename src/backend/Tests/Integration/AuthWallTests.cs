using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Tests.Integration.Infrastructure;
using Xunit;

namespace Tests.Integration;

[Collection("Database")]
public class AuthWallTests : IntegrationTestBase
{
    public AuthWallTests(SqlServerFixture fixture) : base(fixture) { }

    private object ValidProjectPayload(Guid userId) => new
    {
        nombre = "Test Project",
        ubicacionTexto = "Location",
        categoriaId = 16,
        datosDesarrollador = "DevData",
        designacionCatastral = "CAT-123",
        usuarioCreadorId = userId
    };

    [Fact]
    public async Task AnonymousUser_CannotCreateProject_Returns401()
    {
        // Arrange: explicitly clear any existing token
        Client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects", ValidProjectPayload(Guid.NewGuid()));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AnonymousUser_CanAccessPublicProjects_Returns200()
    {
        // Arrange: clear token
        Client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await Client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
