namespace Application.Services.DocumentProcessing.FieldValidation;

using System.Collections.Generic;

/// <summary>
/// Result of running the rule engine against extracted fields for a single document.
/// </summary>
public record DocumentFieldValidationResult(
    string EstadoResultante,  // "Verificado" | "Observado" | "Pendiente"
    List<string> CamposFaltantesObligatorios,
    List<string> CamposDetectadosOpcionales,
    List<string> AlertasIntegridad,
    double ConfianzaPromedio
);
