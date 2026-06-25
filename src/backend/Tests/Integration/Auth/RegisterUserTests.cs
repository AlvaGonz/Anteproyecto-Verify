namespace Tests.Integration.Auth;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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
            cedula = "001-1234567-3"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content
            .ReadFromJsonAsync<Application.Features.Auth.Commands.RegisterUser.RegisterUserResultDto>();

        body.Should().NotBeNull();
        body!.IsSuccess.Should().BeTrue();
        body.UsuarioId.Should().NotBeNull();

        var userId = body.UsuarioId!.Value;
        
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();

        var userInDb = await db.Usuarios
            .Include(u => u.Plan)
            .FirstOrDefaultAsync(u => u.Id == userId);

        userInDb.Should().NotBeNull();
        userInDb!.Rol.Should().Be(Domain.Enums.UserRole.User);
        userInDb.Plan.Should().NotBeNull();
        userInDb.Plan!.NombrePlan.Should().Be("Consultor");
    }

    [Fact]
    public async Task POST_Register_DuplicateEmail_Returns400()
    {
        var payload = new
        {
            nombre = "Ana",
            apellido = "García",
            email = "ana.garcia@test.com",
            password = "Test123!",
            confirmPassword = "Test123!",
            telefono = "8091234567",
            cedula = "001-0000002-5"
        };

        await Client.PostAsJsonAsync("/api/auth/register", payload);
        var duplicate = await Client.PostAsJsonAsync(
            "/api/auth/register", payload);

        duplicate.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}

