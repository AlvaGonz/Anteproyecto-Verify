using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.Validation.Commands.CheckDuplicateExpediente;
using Domain.Entities;
using Domain.Enums;
using NSubstitute;
using Xunit;

namespace Api.Tests.Duplicidad;

public class DuplicateDetectionTests
{
    private readonly IProyectoRepository _proyectoRepoMock;
    private readonly IDeteccionDuplicidadRepository _deteccionRepoMock;
    private readonly IAuditoriaRepository _auditoriaRepoMock;
    private readonly IUnitOfWork _uowMock;
    private readonly CheckDuplicateExpedienteCommandHandler _handler;

    public DuplicateDetectionTests()
    {
        _proyectoRepoMock = Substitute.For<IProyectoRepository>();
        _deteccionRepoMock = Substitute.For<IDeteccionDuplicidadRepository>();
        _auditoriaRepoMock = Substitute.For<IAuditoriaRepository>();
        _uowMock = Substitute.For<IUnitOfWork>();

        _handler = new CheckDuplicateExpedienteCommandHandler(
            _proyectoRepoMock,
            _deteccionRepoMock,
            _auditoriaRepoMock,
            _uowMock
        );
    }

    [Fact]
    public async Task CheckDuplicate_ExactMatch_BlocksSealAndReturnsCritical()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var existingProjectId = Guid.NewGuid();

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), ProjectCategory.Residencial, "Developer", "CAT-123");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, ProjectCategory.Residencial, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid(), ProjectCategory.Residencial, "Developer", "CAT-123");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        existingProject.UpdateDetails("Existing", "Location", "GPS-123", null, ProjectCategory.Residencial, "Developer", "CAT-123");
        existingProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Critico, result.NivelRiesgo);
        Assert.True(result.Bloqueante);
        Assert.Equal(existingProjectId, result.ProyectoDuplicadoId);
        
        // Ensure seal was blocked
        Assert.True(targetProject.SelladoBloqueado);
    }

    [Fact]
    public async Task CheckDuplicate_PartialMatch_ReturnsHighRiskButDoesNotBlock()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var existingProjectId = Guid.NewGuid();

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, ProjectCategory.Residencial, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        // Partial match: only 2 attributes match (Catastral and Matricula), GPS is different
        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        existingProject.UpdateDetails("Existing", "Location", "GPS-999", null, ProjectCategory.Residencial, "Developer", "CAT-123");
        existingProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Alto, result.NivelRiesgo);
        Assert.False(result.Bloqueante);
        Assert.Equal(existingProjectId, result.ProyectoDuplicadoId);
        
        // Ensure seal was not blocked
        Assert.False(targetProject.SelladoBloqueado);
    }

    [Fact]
    public async Task CheckDuplicate_NoMatches_ReturnsNone()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        
        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, ProjectCategory.Residencial, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Ninguno, result.NivelRiesgo);
        Assert.False(result.Bloqueante);
        Assert.Null(result.ProyectoDuplicadoId);
        
        Assert.False(targetProject.SelladoBloqueado);
    }
}
