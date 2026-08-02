namespace Tests.Unit.Application;

using global::Application.Abstractions.Notifications;
using global::Application.Abstractions.Persistence;
using global::Application.DTOs;
using global::Application.Features.Projects;
using global::Domain.Entities;
using global::Domain.Enums;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Tests.Shared;
using Xunit;

/// <summary>
/// Red tests: ProjectService must reject CategoriaId values that are not
/// present (or not active) in the CategoriaProyecto catalog.
/// </summary>
public class ProjectServiceCategoryValidationTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepo = new();
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IEmailNotificationService> _emailSvc = new();

    private static readonly CategoriaProyecto Viviendas = new()
    {
        Id = 16,
        Nombre = "VIVIENDAS",
        Activo = true,
    };

    private ProjectService CreateSut() =>
        new(_proyectoRepo.Object, _usuarioRepo.Object,
            _emailSvc.Object, _uow.Object);

    private void MockActiveCatalog(params CategoriaProyecto[] categorias) =>
        _proyectoRepo.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto>(categorias));

    private static CreateProyectoDto MakeCreateDto(Guid userId, int categoriaId) =>
        new("Test Project", "Santo Domingo", userId,
            categoriaId, "Developer SA", "CAT-001");

    [Fact]
    public async Task CreateProject_CategoriaIdNotInActiveCatalog_ThrowsArgumentException()
    {
        var user = TestUsuarioFactory.Create(UserRole.User, TestPlanFactory.Consultor());
        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(user.Id, default))
            .ReturnsAsync(user);
        MockActiveCatalog(Viviendas);

        var sut = CreateSut();
        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => sut.CreateProjectAsync(MakeCreateDto(user.Id, categoriaId: 999)));

        Assert.Equal("CategoriaId", ex.ParamName);
    }

    [Fact]
    public async Task CreateProject_InactiveCategory_ThrowsArgumentException()
    {
        var user = TestUsuarioFactory.Create(UserRole.User, TestPlanFactory.Consultor());
        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(user.Id, default))
            .ReturnsAsync(user);
        var inactiva = new CategoriaProyecto { Id = 11, Nombre = "ESTRUCTURAS ESPECIALES", Activo = false };
        MockActiveCatalog(inactiva);

        var sut = CreateSut();
        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => sut.CreateProjectAsync(MakeCreateDto(user.Id, categoriaId: 11)));

        Assert.Equal("CategoriaId", ex.ParamName);
    }

    [Fact]
    public async Task CreateProject_CategoriaIdInActiveCatalog_Succeeds()
    {
        var admin = TestUsuarioFactory.Create(UserRole.Administrator, plan: null);
        var estadoCreado = new ProyectoEstado(
            ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(admin.Id, default))
            .ReturnsAsync(admin);
        _proyectoRepo.Setup(r => r.CountByUsuarioAsync(admin.Id, default))
            .ReturnsAsync(0);
        MockActiveCatalog(Viviendas);
        _proyectoRepo.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, default))
            .ReturnsAsync(estadoCreado);
        _proyectoRepo.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), default))
            .Returns(Task.CompletedTask);
        _uow.Setup(u => u.SaveChangesAsync(default))
            .ReturnsAsync(1);

        var sut = CreateSut();
        var result = await sut.CreateProjectAsync(MakeCreateDto(admin.Id, categoriaId: 16));

        Assert.Equal(16, result.CategoriaId);
        Assert.Equal("VIVIENDAS", result.CategoriaNombre);
    }

    [Fact]
    public async Task UpdateProject_CategoriaIdNotInActiveCatalog_ThrowsArgumentException()
    {
        var proyecto = new Proyecto("Test", "Santo Domingo", Guid.NewGuid(), 16);
        _proyectoRepo.Setup(r => r.GetByIdAsync(proyecto.Id, default))
            .ReturnsAsync(proyecto);
        MockActiveCatalog(Viviendas);

        var sut = CreateSut();
        var dto = new UpdateProyectoDto(
            "Test", "Santo Domingo", null, null, 999,
            null, null, null, null, null, null, null, null, null);

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => sut.UpdateProjectAsync(proyecto.Id, dto));

        Assert.Equal("CategoriaId", ex.ParamName);
    }

    [Fact]
    public async Task UpdateProject_CategoriaIdInActiveCatalog_Succeeds()
    {
        var proyecto = new Proyecto("Test", "Santo Domingo", Guid.NewGuid(), 16);
        var estadoEditado = new ProyectoEstado(
            ProjectStatusCodes.Editado, "Editado", "desc", "cond", "#9BACD8");

        _proyectoRepo.Setup(r => r.GetByIdAsync(proyecto.Id, default))
            .ReturnsAsync(proyecto);
        MockActiveCatalog(Viviendas);
        _proyectoRepo.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Editado, default))
            .ReturnsAsync(estadoEditado);
        _uow.Setup(u => u.SaveChangesAsync(default))
            .ReturnsAsync(1);

        var sut = CreateSut();
        var dto = new UpdateProyectoDto(
            "Test", "Santo Domingo", null, null, 16,
            null, null, null, null, null, null, null, null, null);

        var result = await sut.UpdateProjectAsync(proyecto.Id, dto);

        Assert.Equal(16, result.CategoriaId);
        Assert.Equal("VIVIENDAS", result.CategoriaNombre);
    }
}
