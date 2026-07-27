namespace Application.Services.DocumentProcessing.FieldValidation;

using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Domain.Enums;

public class DocumentFieldNormalizer : IDocumentFieldNormalizer
{
    public Dictionary<string, ExtractedField> Normalize(OcrResult ocrResult, DocumentType documentType)
    {
        var result = new Dictionary<string, ExtractedField>();

        if (ocrResult == null || !ocrResult.Success)
        {
            return result;
        }

        switch (documentType)
        {
            case DocumentType.CertificadoTitulo:
            case DocumentType.TITLE:
                NormalizeCertificadoTitulo(ocrResult, result);
                break;
            case DocumentType.PlanoMensuraCatastral:
                NormalizePlanoMensura(ocrResult, result);
                break;
            case DocumentType.ID:
                NormalizeCedula(ocrResult, result);
                break;
            case DocumentType.CertificacionEstadoJuridico:
                NormalizeEstadoJuridico(ocrResult, result);
                break;
            case DocumentType.CertificacionIPI:
                NormalizeCertificacionIPI(ocrResult, result);
                break;
        }

        return result;
    }

    private static void NormalizeCertificadoTitulo(OcrResult ocrResult, Dictionary<string, ExtractedField> result)
    {
        var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);
        if (extraction == null)
        {
            return;
        }

        result["matricula_serial"] = new ExtractedField(
            extraction.Matricula.NormalizedValue ?? extraction.Matricula.RawValue,
            extraction.Matricula.Confidence,
            extraction.Matricula.Status == FieldStatus.Valid
        );

