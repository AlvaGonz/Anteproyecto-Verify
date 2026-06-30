namespace Application.Services.Validation.Rules.Consistency;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Validation;
using Domain.Enums;

public class ConsistencyRule : IValidationRule
{
    public string RuleCode => "CONS-001";
    public string RuleName => "Consistencia Básica de Documentos";

    public Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default)
    {
        var results = new List<ValidationRuleResult>();
        var activeDocs = context.Documentos.Where(d => d.Activo).ToList();

        if (!activeDocs.Any())
        {
            results.Add(ValidationRuleResult.Skip(RuleCode, RuleName, "No hay documentos activos para evaluar consistencia."));
            return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
        }

        // Check for duplicate active documents of the same type (if policy prohibits it)
        // For example, only one active Title is allowed
        var titleDocs = activeDocs.Where(d => d.TipoDocumento == DocumentType.TITLE).ToList();
        if (titleDocs.Count > 1)
        {
            results.Add(ValidationRuleResult.Fail(
                RuleCode,
                RuleName,
                $"Existen {titleDocs.Count} documentos de tipo 'Título' activos. Solo se permite uno.",
                FindingSeverity.High
            ));
        }
        else if (titleDocs.Count == 1)
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "Consistencia de Título verificada."));
        }

        // Check if document creation date is before project creation date (absurd date)
        foreach (var doc in activeDocs)
        {
            if (doc.CreatedAtUtc < context.Proyecto.CreatedAtUtc.AddDays(-1)) // Allow 1 day buffer
            {
                results.Add(ValidationRuleResult.Warn(
                    RuleCode,
                    RuleName,
                    $"El documento '{doc.NombreArchivoOriginal}' tiene fecha de carga anterior a la creación del proyecto.",
                    FindingSeverity.Low,
                    doc.Id
                ));
            }
        }

        return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
    }
}
