namespace Application.Services.Validation.Rules.Validity;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Validation;
using Domain.Enums;

public class ValidityRule : IValidationRule
{
    public string RuleCode => "VAL-DATE-001";
    public string RuleName => "Vigencia Documental";

    public Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default)
    {
        var results = new List<ValidationRuleResult>();
        var activeDocs = context.Documentos.Where(d => d.Activo).ToList();

        if (!activeDocs.Any())
        {
            results.Add(ValidationRuleResult.Skip(RuleCode, RuleName, "No hay documentos activos para evaluar vigencia."));
            return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
        }

        foreach (var doc in activeDocs)
        {
            if (doc.FechaEmision.HasValue)
            {
                if (doc.FechaEmision.Value > DateTime.UtcNow)
                {
                    results.Add(ValidationRuleResult.Fail(
                        RuleCode,
                        RuleName,
                        $"El documento '{doc.NombreArchivoOriginal}' tiene una fecha de emisión futura ({doc.FechaEmision.Value:yyyy-MM-dd}).",
                        FindingSeverity.High,
                        doc.Id
                    ));
                }
                else
                {
                    results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, $"Fecha de emisión válida para '{doc.NombreArchivoOriginal}'."));
                }
            }
            else
            {
                if (doc.TipoDocumento == DocumentType.TITLE || doc.TipoDocumento == DocumentType.OTHER)
                {
                    results.Add(ValidationRuleResult.Warn(
                        RuleCode,
                        RuleName,
                        $"El documento '{doc.NombreArchivoOriginal}' no tiene fecha de emisión, no se puede verificar vigencia.",
                        FindingSeverity.Medium,
                        doc.Id
                    ));
                }
            }
        }

        return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
    }
}
