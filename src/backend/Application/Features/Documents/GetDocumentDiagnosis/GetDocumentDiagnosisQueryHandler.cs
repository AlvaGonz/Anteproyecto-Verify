namespace Application.Features.Documents.GetDocumentDiagnosis;

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.DocumentIntelligence;
using Application.Abstractions.Persistence;
using Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;

public class GetDocumentDiagnosisQueryHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IDocumentoRepository _documentoRepository;
    private readonly IAiDiagnosisService _aiDiagnosisService;
    private readonly IValidator<GetDocumentDiagnosisQuery> _validator;
    private readonly Microsoft.Extensions.Logging.ILogger<GetDocumentDiagnosisQueryHandler> _logger;

    private static readonly ConcurrentDictionary<Guid, DateTime> Cooldowns = new();

    public GetDocumentDiagnosisQueryHandler(
        IProyectoRepository proyectoRepository,
        IDocumentoRepository documentoRepository,
        IAiDiagnosisService aiDiagnosisService,
        IValidator<GetDocumentDiagnosisQuery> validator,
        Microsoft.Extensions.Logging.ILogger<GetDocumentDiagnosisQueryHandler> logger)
    {
        _proyectoRepository = proyectoRepository;
        _documentoRepository = documentoRepository;
        _aiDiagnosisService = aiDiagnosisService;
        _validator = validator;
        _logger = logger;
    }

    public async Task<DocumentDiagnosisDto> HandleAsync(GetDocumentDiagnosisQuery query, CancellationToken cancellationToken = default)
    {
        // 1. Validation
        var validationResult = await _validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // 2. Project Existence Check
        var proyecto = await _proyectoRepository.GetByIdAsync(query.ProjectId, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Proyecto con ID {query.ProjectId} no encontrado.");
        }

        // 3. Rate limiting (max 1 diagnosis per project per minute)
        if (Cooldowns.TryGetValue(query.ProjectId, out var lastRun))
        {
            var elapsed = DateTime.UtcNow - lastRun;
            if (elapsed < TimeSpan.FromMinutes(1))
            {
                var secondsLeft = (int)(60 - elapsed.TotalSeconds);
                _logger.LogWarning("Project {ProjectId} diagnosis requested during cooldown. {SecondsLeft}s remaining.", query.ProjectId, secondsLeft);
                throw new InvalidOperationException($"La solicitud de diagnóstico para este proyecto está en cooldown. Intente nuevamente en {secondsLeft} segundos.");
            }
        }

        // 4. Retrieve documents
        var documentos = await _documentoRepository.GetByProyectoIdAsync(query.ProjectId, cancellationToken);
        var documentList = documentos?.Where(d => d.Activo).ToList() ?? new List<Documento>();

        if (!documentList.Any())
        {
            return new DocumentDiagnosisDto(
                ProjectId: query.ProjectId,
                Score: 0,
                Summary: "Sin documentos registrados en el proyecto.",
                MissingDocuments: Array.Empty<string>(),
                Recommendations: new[] { "Debe subir los documentos requeridos para iniciar el diagnóstico." },
                Provider: "NVIDIA_NIM",
                GeneratedAt: DateTime.UtcNow
            );
        }

        // 5. Map Documento entities to DocumentContext records
        var contexts = documentList.Select(d => new DocumentContext(
            Type: d.TipoDocumento.ToString(),
            Status: d.EstadoDocumento.ToString(),
            OcrSummary: d.Observaciones,
            UploadedAt: d.CreatedAtUtc
        )).ToList();

        // Update cooldown time
        Cooldowns[query.ProjectId] = DateTime.UtcNow;

        // 6. Call AI Diagnosis Service
        try
        {
            _logger.LogInformation("Calling AI Diagnosis Service for Project {ProjectId} with {DocCount} documents.", query.ProjectId, contexts.Count);
            var aiResult = await _aiDiagnosisService.GenerateDiagnosisAsync(query.ProjectId, contexts, cancellationToken);
            
            return new DocumentDiagnosisDto(
                ProjectId: query.ProjectId,
                Score: aiResult.Score,
                Summary: aiResult.Summary,
                MissingDocuments: aiResult.MissingDocuments,
                Recommendations: aiResult.Recommendations,
                Provider: "NVIDIA_NIM",
                GeneratedAt: DateTime.UtcNow
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate AI diagnosis for project {ProjectId}.", query.ProjectId);
            
            // Fallback response as per requirements: Score: 0, Summary: "Servicio de IA no disponible"
            return new DocumentDiagnosisDto(
                ProjectId: query.ProjectId,
                Score: 0,
                Summary: "Servicio de IA no disponible temporalmente. Por favor, intente más tarde.",
                MissingDocuments: Array.Empty<string>(),
                Recommendations: new[] { "Reintente la operación más tarde o contacte al administrador." },
                Provider: "NVIDIA_NIM",
                GeneratedAt: DateTime.UtcNow
            );
        }
    }
}
