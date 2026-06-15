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

    private void SetupControllerContext(SettingsController controller, string? tokenValue)
    {
        var httpContext = new DefaultHttpContext();
        if (tokenValue != null)
        {
            httpContext.Request.Headers.Append("Cookie", $"vf_token={tokenValue}");
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
        var controller = new SettingsController(context);
        SetupControllerContext(controller, null);

        // Act
        var result = await controller.GetUsers(CancellationToken.None);

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
            var user = new Usuario("Juan", "Perez", "juan@verifinca.do", "hash", UserRole.Professional, "123", "123");
            context.Usuarios.Add(user);
            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var controller = new SettingsController(context);
            var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("juan@verifinca.do"));
            SetupControllerContext(controller, token);

            // Act
            var result = await controller.GetUsers(CancellationToken.None);

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
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.Professional, "456", "456");
            context.Usuarios.AddRange(admin, dev);

            context.Perfiles.AddRange(
                new Perfil { IdPerfil = adminProfileId, NombrePerfil = "ADMIN" },
                new Perfil { IdPerfil = devProfileId, NombrePerfil = "DEVELOPER" }
            );
            context.PlanesSuscripcion.AddRange(
                new PlanSuscripcion { Idsuscripcion = freePlanId, NombrePlan = "Gratuito", Precio = 0.00m },
                new PlanSuscripcion { Idsuscripcion = proPlanId, NombrePlan = "Profesional", Precio = 3500.00m }
            );

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var controller = new SettingsController(context);
            var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("admin@verifinca.do"));
            SetupControllerContext(controller, token);

            // Act
            var result = await controller.GetUsers(CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var usersList = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.Equal(2, usersList.Count());

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
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.Professional, "456", "456");
            
            // Set explicit ID for testing
            typeof(EntityBase).GetProperty("Id")?.SetValue(dev, devUserGuid);

            context.Usuarios.AddRange(admin, dev);

            context.Perfiles.AddRange(
                new Perfil { IdPerfil = adminProfileId, NombrePerfil = "ADMIN" },
                new Perfil { IdPerfil = devProfileId, NombrePerfil = "DEVELOPER" },
                new Perfil { IdPerfil = validatorProfileId, NombrePerfil = "VALIDATOR" }
            );

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var controller = new SettingsController(context);
            var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("admin@verifinca.do"));
            SetupControllerContext(controller, token);

            var request = new UpdateRoleRequest { Role = "validator" };

            // Act
            var result = await controller.UpdateUserRole(devUserGuid, request, CancellationToken.None);

            // Assert
            Assert.IsType<OkObjectResult>(result);

            // Verify DB update
            var updatedUser = await context.Usuarios.FindAsync(devUserGuid);
            Assert.NotNull(updatedUser);
            Assert.Equal(UserRole.Consultation, updatedUser.Rol);

            var legacyUser = await context.UsuariosLegacy.FirstOrDefaultAsync(lu => lu.Email == "dev@verifinca.do");
            Assert.NotNull(legacyUser);

            var acceso = await context.Accesos.FirstOrDefaultAsync(a => a.IdUsuario == legacyUser.IdUsuario);
            Assert.NotNull(acceso);
            Assert.Equal(validatorProfileId, acceso.IdPerfil); // VALIDATOR profile
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
            var dev = new Usuario("Dev", "User", "dev@verifinca.do", "hash", UserRole.Professional, "456", "456");
            
            typeof(EntityBase).GetProperty("Id")?.SetValue(dev, devUserGuid);

            context.Usuarios.AddRange(admin, dev);
            context.PlanesSuscripcion.Add(new PlanSuscripcion { Idsuscripcion = empresaPlanId, NombrePlan = "Empresa", Precio = 10000.00m });

            await context.SaveChangesAsync();
        }

        using (var context = CreateDbContext(dbName))
        {
            var controller = new SettingsController(context);
            var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("admin@verifinca.do"));
            SetupControllerContext(controller, token);

            var request = new UpdatePlanRequest { PlanId = empresaPlanId };

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
