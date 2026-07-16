namespace Application.Services.Validation;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalValidation;
using Application.Abstractions.Persistence;
using Application.Abstractions.Validation;
using Application.DTOs.ExternalValidation;
using Application.DTOs.Validation;
using Application.DTOs.Validations;
using Domain.Entities;
using Domain.Enums;

public class ProjectValidationOrchestrator : IProjectValidationOrchestrator
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IInternalValidationEngine _internalValidationEngine;
    private readonly IExternalProviderResolver _externalProviderResolver;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IReporteRepository _reporteRepository;
    private readonly IIntegrityScoringService _scoringService;
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectValidationOrchestrator(
        IProyectoRepository proyectoRepository,
        IInternalValidationEngine internalValidationEngine,
        IExternalProviderResolver externalProviderResolver,
        IAuditoriaRepository auditoriaRepository,
        IReporteRepository reporteRepository,
        IIntegrityScoringService scoringService,
        ISelloIntegridadRepository selloRepository,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _internalValidationEngine = internalValidationEngine;
        _externalProviderResolver = externalProviderResolver;
        _auditoriaRepository = auditoriaRepository;
        _reporteRepository = reporteRepository;
        _scoringService = scoringService;
        _selloRepository = selloRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ValidationExecutionResult> RunFullValidationAsync(Guid projectId, Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var startedAtUtc = DateTime.UtcNow;
        var executionId = Guid.NewGuid();
        var errors = new List<string>();

        // 1. Validar que el proyecto exista
        var proyecto = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");
        }

        // Registrar inicio de auditoría
        await LogAuditAsync(projectId, userId, "ValidacionIniciada", $"Iniciando validación completa para el proyecto {proyecto.Nombre}", cancellationToken);

        // 2. Ejecutar validación interna
        InternalValidationSummaryDto? internalResult = null;
        try
        {
            internalResult = await _internalValidationEngine.RunValidationAsync(projectId, cancellationToken);
            await LogAuditAsync(projectId, userId, "ValidacionInternaCompletada", "Validación interna completada exitosamente.", cancellationToken);
        }
        catch (Exception ex)
        {
            errors.Add($"Error en validación interna: {ex.Message}");
            await LogAuditAsync(projectId, userId, "ValidacionInternaFallida", $"Error: {ex.Message}", cancellationToken);
        }

        // 3. Invocar adaptadores externos
        var externalResults = new List<ValidationSourceResult>();
        var providersToCall = Enum.GetValues<ExternalProviderType>();

        foreach (var providerType in providersToCall)
        {
            try
            {
                var provider = _externalProviderResolver.Resolve(providerType);
                
                // Determinar la referencia a consultar según el proveedor
                string referenceNumber = GetReferenceNumberForProvider(proyecto, providerType);
                
                if (string.IsNullOrWhiteSpace(referenceNumber))
                {
                    externalResults.Add(new ValidationSourceResult(
                        providerType.ToString(),
                        ExternalValidationStatus.Inconsistent.ToString(),
                        false,
                        false,
                        "No hay número de referencia configurado en el proyecto para esta fuente.",
                        new List<string> { "Referencia faltante." },
                        DateTime.UtcNow,
                        null,
                        null
                    ));
                    continue;
                }

                var request = new ExternalValidationRequest(projectId, null, referenceNumber, providerType);
                var result = await provider.ValidateAsync(request, cancellationToken);

                externalResults.Add(new ValidationSourceResult(
                    providerType.ToString(),
                    result.Status.ToString(),
                    result.Status == ExternalValidationStatus.Success || result.Status == ExternalValidationStatus.Inconsistent || result.Status == ExternalValidationStatus.NotFound,
                    result.IsMatch,
                    result.Summary,
                    result.Findings,
                    result.CheckedAtUtc,
                    result.ReferenceCode,
                    null
                ));

                await LogAuditAsync(projectId, userId, $"ValidacionExterna_{providerType}", $"Consulta completada con estado: {result.Status}", cancellationToken);
            }
            catch (Exception ex)
            {
                errors.Add($"Error al consultar proveedor {providerType}: {ex.Message}");
                externalResults.Add(new ValidationSourceResult(
                    providerType.ToString(),
                    ExternalValidationStatus.Error.ToString(),
                    false,
                    false,
                    "Error interno al consultar el proveedor.",
                    new List<string>(),
                    DateTime.UtcNow,
                    null,
                    ex.Message
                ));
                await LogAuditAsync(projectId, userId, $"ValidacionExternaFallida_{providerType}", $"Error: {ex.Message}", cancellationToken);
            }
        }

        // 4. Consolidar resultados y Calcular Score
        var internalRuleResults = internalResult?.Results ?? Enumerable.Empty<ValidationRuleResultDto>();
        var integridadScore = _scoringService.CalculateScore(internalRuleResults, externalResults);
        
        bool hasCriticalFindings = internalRuleResults.Any(r => r.Severity == FindingSeverity.Critical) || 
                                  externalResults.Any(r => r.Status == "Failed" || r.Status == "Error");

        var sello = _scoringService.DetermineSello(projectId, integridadScore, hasCriticalFindings);

        var isFullyValid = internalResult?.EsLegitimo == true && externalResults.All(r => r.IsMatch);
        var overallStatus = errors.Any() ? ValidationExecutionStatus.Failed : ValidationExecutionStatus.Completed;

        var executionResult = new ValidationExecutionResult(
            projectId,
            executionId,
            startedAtUtc,
            DateTime.UtcNow,
            overallStatus,
            isFullyValid,
            integridadScore,
            sello?.Nombre,
            internalResult,
            externalResults,
            errors
        );

        // 5. Persistir resultado
        // Guardar Sello si existe
        if (sello != null)
        {
            await _selloRepository.AddAsync(sello, cancellationToken);
            // Vincular con la validación interna principal
            var internalValidation = await _internalValidationEngine.GetLatestValidationEntityAsync(projectId, cancellationToken);
            if (internalValidation != null)
            {
                internalValidation.UpdateIntegrityScore(integridadScore);
                internalValidation.AssignSello(sello);
            }
        }
        else
        {
            // Incluso si no hay sello, actualizamos el score
            var internalValidation = await _internalValidationEngine.GetLatestValidationEntityAsync(projectId, cancellationToken);
            if (internalValidation != null)
            {
                internalValidation.UpdateIntegrityScore(integridadScore);
            }
        }

        var reporte = new Reporte(projectId, userId);
        reporte.MarkAsGenerated(JsonSerializer.Serialize(executionResult));
        await _reporteRepository.AddAsync(reporte, cancellationToken);

        // Actualizar estado del proyecto si es necesario
        var estadoEnRevision = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Revision, cancellationToken);
        if (estadoEnRevision != null)
        {
            proyecto.UpdateEstado(estadoEnRevision.Id);
            _proyectoRepository.Update(proyecto);
        }

        // 6. Registrar auditoría final y guardar
        await LogAuditAsync(projectId, userId, "ValidacionCompletada", $"Validación finalizada. Score: {integridadScore}%. Sello: {sello?.Nombre ?? "Ninguno"}", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return executionResult;
    }

    public async Task<ValidationExecutionResult?> GetLatestValidationResultAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var reportes = await _reporteRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var latestReport = reportes.OrderByDescending(r => r.CreatedAtUtc).FirstOrDefault();

        if (latestReport == null || string.IsNullOrWhiteSpace(latestReport.Resumen))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<ValidationExecutionResult>(latestReport.Resumen);
        }
        catch
        {
            return null;
        }
    }

    private string GetReferenceNumberForProvider(Proyecto proyecto, ExternalProviderType providerType)
    {
        // En un caso real, esto vendría de los metadatos de los documentos o campos específicos del proyecto.
        // Por simplicidad, usamos campos del proyecto o un valor por defecto para que los mocks funcionen.
        return providerType switch
        {
            ExternalProviderType.DGRI => proyecto.Matricula ?? "MAT-DEFAULT",
            ExternalProviderType.Catastro => proyecto.DesignacionCatastral ?? "CAT-DEFAULT",
            ExternalProviderType.DGII => proyecto.RncPromotor ?? "RNC-DEFAULT",
            ExternalProviderType.MIVHED => "MIV-DEFAULT",
            ExternalProviderType.Ayuntamiento => "AYU-DEFAULT",
            ExternalProviderType.TST => "TST-DEFAULT",
            _ => "REF-DEFAULT"
        };
    }

    private async Task LogAuditAsync(Guid projectId, Guid? userId, string action, string details, CancellationToken cancellationToken)
    {
        var auditoria = new Auditoria(
            userId,
            accion: action,
            tipoEvento: "Validacion",
            entidad: "Proyecto",
            entidadId: projectId.ToString(),
            proyectoId: projectId,
            detalle: details
        );
        await _auditoriaRepository.AddAsync(auditoria, cancellationToken);
    }
}
