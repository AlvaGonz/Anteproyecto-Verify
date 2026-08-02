namespace Tests.Unit.Application;

using global::Application.Common.Exceptions;
using global::Application.Features.Projects;
using global::Application.Abstractions.Persistence;
using global::Application.Contracts.Projects;
using global::Domain.Entities;
using global::Domain.Enums;
using global::Domain.Policies;
using Moq;
using Xunit;
using Tests.Shared;
using System;
using System.Threading;
using System.Threading.Tasks;

public class ProjectServiceQuotaTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepo = new();
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<global::Application.Abstractions.Notifications.IEmailNotificationService> _emailSvc = new();
    private ProjectService CreateSut() =>
        new(_proyectoRepo.Object, _usuarioRepo.Object,
            _emailSvc.Object, _uow.Object);

    private static global::Application.DTOs.CreateProyectoDto MakeDto(Guid userId) => new(
        "Test Project", "Santo Domingo", userId,
        16, "Developer SA", "CAT-001");

    [Fact]
    public async Task CreateProject_UserNotFound_ThrowsUnauthorized()
    {
        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(
            It.IsAny<Guid>(), default))
            .ReturnsAsync((Usuario?)null);

        var sut = CreateSut();
        await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(
            () => sut.CreateProjectAsync(MakeDto(Guid.NewGuid())));
    }

    [Fact]
    public async Task CreateProject_ConsultorAtQuota_ThrowsQuotaExceeded()
    {
        var plan = TestPlanFactory.Consultor(); // maxProyectos = 1
        var user = TestUsuarioFactory.Create(UserRole.User, plan);

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(user.Id, default))
            .ReturnsAsync(user);
        _proyectoRepo.Setup(r => r.CountByUsuarioAsync(user.Id, default))
            .ReturnsAsync(1); // already at limit

        var sut = CreateSut();
        var ex = await Assert.ThrowsAsync<QuotaExceededException>(
            () => sut.CreateProjectAsync(MakeDto(user.Id)));

        Assert.Equal("Consultor", ex.TierName);
        Assert.Equal("MaxProyectos", ex.LimitType);
    }

    [Fact]
    public async Task CreateProject_AdminNoPlan_SucceedsAt9999Projects()
    {
        var admin = TestUsuarioFactory.Create(UserRole.Administrator, plan: null);
        var estadoCreado = new ProyectoEstado(
            ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(admin.Id, default))
            .ReturnsAsync(admin);
        _proyectoRepo.Setup(r => r.CountByUsuarioAsync(admin.Id, default))
            .ReturnsAsync(9999);
        _proyectoRepo.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, default))
            .ReturnsAsync(estadoCreado);
        _proyectoRepo.Setup(r => r.AddAsync(
            It.IsAny<Proyecto>(), default))
            .Returns(Task.CompletedTask);
        _uow.Setup(u => u.SaveChangesAsync(default))
            .ReturnsAsync(1);

        var sut = CreateSut();
        var result = await sut.CreateProjectAsync(MakeDto(admin.Id));
        Assert.NotNull(result);
    }

    [Fact]
    public async Task CreateProject_AssignsEstadoCreado_BeforeSave()
    {
        var plan = TestPlanFactory.Profesional();
        var user = TestUsuarioFactory.Create(UserRole.User, plan);
        var estadoCreado = new ProyectoEstado(
            ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");
        Proyecto? captured = null;

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(user.Id, default))
            .ReturnsAsync(user);
        _proyectoRepo.Setup(r => r.CountByUsuarioAsync(user.Id, default))
            .ReturnsAsync(0);
        _proyectoRepo.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, default))
            .ReturnsAsync(estadoCreado);
        _proyectoRepo.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), default))
            .Callback<Proyecto, CancellationToken>((p, _) => captured = p)
            .Returns(Task.CompletedTask);
        _uow.Setup(u => u.SaveChangesAsync(default))
            .ReturnsAsync(1);

        var sut = CreateSut();
        await sut.CreateProjectAsync(MakeDto(user.Id));

        Assert.NotNull(captured);
        Assert.Equal(estadoCreado.Id, captured!.EstadoId);
        Assert.NotEqual(Guid.Empty, captured.EstadoId);
    }

    [Fact]
    public async Task CreateProject_EstadoCreadoMissing_ThrowsInvalidOperation()
    {
        var plan = TestPlanFactory.Profesional();
        var user = TestUsuarioFactory.Create(UserRole.User, plan);

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(user.Id, default))
            .ReturnsAsync(user);
        _proyectoRepo.Setup(r => r.CountByUsuarioAsync(user.Id, default))
            .ReturnsAsync(0);
        _proyectoRepo.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, default))
            .ReturnsAsync((ProyectoEstado?)null);

        var sut = CreateSut();
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => sut.CreateProjectAsync(MakeDto(user.Id)));
    }
}

