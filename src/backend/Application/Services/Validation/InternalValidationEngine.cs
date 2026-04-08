namespace Application.Services.Validation;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Validation;
using Application.DTOs.Validations;
using Domain.Entities;
using Domain.Enums;

public class InternalValidationEngine : IInternalValidationEngine
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IDocumentoRepository _documentoRepository;
    private readonly IValidacionRepository _validacionRepository;
    private readonly IHallazgoRepository _hallazgoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEnumerable<IValidationRule> _rules;

    public InternalValidationEngine(
        IProyectoRepository proyectoRepository,
        IDocumentoRepository documentoRepository,
        IValidacionRepository validacionRepository,
        IHallazgoRepository hallazgoRepository,
        IUnitOfWork unitOfWork,
        IEnumerable<IValidationRule> rules)
    {
        _proyectoRepository = proyectoRepository;
        _documentoRepository = documentoRepository;
        _validacionRepository = validacionRepository;
        _hallazgoRepository = hallazgoRepository;
        _unitOfWork = unitOfWork;
        _rules = rules;
    }

    public async Task<InternalValidationSummaryDto> RunValidationAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (proyecto == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        var documentos = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var context = new ValidationRuleContext(proyecto, documentos.ToList());

        var validacion = new Validacion(projectId, "InternalEngine");
        await _validacionRepository.AddAsync(validacion, cancellationToken);

        var allResults = new List<ValidationRuleResult>();

        foreach (var rule in _rules)
        {
            var results = await rule.EvaluateAsync(context, cancellationToken);
            allResults.AddRange(results);
        }

        int passed = 0, warning = 0, failed = 0;

        foreach (var result in allResults)
        {
            var resultadoRegla = new ResultadoRegla(
                validacion.Id,
                result.RuleCode,
                result.RuleName,
                result.Status,
                result.Message,
                result.Severity,
                result.RelatedDocumentId
            );
            validacion.ResultadosRegla.Add(resultadoRegla);

            if (result.Status == RuleStatus.Passed) passed++;
            else if (result.Status == RuleStatus.Warning) warning++;
            else if (result.Status == RuleStatus.Failed) failed++;

            if (result.Status == RuleStatus.Failed || result.Status == RuleStatus.Warning)
            {
                var hallazgo = new Hallazgo(
                    projectId,
                    result.Severity ?? FindingSeverity.Medium,
                    result.RuleCode,
                    result.RuleName,
                    result.Message,
                    validacion.Id
                );
                validacion.Hallazgos.Add(hallazgo);
                await _hallazgoRepository.AddAsync(hallazgo, cancellationToken);
            }
        }

        bool esLegitimo = failed == 0;
        validacion.CompleteValidation(esLegitimo, $"Validación interna completada. Reglas fallidas: {failed}");
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToSummaryDto(validacion, passed, warning, failed);
    }

    public async Task<InternalValidationSummaryDto?> GetLatestValidationAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var validacion = await _validacionRepository.GetLatestByProjectIdAsync(projectId, "InternalEngine", cancellationToken);
        if (validacion == null) return null;

        var passed = validacion.ResultadosRegla.Count(r => r.Status == RuleStatus.Passed);
        var warning = validacion.ResultadosRegla.Count(r => r.Status == RuleStatus.Warning);
        var failed = validacion.ResultadosRegla.Count(r => r.Status == RuleStatus.Failed);

        return MapToSummaryDto(validacion, passed, warning, failed);
    }

    private static InternalValidationSummaryDto MapToSummaryDto(Validacion v, int passed, int warning, int failed)
    {
        return new InternalValidationSummaryDto(
            v.Id,
            v.ProyectoId,
            v.EstadoValidacion,
            v.EsLegitimo,
            passed,
            warning,
            failed,
            v.CreatedAtUtc,
            v.ResultadosRegla.Select(r => new ValidationRuleResultDto(
                r.Id,
                r.RuleCode,
                r.RuleName,
                r.Status,
                r.Message,
                r.Severity,
                r.RelatedDocumentId
            ))
        );
    }
}
