namespace Application.Services.Validation.Rules.Consistency;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Validation;
using Application.Documents.Extractions;
using Domain.Enums;
using Domain.Entities;

public class DocumentDiscrepancyRule : IValidationRule
{
    private readonly IReglaValidacionRepository _reglaRepository;

    public DocumentDiscrepancyRule(IReglaValidacionRepository reglaRepository)
    {
        _reglaRepository = reglaRepository;
    }

    public string RuleCode => "DOC-DISC-001";
    public string RuleName => "Validación de Discrepancias en Documentos";

    public async Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default)
    {
        var results = new List<ValidationRuleResult>();
        
        // 1. Check if global discrepancy validation is enabled
        var rules = await _reglaRepository.GetAllAsync(1, 1000, cancellationToken);
        var globalRule = rules.FirstOrDefault(r => r.Codigo == "GLOBAL-DISCREPANCY-ENABLED");
        
        if (globalRule != null && !globalRule.Activa)
        {
            results.Add(ValidationRuleResult.Skip(RuleCode, RuleName, "La validación global de discrepancias está deshabilitada."));
            return results;
        }

        var activeDocs = context.Documentos.Where(d => d.Activo && !string.IsNullOrWhiteSpace(d.ResultadoOcrJson)).ToList();

        if (!activeDocs.Any())
        {
            results.Add(ValidationRuleResult.Skip(RuleCode, RuleName, "No hay documentos activos con resultados de OCR para evaluar discrepancias."));
            return results;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        foreach (var doc in activeDocs)
        {
            try
            {
                var ocrResult = JsonSerializer.Deserialize<Application.Abstractions.Ocr.OcrResult>(doc.ResultadoOcrJson!, options);
                if (ocrResult == null || string.IsNullOrWhiteSpace(ocrResult.CanonicalDataJson)) continue;

                using var jsonDoc = JsonDocument.Parse(ocrResult.CanonicalDataJson);
                var root = jsonDoc.RootElement;
                if (!root.TryGetProperty("payload", out var payloadElement)) continue;

                if (doc.TipoDocumento == DocumentType.CertificacionEstadoJuridico)
                {
                    var extraction = JsonSerializer.Deserialize<EstadoJuridicoRdExtractionV1>(payloadElement.GetRawText(), options);
                    if (extraction != null)
                    {
                        EvaluateEstadoJuridico(context.Proyecto, extraction, doc, results);
                    }
                }
                else if (doc.TipoDocumento == DocumentType.PlanoMensuraCatastral)
                {
                    var extraction = JsonSerializer.Deserialize<PlanoMensuraCatastralRdExtractionV1>(payloadElement.GetRawText(), options);
                    if (extraction != null)
                    {
                        EvaluatePlanoMensura(context.Proyecto, extraction, doc, results);
                    }
                }
                else if (doc.TipoDocumento == DocumentType.ID)
                {
                    var extraction = JsonSerializer.Deserialize<CedulaRdExtractionV1>(payloadElement.GetRawText(), options);
                    if (extraction != null)
                    {
                        EvaluateCedula(context.Proyecto, extraction, doc, results);
                    }
                }
                else if (doc.TipoDocumento == DocumentType.CertificacionIPI)
                {
                    var extraction = JsonSerializer.Deserialize<CertificacionIPIRdExtractionV1>(payloadElement.GetRawText(), options);
                    if (extraction != null)
                    {
                        EvaluateCertificacionIPI(context.Proyecto, extraction, doc, results);
                    }
                }
            }
            catch (Exception)
            {
                // Continue to next document if there's a deserialization error
            }
        }

        if (!results.Any())
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "No se detectaron discrepancias en los documentos activos."));
        }

        return results;
    }

    private string GetFieldValue(ExtractedField? field)
    {
        if (field == null) return string.Empty;
        return !string.IsNullOrWhiteSpace(field.NormalizedValue) ? field.NormalizedValue : field.RawValue;
    }

    private void EvaluateEstadoJuridico(Proyecto proyecto, EstadoJuridicoRdExtractionV1 extraction, Documento doc, List<ValidationRuleResult> results)
    {
        bool hasDiscrepancy = false;

        var desCat = GetFieldValue(extraction.DesignacionCatastral);
        // Compare Designacion Catastral
        if (!string.IsNullOrWhiteSpace(desCat) && !string.IsNullOrWhiteSpace(proyecto.DesignacionCatastral))
        {
            if (!proyecto.DesignacionCatastral.Trim().Equals(desCat.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Fail(RuleCode, RuleName, $"La Designación Catastral en el Estado Jurídico '{desCat}' no coincide con el proyecto '{proyecto.DesignacionCatastral}'.", FindingSeverity.High, doc.Id));
                hasDiscrepancy = true;
            }
        }

        var prov = GetFieldValue(extraction.Provincia);
        // Compare Provincia
        if (!string.IsNullOrWhiteSpace(prov) && proyecto.Provincia != null)
        {
            var (canonical, _) = ProvinciaAliasRegistry.Resolve(prov.Trim());
            if (canonical != null && !canonical.Equals(proyecto.Provincia.NombreProvincia, StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Fail(RuleCode, RuleName, $"La Provincia en el Estado Jurídico '{canonical}' no coincide con el proyecto '{proyecto.Provincia.NombreProvincia}'.", FindingSeverity.High, doc.Id));
                hasDiscrepancy = true;
            }
        }

        if (!hasDiscrepancy)
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "El Estado Jurídico coincide con los datos del proyecto."));
        }
    }

    private void EvaluatePlanoMensura(Proyecto proyecto, PlanoMensuraCatastralRdExtractionV1 extraction, Documento doc, List<ValidationRuleResult> results)
    {
        bool hasDiscrepancy = false;

        var desCatPos = GetFieldValue(extraction.DesignacionCatastralPosicional);
        // Compare Designacion Catastral
        if (!string.IsNullOrWhiteSpace(desCatPos) && !string.IsNullOrWhiteSpace(proyecto.DesignacionCatastral))
        {
            if (!proyecto.DesignacionCatastral.Trim().Equals(desCatPos.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Fail(RuleCode, RuleName, $"La Designación Catastral en el Plano de Mensura '{desCatPos}' no coincide con el proyecto '{proyecto.DesignacionCatastral}'.", FindingSeverity.High, doc.Id));
                hasDiscrepancy = true;
            }
        }

        var prov = GetFieldValue(extraction.Provincia);
        // Compare Provincia
        if (!string.IsNullOrWhiteSpace(prov) && proyecto.Provincia != null)
        {
            var (canonical, _) = ProvinciaAliasRegistry.Resolve(prov.Trim());
            if (canonical != null && !canonical.Equals(proyecto.Provincia.NombreProvincia, StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Fail(RuleCode, RuleName, $"La Provincia en el Plano de Mensura '{canonical}' no coincide con el proyecto '{proyecto.Provincia.NombreProvincia}'.", FindingSeverity.High, doc.Id));
                hasDiscrepancy = true;
            }
        }

        if (!hasDiscrepancy)
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "El Plano de Mensura coincide con los datos del proyecto."));
        }
    }

    private void EvaluateCedula(Proyecto proyecto, CedulaRdExtractionV1 extraction, Documento doc, List<ValidationRuleResult> results)
    {
        bool hasDiscrepancy = false;

        var cedula = GetFieldValue(extraction.CedulaNumber);
        if (!string.IsNullOrWhiteSpace(cedula))
        {
            var cleanCedula = cedula.Replace("-", "").Trim();
            var projCedulaPropietario = proyecto.CedulaRncPropietario?.Replace("-", "").Trim();
            var projRncDesarrollador = proyecto.RncDesarrollador?.Replace("-", "").Trim();

            if (cleanCedula != projCedulaPropietario && cleanCedula != projRncDesarrollador)
            {
                results.Add(ValidationRuleResult.Warn(RuleCode, RuleName, $"La Cédula extraída '{cedula}' no coincide ni con el RNC del desarrollador ni con la cédula del propietario.", FindingSeverity.Medium, doc.Id));
                hasDiscrepancy = true;
            }
        }

        if (!hasDiscrepancy)
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "La Cédula coincide con los datos registrados del desarrollador/propietario."));
        }
    }

    private void EvaluateCertificacionIPI(Proyecto proyecto, CertificacionIPIRdExtractionV1 extraction, Documento doc, List<ValidationRuleResult> results)
    {
        bool hasDiscrepancy = false;

        var parcela = GetFieldValue(extraction.ParcelaNumero);
        if (!string.IsNullOrWhiteSpace(parcela) && !string.IsNullOrWhiteSpace(proyecto.DesignacionCatastral))
        {
            if (!proyecto.DesignacionCatastral.Trim().Equals(parcela.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Fail(RuleCode, RuleName, $"La Parcela en la Certificación IPI '{parcela}' no coincide con el proyecto '{proyecto.DesignacionCatastral}'.", FindingSeverity.High, doc.Id));
                hasDiscrepancy = true;
            }
        }

        var numInmueble = GetFieldValue(extraction.NumeroInmueble);
        if (!string.IsNullOrWhiteSpace(numInmueble) && !string.IsNullOrWhiteSpace(proyecto.Ipi))
        {
            if (!proyecto.Ipi.Trim().Equals(numInmueble.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                results.Add(ValidationRuleResult.Warn(RuleCode, RuleName, $"El Número de Inmueble IPI '{numInmueble}' no coincide con el registrado en el proyecto '{proyecto.Ipi}'.", FindingSeverity.Medium, doc.Id));
                hasDiscrepancy = true;
            }
        }

        if (!hasDiscrepancy)
        {
            results.Add(ValidationRuleResult.Pass(RuleCode, RuleName, "La Certificación IPI coincide con los datos del proyecto."));
        }
    }
}
