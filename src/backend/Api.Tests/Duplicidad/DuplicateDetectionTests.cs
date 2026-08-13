using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs.Projects;
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
    private readonly ICatastroLookupRepository _catastroLookupRepoMock;
    private readonly CheckDuplicateExpedienteCommandHandler _handler;

    public DuplicateDetectionTests()
    {
        _proyectoRepoMock = Substitute.For<IProyectoRepository>();
        _deteccionRepoMock = Substitute.For<IDeteccionDuplicidadRepository>();
        _auditoriaRepoMock = Substitute.For<IAuditoriaRepository>();
        _uowMock = Substitute.For<IUnitOfWork>();
        _catastroLookupRepoMock = Substitute.For<ICatastroLookupRepository>();

        _handler = new CheckDuplicateExpedienteCommandHandler(
            _proyectoRepoMock,
            _deteccionRepoMock,
            _auditoriaRepoMock,
            _uowMock,
            _catastroLookupRepoMock
        );
    }

    [Fact]
    public async Task CheckDuplicate_ExactMatch_BlocksSealAndReturnsCritical()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var existingProjectId = Guid.NewGuid();

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 1, "Developer", "CAT-123");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, 1, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid(), 1, "Developer", "CAT-123");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        existingProject.UpdateDetails("Existing", "Location", "GPS-123", null, 1, "Developer", "CAT-123");
        existingProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(visibleProjects);

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

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, 1, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        // Partial match: only 2 attributes match (Catastral and Matricula), GPS is different
        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        existingProject.UpdateDetails("Existing", "Location", "GPS-999", null, 1, "Developer", "CAT-123");
        existingProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(visibleProjects);

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
        
        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "GPS-123", null, 1, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Ninguno, result.NivelRiesgo);
        Assert.False(result.Bloqueante);
        Assert.Null(result.ProyectoDuplicadoId);
        
        Assert.False(targetProject.SelladoBloqueado);
    }

    [Fact]
    public async Task CheckDuplicate_CatastroTituloMatch_BlocksSealAndReturnsCritical()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 1, "Developer", "CAT-123");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", "18.503131,-69.941731", null, 1, "Developer", "CAT-123");
        targetProject.UpdateRncYMatricula("RNC-123", "MAT-123");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(new List<Proyecto> { targetProject });

        var catastroMatches = new List<CatastroLookupDto>
        {
            new CatastroLookupDto("CAT-123", "MAT-123", 100, null, null, null, null, null)
        };
        _catastroLookupRepoMock.GetByMatriculaOrDesignacionAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(catastroMatches);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Critico, result.NivelRiesgo);
        Assert.True(result.Bloqueante);
        Assert.True(targetProject.SelladoBloqueado);
        Assert.Contains("CatastroTitulo", result.DescripcionCoincidencia);
    }

    [Fact]
    public async Task CheckDuplicate_CoordinateRadiusMatch_ReturnsHighRisk()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var existingProjectId = Guid.NewGuid();

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        // Distancia en grados < 0.00135
        targetProject.UpdateDetails("Target", "Location", "18.503000,-69.941000", null, 1, "Dev", "CAT-999");
        
        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        // Diferencia de 0.001 en latitud (menor al limite de ~0.00135 de 150m aprox)
        existingProject.UpdateDetails("Existing", "Location", "18.504000,-69.941000", null, 1, "Dev", "CAT-888");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Alto, result.NivelRiesgo); // Only coordinates matched => Alto
        Assert.Equal(existingProjectId, result.ProyectoDuplicadoId);
    }

    [Fact]
    public async Task CheckDuplicate_NormalizationMatch_ReturnsHighRisk()
    {
        // Arrange
        var targetProjectId = Guid.NewGuid();
        var existingProjectId = Guid.NewGuid();

        var targetProject = new Proyecto("Target", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(targetProject, targetProjectId);
        targetProject.UpdateDetails("Target", "Location", null, null, 1, "Developer", "cat 123");
        targetProject.UpdateRncYMatricula(null, "NO 999-888");

        var existingProject = new Proyecto("Existing", "Location", Guid.NewGuid(), 16);
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(existingProject, existingProjectId);
        existingProject.UpdateDetails("Existing", "Location", null, null, 1, "Developer", "CAT123");
        existingProject.UpdateRncYMatricula(null, "999-888");

        _proyectoRepoMock.GetByIdAsync(targetProjectId, Arg.Any<CancellationToken>()).Returns(targetProject);
        
        var visibleProjects = new List<Proyecto> { targetProject, existingProject };
        _proyectoRepoMock.GetVisibleAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(visibleProjects);

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = targetProjectId, UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DuplicityRiskLevel.Alto, result.NivelRiesgo); // 2 fields matched => Alto
        Assert.Equal(existingProjectId, result.ProyectoDuplicadoId);
    }
}
