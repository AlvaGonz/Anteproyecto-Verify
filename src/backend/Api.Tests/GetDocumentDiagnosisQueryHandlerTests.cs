namespace Api.Tests;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.DocumentIntelligence;
using Application.Abstractions.Persistence;
using Application.Features.Documents.GetDocumentDiagnosis;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Xunit;

public class GetDocumentDiagnosisQueryHandlerTests
{
    private readonly IProyectoRepository _fakeProyectoRepository;
    private readonly IDocumentoRepository _fakeDocumentoRepository;
    private readonly IAiDiagnosisService _fakeAiDiagnosisService;
    private readonly IValidator<GetDocumentDiagnosisQuery> _fakeValidator;
    private readonly GetDocumentDiagnosisQueryHandler _sut;

    public GetDocumentDiagnosisQueryHandlerTests()
    {
        _fakeProyectoRepository = Substitute.For<IProyectoRepository>();
        _fakeDocumentoRepository = Substitute.For<IDocumentoRepository>();
        _fakeAiDiagnosisService = Substitute.For<IAiDiagnosisService>();
        _fakeValidator = Substitute.For<IValidator<GetDocumentDiagnosisQuery>>();

        _sut = new GetDocumentDiagnosisQueryHandler(
            _fakeProyectoRepository,
            _fakeDocumentoRepository,
            _fakeAiDiagnosisService,
            _fakeValidator,
            NullLogger<GetDocumentDiagnosisQueryHandler>.Instance
        );
    }

    [Fact]
    public async Task HandleAsync_HappyPath_ReturnsExpectedDto()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var creatorId = Guid.NewGuid();
        var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };

        var validationResult = new ValidationResult();
        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        var project = new Proyecto("Proyecto Residencial", "Santo Domingo", creatorId);
        _fakeProyectoRepository.GetByIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Proyecto?>(project));

        var doc1 = new Documento(projectId, "titulo.pdf", "application/pdf", 1024, "/docs/titulo.pdf", DocumentType.CertificadoTitulo);
        var doc2 = new Documento(projectId, "planos.pdf", "application/pdf", 2048, "/docs/planos.pdf", DocumentType.PlanosArquitectonicos);
        var docs = new List<Documento> { doc1, doc2 };
        _fakeDocumentoRepository.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<IEnumerable<Documento>>(docs));

        var aiDiagnosis = new AiDiagnosisResult(
            Score: 85,
            Summary: "Expediente completo y en orden",
            MissingDocuments: new List<string>(),
            Recommendations: new List<string> { "Proceder a la validación de sellos" }
        );
        _fakeAiDiagnosisService.GenerateDiagnosisAsync(projectId, Arg.Any<IReadOnlyList<DocumentContext>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(aiDiagnosis));

        // Act
        var result = await _sut.HandleAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(projectId, result.ProjectId);
        Assert.Equal(85, result.Score);
        Assert.Equal("Expediente completo y en orden", result.Summary);
        Assert.Empty(result.MissingDocuments);
        Assert.Single(result.Recommendations);
        Assert.Equal("NVIDIA_NIM", result.Provider);
    }

    [Fact]
    public async Task HandleAsync_ValidationError_ThrowsValidationException()
    {
        // Arrange
        var query = new GetDocumentDiagnosisQuery { ProjectId = Guid.Empty };
        var validationFailure = new ValidationFailure("ProjectId", "El ID del proyecto es requerido.");
        var validationResult = new ValidationResult(new[] { validationFailure });

        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => _sut.HandleAsync(query));
    }

    [Fact]
    public async Task HandleAsync_ProjectNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };

        var validationResult = new ValidationResult();
        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        _fakeProyectoRepository.GetByIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Proyecto?>(null));

        // Act & Assert
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.HandleAsync(query));
        Assert.Contains(projectId.ToString(), ex.Message);
    }

    [Fact]
    public async Task HandleAsync_NoDocuments_ReturnsScoreZeroAndDefaultSummary()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var creatorId = Guid.NewGuid();
        var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };

        var validationResult = new ValidationResult();
        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        var project = new Proyecto("Proyecto Test", "Ubicación", creatorId);
        _fakeProyectoRepository.GetByIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Proyecto?>(project));

        _fakeDocumentoRepository.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<IEnumerable<Documento>>(new List<Documento>()));

        // Act
        var result = await _sut.HandleAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.Score);
        Assert.Contains("Sin documentos registrados", result.Summary);
        Assert.Empty(result.MissingDocuments);
        Assert.Single(result.Recommendations);
    }

    [Fact]
    public async Task HandleAsync_AiServiceThrows_ReturnsFallbackResult()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var creatorId = Guid.NewGuid();
        var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };

        var validationResult = new ValidationResult();
        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        var project = new Proyecto("Proyecto Test", "Ubicación", creatorId);
        _fakeProyectoRepository.GetByIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Proyecto?>(project));

        var doc = new Documento(projectId, "titulo.pdf", "application/pdf", 1024, "/docs/titulo.pdf", DocumentType.CertificadoTitulo);
        _fakeDocumentoRepository.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<IEnumerable<Documento>>(new List<Documento> { doc }));

        _fakeAiDiagnosisService.GenerateDiagnosisAsync(projectId, Arg.Any<IReadOnlyList<DocumentContext>>(), Arg.Any<CancellationToken>())
            .Throws(new Exception("API error"));

        // Act
        var result = await _sut.HandleAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.Score);
        Assert.Contains("Servicio de IA no disponible temporalmente", result.Summary);
        Assert.Single(result.Recommendations);
    }

    [Fact]
    public async Task HandleAsync_CalledTwiceWithinOneMinute_ThrowsInvalidOperationException()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var creatorId = Guid.NewGuid();
        var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };

        var validationResult = new ValidationResult();
        _fakeValidator.ValidateAsync(query, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(validationResult));

        var project = new Proyecto("Proyecto Test", "Ubicación", creatorId);
        _fakeProyectoRepository.GetByIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Proyecto?>(project));

        var doc = new Documento(projectId, "titulo.pdf", "application/pdf", 1024, "/docs/titulo.pdf", DocumentType.CertificadoTitulo);
        _fakeDocumentoRepository.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<IEnumerable<Documento>>(new List<Documento> { doc }));

        var aiDiagnosis = new AiDiagnosisResult(80, "Ok", new List<string>(), new List<string>());
        _fakeAiDiagnosisService.GenerateDiagnosisAsync(projectId, Arg.Any<IReadOnlyList<DocumentContext>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(aiDiagnosis));

        // Act - First call should succeed
        var firstResult = await _sut.HandleAsync(query);
        Assert.NotNull(firstResult);

        // Act & Assert - Second call should throw rate limit exception
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.HandleAsync(query));
        Assert.Contains("cooldown", ex.Message);
    }
}