        result["titular"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["descripcion_inmueble"] = new ExtractedField(
            extraction.DesignacionCatastral.NormalizedValue ?? extraction.DesignacionCatastral.RawValue,
            extraction.DesignacionCatastral.Confidence,
            extraction.DesignacionCatastral.Status == FieldStatus.Valid
        );

        result["ubicacion_catastral"] = new ExtractedField(
            BuildUbicacionCatastral(extraction),
            (extraction.Provincia.Confidence + extraction.Municipio.Confidence) / 2,
            extraction.Provincia.Status == FieldStatus.Valid || extraction.Municipio.Status == FieldStatus.Valid
        );

        result["area"] = new ExtractedField(
            extraction.SuperficieM2.NormalizedValue ?? extraction.SuperficieM2.RawValue,
            extraction.SuperficieM2.Confidence,
            extraction.SuperficieM2.Status == FieldStatus.Valid
        );

        result["fecha"] = new ExtractedField(
            extraction.FechaYHoraInscripcion.NormalizedValue ?? extraction.FechaYHoraInscripcion.RawValue,
            extraction.FechaYHoraInscripcion.Confidence,
            extraction.FechaYHoraInscripcion.Status == FieldStatus.Valid
        );

        result["entidad_emisora"] = new ExtractedField(
            extraction.Oficina.NormalizedValue ?? extraction.Oficina.RawValue,
            extraction.Oficina.Confidence,
            extraction.Oficina.Status == FieldStatus.Valid
        );

        result["firmas"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["sellos"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["anotaciones_cargas_gravamenes"] = new ExtractedField(
            extraction.VieneDe.NormalizedValue ?? extraction.VieneDe.RawValue,
            extraction.VieneDe.Confidence,
            extraction.VieneDe.Status == FieldStatus.Valid
        );
    }

    private static string BuildUbicacionCatastral(CertificadoTituloRdExtractionV1 extraction)
    {
        var parts = new List<string>();
        
        if (extraction.Provincia.Status == FieldStatus.Valid && !string.IsNullOrWhiteSpace(extraction.Provincia.NormalizedValue))
        {
            parts.Add(extraction.Provincia.NormalizedValue);
        }
        else if (extraction.Provincia.Status == FieldStatus.Valid && !string.IsNullOrWhiteSpace(extraction.Provincia.RawValue))
        {
            parts.Add(extraction.Provincia.RawValue);
        }

        if (extraction.Municipio.Status == FieldStatus.Valid && !string.IsNullOrWhiteSpace(extraction.Municipio.NormalizedValue))
        {
            parts.Add(extraction.Municipio.NormalizedValue);
        }
        else if (extraction.Municipio.Status == FieldStatus.Valid && !string.IsNullOrWhiteSpace(extraction.Municipio.RawValue))
        {
            parts.Add(extraction.Municipio.RawValue);
        }

        return string.Join(", ", parts);
    }

    private static void NormalizePlanoMensura(OcrResult ocrResult, Dictionary<string, ExtractedField> result)
    {
        var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);
        if (extraction == null)
        {
            return;
        }

        result["numero_certificacion"] = new ExtractedField(
            extraction.Departamento.NormalizedValue ?? extraction.Departamento.RawValue,
            extraction.Departamento.Confidence,
            extraction.Departamento.Status == FieldStatus.Valid
        );

        result["numero_inmueble"] = new ExtractedField(
            extraction.Operacion.NormalizedValue ?? extraction.Operacion.RawValue,
            extraction.Operacion.Confidence,
            extraction.Operacion.Status == FieldStatus.Valid
        );

        result["parcela_numero"] = new ExtractedField(
            extraction.DesignacionCatastralPosicional.NormalizedValue ?? extraction.DesignacionCatastralPosicional.RawValue,
            extraction.DesignacionCatastralPosicional.Confidence,
            extraction.DesignacionCatastralPosicional.Status == FieldStatus.Valid
        );

        result["provincia"] = new ExtractedField(
            extraction.Provincia.NormalizedValue ?? extraction.Provincia.RawValue,
            extraction.Provincia.Confidence,
            extraction.Provincia.Status == FieldStatus.Valid
        );

        result["municipio"] = new ExtractedField(
            extraction.Municipio.NormalizedValue ?? extraction.Municipio.RawValue,
            extraction.Municipio.Confidence,
            extraction.Municipio.Status == FieldStatus.Valid
        );

        result["area"] = new ExtractedField(
            extraction.SuperficieARegistrarParcelaM2.NormalizedValue ?? extraction.SuperficieARegistrarParcelaM2.RawValue,
            extraction.SuperficieARegistrarParcelaM2.Confidence,
            extraction.SuperficieARegistrarParcelaM2.Status == FieldStatus.Valid
        );

        result["operacion"] = new ExtractedField(
            extraction.Operacion.NormalizedValue ?? extraction.Operacion.RawValue,
            extraction.Operacion.Confidence,
            extraction.Operacion.Status == FieldStatus.Valid
        );

        result["fecha_emision"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );
    }

    private static void NormalizeCedula(OcrResult ocrResult, Dictionary<string, ExtractedField> result)
    {
        var extraction = CedulaExtractionMapper.MapFromOcrResult(ocrResult);
        if (extraction == null)
        {
            return;
        }

        result["nombres"] = new ExtractedField(
            extraction.FirstNames.NormalizedValue ?? extraction.FirstNames.RawValue,
            extraction.FirstNames.Confidence,
            extraction.FirstNames.Status == FieldStatus.Valid
        );

        result["apellidos"] = new ExtractedField(
            extraction.LastNames.NormalizedValue ?? extraction.LastNames.RawValue,
            extraction.LastNames.Confidence,
            extraction.LastNames.Status == FieldStatus.Valid
        );

        result["cedula"] = new ExtractedField(
            extraction.CedulaNumber.NormalizedValue ?? extraction.CedulaNumber.RawValue,
            extraction.CedulaNumber.Confidence,
            extraction.CedulaNumber.Status == FieldStatus.Valid
        );

        result["fecha_nacimiento"] = new ExtractedField(
            extraction.BirthDate.NormalizedValue ?? extraction.BirthDate.RawValue,
            extraction.BirthDate.Confidence,
            extraction.BirthDate.Status == FieldStatus.Valid
        );

        result["fecha_expiracion"] = new ExtractedField(
            extraction.ExpiryDate.NormalizedValue ?? extraction.ExpiryDate.RawValue,
            extraction.ExpiryDate.Confidence,
            extraction.ExpiryDate.Status == FieldStatus.Valid
        );
    }

    private static void NormalizeEstadoJuridico(OcrResult ocrResult, Dictionary<string, ExtractedField> result)
    {
        var extraction = EstadoJuridicoRdPaddleMapper.MapFromOcrResult(ocrResult);
        if (extraction == null)
        {
            return;
        }

        result["numero"] = new ExtractedField(
            extraction.Matricula.NormalizedValue ?? extraction.Matricula.RawValue,
            extraction.Matricula.Confidence,
            extraction.Matricula.Status == FieldStatus.Valid
        );

        result["fecha"] = new ExtractedField(
            extraction.FechaHoraInscripcion.NormalizedValue ?? extraction.FechaHoraInscripcion.RawValue,
            extraction.FechaHoraInscripcion.Confidence,
            extraction.FechaHoraInscripcion.Status == FieldStatus.Valid
        );

        result["entidad_emisora"] = new ExtractedField(
            extraction.Oficina.NormalizedValue ?? extraction.Oficina.RawValue,
            extraction.Oficina.Confidence,
            extraction.Oficina.Status == FieldStatus.Valid
        );

        result["identificacion_inmueble"] = new ExtractedField(
            extraction.DesignacionCatastral.NormalizedValue ?? extraction.DesignacionCatastral.RawValue,
            extraction.DesignacionCatastral.Confidence,
            extraction.DesignacionCatastral.Status == FieldStatus.Valid
        );

        result["estado_juridico"] = new ExtractedField(
            extraction.DeclaracionEstadoLegal.NormalizedValue ?? extraction.DeclaracionEstadoLegal.RawValue,
            extraction.DeclaracionEstadoLegal.Confidence,
            extraction.DeclaracionEstadoLegal.Status == FieldStatus.Valid
        );

        result["asientos_vigentes"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["cargas_gravamenes"] = new ExtractedField(
            extraction.VieneDe.NormalizedValue ?? extraction.VieneDe.RawValue,
            extraction.VieneDe.Confidence,
            extraction.VieneDe.Status == FieldStatus.Valid
        );

        result["vigencia"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["firma_sello"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );
    }

    private static void NormalizeCertificacionIPI(OcrResult ocrResult, Dictionary<string, ExtractedField> result)
    {
        var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
        if (extraction == null)
        {
            return;
        }

        result["numero_certificacion"] = new ExtractedField(
            extraction.NumeroCertificacion.NormalizedValue ?? extraction.NumeroCertificacion.RawValue,
            extraction.NumeroCertificacion.Confidence,
            extraction.NumeroCertificacion.Status == FieldStatus.Valid
        );

        result["numero_inmueble"] = new ExtractedField(
            extraction.NumeroInmueble.NormalizedValue ?? extraction.NumeroInmueble.RawValue,
            extraction.NumeroInmueble.Confidence,
            extraction.NumeroInmueble.Status == FieldStatus.Valid
        );

        result["parcela_numero"] = new ExtractedField(
            extraction.ParcelaNumero.NormalizedValue ?? extraction.ParcelaNumero.RawValue,
            extraction.ParcelaNumero.Confidence,
            extraction.ParcelaNumero.Status == FieldStatus.Valid
        );

        result["provincia"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["municipio"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["area"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["fecha_emision"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );

        result["titular"] = new ExtractedField(
            string.Empty,
            0.0,
            false
        );
    }
}