using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Domain.Entities;
using Application.Abstractions.Security;
using NSubstitute;
using Microsoft.Extensions.Logging;

namespace Api.Tests.Persistence;

public class AppDbContextSeederTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ServiceProvider _serviceProvider;
    private readonly string _testCsvPath;

    public AppDbContextSeederTests()
    {
        var services = new ServiceCollection();

        var dbName = Guid.NewGuid().ToString();
        // Create in-memory database
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: dbName));

        services.AddLogging(builder => builder.AddConsole());
        
        var passwordHasherMock = Substitute.For<IPasswordHasher>();
        passwordHasherMock.HashPassword(Arg.Any<string>()).Returns("hashed_password");
        services.AddSingleton(passwordHasherMock);

        // Missing mock for some storage services might be needed by the seeder, but let's try just DbContext.

        _serviceProvider = services.BuildServiceProvider();
        _context = _serviceProvider.GetRequiredService<AppDbContext>();

        _testCsvPath = Path.Combine(Path.GetTempPath(), $"ProyectosInmobiliarios_{Guid.NewGuid()}.csv");
        var csvContent = @"Id,Nombre,Status,Desarrollador,Tipo,FechaInicio
1,Proyecto Prueba 1,CREADO,Desarrollador 1,Residencial,2026-01-01
2,Proyecto Prueba 2,ACTIVO,Desarrollador 2,Comercial,2026-02-01";
        File.WriteAllText(_testCsvPath, csvContent);
    }

    [Fact]
    public async Task SeedAsync_ShouldPopulateProyectosInmobiliarios_WhenCsvIsPresent()
    {
        // Act
        await AppDbContextSeeder.SeedAsync(_serviceProvider);

        // Assert
        var proyectos = await _context.Proyectos.ToListAsync();
        
        Assert.True(proyectos.Count > 0, "Proyectos should be populated.");
        Assert.Equal(120, proyectos.Count);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        _serviceProvider.Dispose();
        if (File.Exists(_testCsvPath))
        {
            File.Delete(_testCsvPath);
        }
    }
}
