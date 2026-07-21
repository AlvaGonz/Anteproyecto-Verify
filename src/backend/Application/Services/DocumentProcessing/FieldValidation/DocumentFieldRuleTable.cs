namespace Application.Services.DocumentProcessing.FieldValidation;

using System.Collections.Generic;
using Domain.Enums;

/// <summary>
/// Static, data-driven rule table for per-document-type OCR field validation.
/// Each document type has a list of expected fields; the rule engine
/// evaluates extracted OCR text against these rules.
/// </summary>
public static class DocumentFieldRuleTable
{
    private static readonly Dictionary<DocumentType, List<DocumentFieldRule>> _rules = new()
    {
        [DocumentType.TITLE] = new()
        {
            new("matricula_serial", "alphanumeric-code", true, "Registro de Títulos"),
            new("titular", "name", true, "Registro de Títulos"),
            new("descripcion_inmueble", "text", true, "Registro de Títulos"),
            new("ubicacion_catastral", "text", true, "Registro de Títulos"),
            new("area", "number", false, "Registro de Títulos"),
            new("fecha", "date", true, "Registro de Títulos"),
            new("entidad_emisora", "text", true, "Registro de Títulos"),
            new("firmas", "text", false, "Registro de Títulos"),
            new("sellos", "text", false, "Registro de Títulos"),
            new("anotaciones_cargas_gravamenes", "text", false, "Registro de Títulos"),
        },
        [DocumentType.CertificadoTitulo] = new()
        {
            new("matricula_serial", "alphanumeric-code", true, "Registro de Títulos"),
            new("titular", "name", true, "Registro de Títulos"),
            new("descripcion_inmueble", "text", true, "Registro de Títulos"),
            new("ubicacion_catastral", "text", true, "Registro de Títulos"),
            new("area", "number", false, "Registro de Títulos"),
            new("fecha", "date", true, "Registro de Títulos"),
            new("entidad_emisora", "text", true, "Registro de Títulos"),
            new("firmas", "text", false, "Registro de Títulos"),
            new("sellos", "text", false, "Registro de Títulos"),
            new("anotaciones_cargas_gravamenes", "text", false, "Registro de Títulos"),
        },
        [DocumentType.LEGAL_STATUS] = new()
        {
            new("numero", "alphanumeric-code", true, "Registro de Títulos"),
            new("fecha", "date", true, "Registro de Títulos"),
            new("entidad_emisora", "text", true, "Registro de Títulos"),
            new("identificacion_inmueble", "text", true, "Registro de Títulos"),
            new("estado_juridico", "text", true, "Registro de Títulos"),
            new("asientos_vigentes", "text", false, "Registro de Títulos"),
            new("cargas_gravamenes", "text", false, "Registro de Títulos"),
            new("vigencia", "date", true, "Registro de Títulos"),
            new("firma_sello", "text", false, "Registro de Títulos"),
        },
        [DocumentType.CertificacionEstadoJuridico] = new()
        {
            new("numero", "alphanumeric-code", true, "Registro de Títulos"),
            new("fecha", "date", true, "Registro de Títulos"),
            new("entidad_emisora", "text", true, "Registro de Títulos"),
            new("identificacion_inmueble", "text", true, "Registro de Títulos"),
            new("estado_juridico", "text", true, "Registro de Títulos"),
            new("asientos_vigentes", "text", false, "Registro de Títulos"),
            new("cargas_gravamenes", "text", false, "Registro de Títulos"),
            new("vigencia", "date", true, "Registro de Títulos"),
            new("firma_sello", "text", false, "Registro de Títulos"),
        },
        [DocumentType.SURVEY] = new()
        {
            new("tipo_plano", "text", true, "Tribunal de Tierras"),
            new("numero", "alphanumeric-code", true, "Tribunal de Tierras"),
            new("parcela", "alphanumeric-code", true, "Tribunal de Tierras"),
            new("coordenadas", "text", false, "Tribunal de Tierras"),
            new("area", "number", false, "Tribunal de Tierras"),
            new("colindancias", "text", false, "Tribunal de Tierras"),
            new("agrimensor", "name", true, "Tribunal de Tierras"),
            new("fecha", "date", true, "Tribunal de Tierras"),
            new("aprobacion", "text", true, "Tribunal de Tierras"),
            new("sello", "text", false, "Tribunal de Tierras"),
        },
        [DocumentType.PlanoMensuraCatastral] = new()
        {
            new("tipo_plano", "text", true, "Tribunal de Tierras"),
            new("numero", "alphanumeric-code", true, "Tribunal de Tierras"),
            new("parcela", "alphanumeric-code", true, "Tribunal de Tierras"),
            new("coordenadas", "text", false, "Tribunal de Tierras"),
            new("area", "number", false, "Tribunal de Tierras"),
            new("colindancias", "text", false, "Tribunal de Tierras"),
            new("agrimensor", "name", true, "Tribunal de Tierras"),
            new("fecha", "date", true, "Tribunal de Tierras"),
            new("aprobacion", "text", true, "Tribunal de Tierras"),
            new("sello", "text", false, "Tribunal de Tierras"),
        },
        [DocumentType.ID] = new()
        {
            new("cedulaNumber", "alphanumeric-code", true, "JCE"),
            new("firstNames", "name", true, "JCE"),
            new("lastNames", "name", true, "JCE"),
            new("birthDate", "date", true, "JCE"),
            new("expiryDate", "date", true, "JCE"),
        },
        // ponytail: Poder Notarial — criterio técnico, no validado contra fuente oficial dominicana
        [DocumentType.NOTARIAL_POWER] = new()
        {
            new("poderdante", "name", true, "Notaría Pública"),
            new("apoderado", "name", true, "Notaría Pública"),
            new("alcance", "text", true, "Notaría Pública"),
            new("fecha", "date", true, "Notaría Pública"),
            new("notario", "name", true, "Notaría Pública"),
            new("protocolo", "alphanumeric-code", true, "Notaría Pública"),
            new("firmas", "text", false, "Notaría Pública"),
            new("sello", "text", false, "Notaría Pública"),
        },
        [DocumentType.PoderNotarial] = new()
        {
            new("poderdante", "name", true, "Notaría Pública"),
            new("apoderado", "name", true, "Notaría Pública"),
            new("alcance", "text", true, "Notaría Pública"),
            new("fecha", "date", true, "Notaría Pública"),
            new("notario", "name", true, "Notaría Pública"),
            new("protocolo", "alphanumeric-code", true, "Notaría Pública"),
            new("firmas", "text", false, "Notaría Pública"),
            new("sello", "text", false, "Notaría Pública"),
        },
    };

