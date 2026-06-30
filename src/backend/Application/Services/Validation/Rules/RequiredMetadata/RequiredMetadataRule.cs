namespace Application.Services.Validation.Rules.RequiredMetadata;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Validation;
using Domain.Enums;

public class RequiredMetadataRule : IValidationRule
{
    public string RuleCode => "REQ-META-001";
    public string RuleName => "Metadatos Obligatorios de Documentos";

    public Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default)
    {
        var results = new List<ValidationRuleResult>();
        var activeDocs = context.Documentos.Where(d => d.Activo).ToList();

        if (!activeDocs.Any())
        {
            results.Add(ValidationRuleResult.Skip(RuleCode, RuleName, "No hay documentos activos para evaluar metadatos."));
            return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
        }

        foreach (var doc in activeDocs)
        {
            var missingMetadata = new List<string>();

            if (doc.TamanoBytes <= 0) missingMetadata.Add("Tamaño");
            if (string.IsNullOrWhiteSpace(doc.NombreArchivoAlmacenado)) missingMetadata.Add("Ruta/Blob");
            if (string.IsNullOrWhiteSpace(doc.ContentType)) missingMetadata.Add("Content Type");

            // Example: Title and Permit require emission date
            if ((doc.TipoDocumento == DocumentType.TITLE || doc.TipoDocumento == DocumentType.OTHER) && !doc.FechaEmision.HasValue)
            {
                missingMetadata.Add("Fecha de Emisión");
            }

            if (missingMetadata.Any())
            {
                results.Add(ValidationRuleResult.Fail(
                    RuleCode,
                    RuleName,
                    $"El documento '{doc.NombreArchivoOriginal}' carece de metadatos obligatorios: {string.Join(", ", missingMetadata)}.",
                    FindingSeverity.Medium,
                    doc.Id
                ));
            }
            else
            {
                results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, $"Metadatos completos para '{doc.NombreArchivoOriginal}'."));
            }
        }

        return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
    }
}
