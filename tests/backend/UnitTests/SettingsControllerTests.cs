namespace UnitTests.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Domain.Entities;
using Domain.Enums;
using Domain.Common;
using global::Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

public class SettingsControllerTests
{
    private AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        
        return new AppDbContext(options);
    }

    private void SetupControllerContext(global::Api.Controllers.SettingsController controller, string? email, string role = "user")
    {
        var httpContext = new DefaultHttpContext();
        if (email != null)
        {
            var claims = new List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, email),
                new System.Security.Claims.Claim("role", role)
            };
            var identity = new System.Security.Claims.ClaimsIdentity(claims, "TestAuthType");
            httpContext.User = new System.Security.Claims.ClaimsPrincipal(identity);
        }
        
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    [Fact]
    public async Task GetUsers_Should_Return_Forbidden_When_No_Cookie()
    {
        // Arrange
        using var context = CreateDbContext("Settings_GetUsers_NoCookie");
        var mockHasher = new Mock<global::Application.Abstractions.Security.IPasswordHasher>();
        var controller = new global::Api.Controllers.SettingsController(context, mockHasher.Object);
        SetupControllerContext(controller, null);

        // Act
        var result = await controller.GetUsers(1, 50, CancellationToken.None);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
    }

    [Fact]
    public async Task GetUsers_Should_Return_Forbidden_When_User_Is_Not_Admin()
    {
        // Arrange
        var dbName = "Settings_GetUsers_NotAdmin";
        using (var context = CreateDbContext(dbName))
        {
            var user = new Usuario("Juan", "Perez", "juan@verifinca.do", "hash", UserRole.User, "123", "123");
            context.Usuarios.Add(user);
            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var mockHasher = new Mock<global::Application.Abstractions.Security.IPasswordHasher>();
            var controller = new global::Api.Controllers.SettingsController(context, mockHasher.Object);
            SetupControllerContext(controller, "juan@verifinca.do", "user");

            // Act
            var result = await controller.GetUsers(1, 50, CancellationToken.None);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
        }
    }

    [Fact]
    public async Task GetUsers_Should_Return_Users_And_Perform_Sync_When_User_Is_Admin()
    {
        // Arrange
        var dbName = "Settings_GetUsers_Success";
        var adminProfileId = Guid.NewGuid();
        var devProfileId = Guid.NewGuid();
        var freePlanId = Guid.NewGuid();
        var proPlanId = Guid.NewGuid();

        using (var context = CreateDbContext(dbName))
        {
            var admin = new Usuario("Admin", "User", "admin@verifinca.do", "hash", UserRole.Administrator, "123", "123");
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.User, "456", "456");
            context.Usuarios.AddRange(admin, dev);

            context.Perfiles.AddRange(
                new Perfil { IdPerfil = adminProfileId, NombrePerfil = "ADMIN" },
                new Perfil { IdPerfil = devProfileId, NombrePerfil = "DEVELOPER" }
            );
            context.PlanesSuscripcion.AddRange(
                PlanSuscripcion.Create(freePlanId, "Gratuito", 0.00m, 5, 1, false, false, false, false),
                PlanSuscripcion.Create(proPlanId, "Profesional", 3500.00m, -1, 5, true, true, false, false)
            );
            
            // Add legacy view records manually for InMemory testing
            context.UsuariosLegacy.AddRange(
                new UsuarioLegacy { IdUsuario = admin.Id, Email = admin.Email, Nombre = "A", Apellido = "A", NombreCompleto = "A A", Telefono = "1", Cedula = "1", ContrasenaHash = "1" },
                new UsuarioLegacy { IdUsuario = dev.Id, Email = dev.Email, Nombre = "D", Apellido = "D", NombreCompleto = "D D", Telefono = "2", Cedula = "2", ContrasenaHash = "2" }
            );

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var mockHasher = new Mock<global::Application.Abstractions.Security.IPasswordHasher>();
            var controller = new global::Api.Controllers.SettingsController(context, mockHasher.Object);
            SetupControllerContext(controller, "admin@verifinca.do", "admin");

            // Act
            var result = await controller.GetUsers(1, 50, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<global::Api.Controllers.PaginatedResponse<global::Api.Controllers.AdminUserSettingsDto>>(okResult.Value);
            Assert.Equal(2, response.TotalCount);
            Assert.Equal(2, response.Items.Count);

            // Verify syncing occurred
            var legacyUsers = await context.UsuariosLegacy.ToListAsync();
            Assert.Equal(2, legacyUsers.Count);
            Assert.Contains(legacyUsers, lu => lu.Email == "admin@verifinca.do");
            Assert.Contains(legacyUsers, lu => lu.Email == "dev@verifinca.do");
        }
    }

    [Fact]
    public async Task UpdateUserRole_Should_Update_Role_And_Legacy_Profile()
    {
        // Arrange
        var dbName = "Settings_UpdateUserRole";
        var devUserGuid = Guid.NewGuid();
        var adminProfileId = Guid.NewGuid();
        var devProfileId = Guid.NewGuid();
        var validatorProfileId = Guid.NewGuid();

        using (var context = CreateDbContext(dbName))
        {
            var admin = new Usuario("Admin", "User", "admin@verifinca.do", "hash", UserRole.Administrator, "123", "123");
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.User, "456", "456");
            
            // Set explicit ID for testing
            typeof(EntityBase).GetProperty("Id")?.SetValue(dev, devUserGuid);

            context.Usuarios.AddRange(admin, dev);

            context.Perfiles.AddRange(
                new Perfil { IdPerfil = adminProfileId, NombrePerfil = "ADMIN" },
                new Perfil { IdPerfil = devProfileId, NombrePerfil = "DEVELOPER" },
                new Perfil { IdPerfil = validatorProfileId, NombrePerfil = "VALIDATOR" }
            );

            context.UsuariosLegacy.AddRange(
                new UsuarioLegacy { IdUsuario = admin.Id, Email = admin.Email, Nombre = "A", Apellido = "A", NombreCompleto = "A A", Telefono = "1", Cedula = "1", ContrasenaHash = "1" },
                new UsuarioLegacy { IdUsuario = dev.Id, Email = dev.Email, Nombre = "D", Apellido = "D", NombreCompleto = "D D", Telefono = "2", Cedula = "2", ContrasenaHash = "2" }
            );

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var mockHasher = new Mock<global::Application.Abstractions.Security.IPasswordHasher>();
            var controller = new global::Api.Controllers.SettingsController(context, mockHasher.Object);
            SetupControllerContext(controller, "admin@verifinca.do", "admin");

            var request = new global::Api.Controllers.UpdateRoleRequest { Role = "user" };

            // Act
            var result = await controller.UpdateUserRole(devUserGuid, request, CancellationToken.None);

            // Assert
            Assert.IsType<OkObjectResult>(result);

            // Verify DB update
            var updatedUser = await context.Usuarios.FindAsync(devUserGuid);
            Assert.NotNull(updatedUser);
            Assert.Equal(UserRole.User, updatedUser.Rol);

            var legacyUser = await context.UsuariosLegacy.FirstOrDefaultAsync(lu => lu.Email == "dev@verifinca.do");
            Assert.NotNull(legacyUser);

            var acceso = await context.Accesos.FirstOrDefaultAsync(a => a.IdUsuario == legacyUser.IdUsuario);
            Assert.NotNull(acceso);
            Assert.Equal(devProfileId, acceso.IdPerfil);
        }
    }

    [Fact]
    public async Task UpdateUserPlan_Should_Insert_Legacy_Pago_Record()
    {
        // Arrange
        var dbName = "Settings_UpdateUserPlan";
        var devUserGuid = Guid.NewGuid();
        var empresaPlanId = Guid.NewGuid();

        using (var context = CreateDbContext(dbName))
        {
            var admin = new Usuario("Admin", "User", "admin@verifinca.do", "hash", UserRole.Administrator, "123", "123");
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.User, "456", "456");
            
            typeof(EntityBase).GetProperty("Id")?.SetValue(dev, devUserGuid);

            context.Usuarios.AddRange(admin, dev);
            context.PlanesSuscripcion.Add(PlanSuscripcion.Create(empresaPlanId, "Empresa", 10000.00m, -1, -1, true, true, true, true));

            context.UsuariosLegacy.AddRange(
                new UsuarioLegacy { IdUsuario = admin.Id, Email = admin.Email, Nombre = "A", Apellido = "A", NombreCompleto = "A A", Telefono = "1", Cedula = "1", ContrasenaHash = "1" },
                new UsuarioLegacy { IdUsuario = dev.Id, Email = dev.Email, Nombre = "D", Apellido = "D", NombreCompleto = "D D", Telefono = "2", Cedula = "2", ContrasenaHash = "2" }
            );

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var mockHasher = new Mock<global::Application.Abstractions.Security.IPasswordHasher>();
            var controller = new global::Api.Controllers.SettingsController(context, mockHasher.Object);
            SetupControllerContext(controller, "admin@verifinca.do", "admin");

            var request = new global::Api.Controllers.UpdatePlanRequest { PlanId = empresaPlanId };

            // Act
            var result = await controller.UpdateUserPlan(devUserGuid, request, CancellationToken.None);

            // Assert
            Assert.IsType<OkObjectResult>(result);

            // Verify payment record in DB
            var legacyUser = await context.UsuariosLegacy.FirstOrDefaultAsync(lu => lu.Email == "dev@verifinca.do");
            Assert.NotNull(legacyUser);

            var pago = await context.PagosLegacy.FirstOrDefaultAsync(p => p.IdUsuario == legacyUser.IdUsuario);
            Assert.NotNull(pago);
            Assert.Equal(empresaPlanId, pago.Idsuscripcion);
            Assert.Equal(10000.00m, pago.Monto);
        }
    }
}