    /// <summary>
    /// Cross-cutting fields checked on every document type.
    /// </summary>
    private static readonly List<DocumentFieldRule> _crossCuttingRules = new()
    {
        new("numero_expediente_referencia", "alphanumeric-code", false, "Transversal"),
        new("fecha_recepcion", "date", false, "Transversal"),
        new("fecha_captura", "date", false, "Transversal"),
        new("tipo_documental", "text", false, "Transversal"),
        new("nivel_legibilidad", "number", false, "Transversal"),
        new("paginas_detectadas", "number", false, "Transversal"),
        new("firma_presente", "text", false, "Transversal"),
        new("sello_presente", "text", false, "Transversal"),
        // ponytail: stub — integrity alert detection is not yet implemented.
        // When image analysis is added, this should flip to obligatorio=true.
        new("alertas_enmienda_tachadura_alteracion", "text", false, "Transversal"),
    };

    public static IReadOnlyList<DocumentFieldRule> GetRulesForDocumentType(DocumentType type)
    {
        if (_rules.TryGetValue(type, out var rules))
            return rules.AsReadOnly();
        return new List<DocumentFieldRule>().AsReadOnly();
    }

    public static IReadOnlyList<DocumentFieldRule> CrossCuttingRules => _crossCuttingRules.AsReadOnly();

    public static IReadOnlyList<DocumentType> SupportedDocumentTypes => new List<DocumentType>
    {
        DocumentType.TITLE, DocumentType.CertificadoTitulo,
        DocumentType.LEGAL_STATUS, DocumentType.CertificacionEstadoJuridico,
        DocumentType.SURVEY, DocumentType.PlanoMensuraCatastral,
        DocumentType.ID,
        DocumentType.NOTARIAL_POWER, DocumentType.PoderNotarial,
    }.AsReadOnly();
}
