namespace Application.Services.Validation.Rules.RequiredDocuments;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Validation;
using Domain.Enums;

public class RequiredDocumentsRule : IValidationRule
{
    public string RuleCode => "REQ-DOC-001";
    public string RuleName => "Documentos Mínimos Requeridos";

    public Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default)
    {
        var results = new List<ValidationRuleResult>();

        // Define required document types (could be injected via config)
        var requiredTypes = new[] { 
            DocumentType.CertificadoTitulo, 
            DocumentType.CertificacionEstadoJuridico, 
            DocumentType.PlanosArquitectonicos,
            DocumentType.PlanoMensuraCatastral,
            DocumentType.PermisoConstruccion,
            DocumentType.CertificadoUsoSuelo,
            DocumentType.FormularioFIDVB009,
            DocumentType.CertificacionIPI,
            DocumentType.RegistroMercantil,
            DocumentType.ActaConstitutiva,
            DocumentType.PoderNotarial,
            DocumentType.RNC,
            DocumentType.EstadosFinancieros,
            DocumentType.CertificacionesBancarias,
            DocumentType.FormularioKYCAML,
            DocumentType.DeclaracionPEP,
            DocumentType.CertificadoEIA,
            DocumentType.NoObjecionINAPACAASD,
            DocumentType.DocumentosNotariales,
            DocumentType.DocumentosSupletorios
        };

        var activeDocs = context.Documentos.Where(d => d.Activo).ToList();

        foreach (var requiredType in requiredTypes)
        {
            bool exists = activeDocs.Any(d => d.TipoDocumento == requiredType);
            if (exists)
            {
                results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, $"Documento requerido '{requiredType}' encontrado."));
            }
            else
            {
                results.Add(ValidationRuleResult.Fail(
                    RuleCode, 
                    RuleName, 
                    $"Falta documento requerido: {requiredType}.", 
                    FindingSeverity.High
                ));
            }
        }

        return Task.FromResult<IEnumerable<ValidationRuleResult>>(results);
    }
}
