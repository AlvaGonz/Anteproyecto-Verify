using System;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Domain.Entities;

namespace Api.Tests.Persistence;

public class ProyectoRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProyectoRepository _repository;

    public ProyectoRepositoryTests()
    {
        var dbName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        _context = new AppDbContext(options);
        _repository = new ProyectoRepository(_context);
    }

    [Fact]
    public async Task GetAllWithCountAsync_EndDateFilter_IncludesProjectsOnSameDay()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@test.com", "123", Domain.Enums.UserRole.User, "001", "hash");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);

        var category = new CategoriaProyecto { Id = 1, Nombre = "Test" };
        var status = new ProyectoEstado("CREADO", "Creado", "desc", "cond", "#000");

        var p1 = new Proyecto("Test1", "Loc", userId, 1);
        p1.UpdateEstado(status);
        p1.CreatedAtUtc = new DateTime(2026, 8, 12, 10, 0, 0, DateTimeKind.Utc);

        var p2 = new Proyecto("Test2", "Loc", userId, 1);
        p2.UpdateEstado(status);
        p2.CreatedAtUtc = new DateTime(2026, 8, 14, 15, 0, 0, DateTimeKind.Utc); // 3 PM on the 14th

        var p3 = new Proyecto("Test3", "Loc", userId, 1);
        p3.UpdateEstado(status);
        p3.CreatedAtUtc = new DateTime(2026, 8, 15, 8, 0, 0, DateTimeKind.Utc);

        await _context.Usuarios.AddAsync(user);
        await _context.CategoriasProyecto.AddAsync(category);
        await _context.Set<ProyectoEstado>().AddAsync(status);
        await _context.Proyectos.AddRangeAsync(p1, p2, p3);
        await _context.SaveChangesAsync();

        var startDate = new DateTime(2026, 8, 12, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 8, 14, 0, 0, 0, DateTimeKind.Utc);

        // Act
        var result = await _repository.GetAllWithCountAsync(
            usuarioId: null,
            page: 1,
            pageSize: 10,
            searchTerm: null,
            estados: null,
            startDate: startDate,
            endDate: endDate,
            cancellationToken: default);

        // Assert
        Assert.Equal(2, result.TotalCount); // Should include p1 and p2, not p3
        Assert.Contains(result.Items, p => p.Nombre == "Test1");
        Assert.Contains(result.Items, p => p.Nombre == "Test2");
    }

    [Fact]
    public async Task GetDocumentCompletionRateAsync_TwoEssentialsOneAnexo_Returns42Percent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@test.com", "123", Domain.Enums.UserRole.User, "001", "hash");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);

        var projectId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Category 16", "Loc", userId, 16);
        proyecto.GetType().GetProperty("Id")?.SetValue(proyecto, projectId);

        var doc1 = new Documento(projectId, Domain.Enums.DocumentType.TITLE, "title.pdf", "title.pdf", "/path", "application/pdf", ".pdf", 100, userId);
        var doc2 = new Documento(projectId, Domain.Enums.DocumentType.CertificacionEstadoJuridico, "status.pdf", "status.pdf", "/path", "application/pdf", ".pdf", 100, userId);
        var doc3 = new Documento(projectId, Domain.Enums.DocumentType.CertificadoUsoSuelo, "uso.pdf", "uso.pdf", "/path", "application/pdf", ".pdf", 100, userId);

        await _context.Usuarios.AddAsync(user);
        await _context.Proyectos.AddAsync(proyecto);
        await _context.Documentos.AddRangeAsync(doc1, doc2, doc3);
        await _context.SaveChangesAsync();

        // Act
        var rate = await _repository.GetDocumentCompletionRateAsync(projectId, 16, default);

        // Assert: 2 essentials (32%) + 1 anexo (10%) = 42%
        Assert.Equal(42, rate);
    }

    [Fact]
    public async Task GetDocumentCompletionRateAsync_AllDocuments_Returns100Percent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@test.com", "123", Domain.Enums.UserRole.User, "001", "hash");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);

        var projectId = Guid.NewGuid();
        var proyecto = new Proyecto("Complete Project", "Loc", userId, 8);
        proyecto.GetType().GetProperty("Id")?.SetValue(proyecto, projectId);

        var docs = new[]
        {
            new Documento(projectId, Domain.Enums.DocumentType.CertificadoTitulo, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.CertificacionEstadoJuridico, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.PlanoMensuraCatastral, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.ID, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.CertificacionIPI, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.CertificadoUsoSuelo, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
            new Documento(projectId, Domain.Enums.DocumentType.NOTARIAL_POWER, "doc.pdf", "doc.pdf", "/p", "application/pdf", ".pdf", 1, userId),
        };

        await _context.Usuarios.AddAsync(user);
        await _context.Proyectos.AddAsync(proyecto);
        await _context.Documentos.AddRangeAsync(docs);
        await _context.SaveChangesAsync();

        // Act
        var rate = await _repository.GetDocumentCompletionRateAsync(projectId, 8, default);

        // Assert
        Assert.Equal(100, rate);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
