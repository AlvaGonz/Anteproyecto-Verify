namespace Infrastructure.DocumentProcessing;

using System;
using System.Collections.Generic;
using System.Linq;
using Application.Services.DocumentProcessing.FieldValidation;

/// <summary>
/// Evaluates the normalized fields against the rule table to determine the document's validation status.
/// </summary>
public class DocumentValidationRuleEngine : IDocumentValidationRuleEngine
{
    public DocumentFieldValidationResult Validate(
        Dictionary<string, ExtractedField> fields,
        IReadOnlyList<DocumentFieldRule> rules,
        double globalConfidenceThreshold = 0.80)
    {
        var camposFaltantes = new List<string>();
        var camposDetectados = new List<string>();
        var alertas = new List<string>();
        double sumConfidence = 0;
        int countConfidence = 0;

        // Check each rule
        foreach (var rule in rules)
        {
            if (fields.TryGetValue(rule.Campo, out var field) && field.Presente)
            {
                camposDetectados.Add(rule.Campo);
                
                // Track confidence for average, excluding fixed/stubbed values
                if (field.Confidence > 0 && field.Value != "NotImplementedYet")
                {
                    sumConfidence += field.Confidence;
                    countConfidence++;
                }
            }
            else
            {
                if (rule.Obligatorio)
                {
                    camposFaltantes.Add(rule.Campo);
                }
            }
        }

        // Check cross-cutting rules specifically for integrity alerts
        if (fields.TryGetValue("alertas_enmienda_tachadura_alteracion", out var alertField))
        {
            if (alertField.Presente && alertField.Value != "NotImplementedYet")
            {
                alertas.Add("Posible alteración o tachadura detectada.");
            }
        }

        if (fields.TryGetValue("nivel_legibilidad", out var legibilidadField))
        {
            if (legibilidadField.Presente && legibilidadField.Confidence < globalConfidenceThreshold && legibilidadField.Confidence > 0)
            {
                alertas.Add("Documento poco legible.");
            }
        }

        double confianzaPromedio = countConfidence > 0 ? sumConfidence / countConfidence : 0;

        // Determine final status
        string estadoResultante = "Verificado";

        // Hard override: if there are integrity alerts, it's Observado regardless
        if (alertas.Any(a => a.Contains("alteración") || a.Contains("tachadura")))
        {
            estadoResultante = "Observado";
        }
        else if (camposFaltantes.Any())
        {
            estadoResultante = "Observado";
        }
        else if (confianzaPromedio > 0 && confianzaPromedio < globalConfidenceThreshold)
        {
            // If overall confidence is too low, we mark it as Observado for manual review
            estadoResultante = "Observado";
        }

        return new DocumentFieldValidationResult(
            EstadoResultante: estadoResultante,
            CamposFaltantesObligatorios: camposFaltantes,
            CamposDetectadosOpcionales: camposDetectados.Where(c => !rules.First(r => r.Campo == c).Obligatorio).ToList(),
            AlertasIntegridad: alertas,
            ConfianzaPromedio: Math.Round(confianzaPromedio, 2)
        );
    }
}
