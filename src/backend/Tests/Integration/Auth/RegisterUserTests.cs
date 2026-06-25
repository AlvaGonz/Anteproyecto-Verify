namespace Tests.Integration.Auth;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

[Collection("Database")]
public class RegisterUserTests : IntegrationTestBase
{
    public RegisterUserTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task POST_Register_Returns201_WithUserRole()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/register", new
        {
            nombre = "Juan",
            apellido = "Pérez",
            email = "juan.perez@test.com",
            password = "Test123!",
            confirmPassword = "Test123!",
            telefono = "8091234567",
            cedula = "001-1234567-8"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content
            .ReadFromJsonAsync<RegisterUserResultDto>();

        body!.Role.Should().Be("user");
        body.Role.Should().NotBe("developer");
        body.Role.Should().NotBe("professional");
        body.PlanNombre.Should().Be("Consultor");
    }

    [Fact]
    public async Task POST_Register_DuplicateEmail_Returns409()
    {
        var payload = new
        {
            nombre = "Ana",
            apellido = "García",
            email = "ana.garcia@test.com",
            password = "Test123!",
            confirmPassword = "Test123!",
            telefono = "8091234567",
            cedula = "001-0000002-2"
        };

        await Client.PostAsJsonAsync("/api/auth/register", payload);
        var duplicate = await Client.PostAsJsonAsync(
            "/api/auth/register", payload);

        duplicate.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}

public record RegisterUserResultDto(
    string Id, string Role, string PlanNombre);
