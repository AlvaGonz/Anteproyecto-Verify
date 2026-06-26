namespace Tests.Integration.Auth;

using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using Tests.Integration.Helpers;
using Application.Features.Auth.Commands.RegisterUser;
using Microsoft.Extensions.DependencyInjection;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class RegisterUserIntegrationTests : IntegrationTestBase
{
    public RegisterUserIntegrationTests(VeriFincaWebFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task POST_Register_Returns201_UserRoleIsUser()
    {
        var email = $"juan.int.{Guid.NewGuid()}@test.com"; var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            nombre = "Juan",
            apellido = "Perez",
            email = email,
            password = "Test1234!",
            telefono = "8091234567",
            cedula = "00100000009"
        });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<RegisterUserResultDto>();
        Assert.NotNull(body);
        Assert.True(body.IsSuccess, body.ErrorMessage ?? "No error message");        
        
        using var scope = _factory.Services.CreateScope();
        var userRepo = scope.ServiceProvider.GetRequiredService<IUsuarioRepository>();
        var user = await userRepo.GetByEmailAsync(email);
        Assert.NotNull(user);
        Assert.Equal(UserRole.User, user.Rol); 
    }
}
