namespace IntegrationTests;

using System;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

public class PersistenceTests
{
    [Fact]
    public async Task Can_Save_And_Retrieve_Usuario()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var usuario = new Usuario("Test", "User", "test@example.com", "hash", UserRole.Professional, "8095550199", "40212345678");

        // Act
        using (var context = new AppDbContext(options))
        {
            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();
        }

        // Assert
        using (var context = new AppDbContext(options))
        {
            var savedUsuario = await context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == "test@example.com");
            Assert.NotNull(savedUsuario);
            Assert.Equal("Test User", savedUsuario.NombreCompleto);
        }
    }

    [Fact]
    public async Task Can_Save_And_Retrieve_Proyecto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var usuario = new Usuario("Test", "User", "test@example.com", "hash", UserRole.Professional, "8095550199", "40212345678");
        var proyecto = new Proyecto("Test Project", "Test Location", usuario.Id);

        // Act
        using (var context = new AppDbContext(options))
        {
            context.Usuarios.Add(usuario);
            context.Proyectos.Add(proyecto);
            await context.SaveChangesAsync();
        }

        // Assert
        using (var context = new AppDbContext(options))
        {
            var savedProyecto = await context.Proyectos.Include(p => p.UsuarioCreador).FirstOrDefaultAsync(p => p.Nombre == "Test Project");
            Assert.NotNull(savedProyecto);
            Assert.Equal("Test Location", savedProyecto.UbicacionTexto);
            Assert.NotNull(savedProyecto.UsuarioCreador);
            Assert.Equal("test@example.com", savedProyecto.UsuarioCreador.CorreoElectronico);
        }
    }
}
