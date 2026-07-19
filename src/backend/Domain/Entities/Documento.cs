namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Documento : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public DocumentType TipoDocumento { get; private set; }
    public string NombreArchivoOriginal { get; private set; } = null!;
    public string NombreArchivoAlmacenado { get; private set; } = null!;
    public string RutaArchivo { get; private set; } = null!;
    public string ContentType { get; private set; } = null!;
    public string Extension { get; private set; } = null!;
    public long TamanoBytes { get; private set; }
    public DocumentStatus EstadoDocumento { get; private set; }
    public bool Activo { get; private set; }
    public int Version { get; private set; }
    
    public DateTime? FechaEmision { get; private set; }
    public string? InstitucionEmisora { get; private set; }
    public Guid UsuarioCargaId { get; private set; }
    public string? Observaciones { get; private set; }
    public string? HashSHA256 { get; private set; }
    public string? ResultadoOcrJson { get; private set; }
    // RF-9 Formal validation fields
    public DocumentFormalStatus? FormalStatus { get; private set; }
    public DateTime? FechaVencimiento { get; private set; }
    public string? VersionReglaAplicada { get; private set; }
    public DateTime? FechaEvaluacion { get; private set; }

    // Navigation properties
    public ICollection<Validacion> Validaciones { get; private set; } = new List<Validacion>();

    private Documento() { } // For EF Core

    public Documento(
        Guid proyectoId, 
        DocumentType tipoDocumento, 
        string nombreArchivoOriginal, 
        string nombreArchivoAlmacenado,
        string rutaArchivo,
        string contentType,
        string extension,
        long tamanoBytes,
        Guid usuarioCargaId,
        int version = 1,
        DateTime? fechaEmision = null,
        string? institucionEmisora = null,
        string? observaciones = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(nombreArchivoOriginal)) throw new ArgumentException("Nombre de archivo requerido", nameof(nombreArchivoOriginal));
        if (string.IsNullOrWhiteSpace(rutaArchivo)) throw new ArgumentException("Ruta de archivo requerida", nameof(rutaArchivo));

        ProyectoId = proyectoId;
        TipoDocumento = tipoDocumento;
        NombreArchivoOriginal = nombreArchivoOriginal;
        NombreArchivoAlmacenado = nombreArchivoAlmacenado;
        RutaArchivo = rutaArchivo;
        ContentType = contentType;
        Extension = extension;
        TamanoBytes = tamanoBytes;
        UsuarioCargaId = usuarioCargaId;
        Version = version;
        FechaEmision = fechaEmision;
        InstitucionEmisora = institucionEmisora;
        Observaciones = observaciones;
        
        EstadoDocumento = DocumentStatus.Uploaded;
        Activo = true;
    }

    public Documento(Guid proyectoId, string nombreArchivoOriginal, string contentType, long tamanoBytes, string rutaArchivo, DocumentType tipoDocumento)
    {
        ProyectoId = proyectoId;
        NombreArchivoOriginal = nombreArchivoOriginal;
        NombreArchivoAlmacenado = nombreArchivoOriginal;
        ContentType = contentType;
        TamanoBytes = tamanoBytes;
        RutaArchivo = rutaArchivo;
        TipoDocumento = tipoDocumento;
        Extension = ".pdf";
        EstadoDocumento = DocumentStatus.Uploaded;
        Activo = true;
    }

    public void UpdateStatus(DocumentStatus status, string? observaciones = null)
    {
        EstadoDocumento = status;
        if (observaciones != null) Observaciones = observaciones;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ToggleActive(bool isActive)
    {
        Activo = isActive;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateType(DocumentType newType)
    {
        TipoDocumento = newType;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateFormalStatus(DocumentFormalStatus status, DateTime? fechaVencimiento, string versionReglaAplicada)
    {
        FormalStatus = status;
        FechaVencimiento = fechaVencimiento;
        VersionReglaAplicada = versionReglaAplicada;
        FechaEvaluacion = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetHash(string sha256Hash)
    {
        if (string.IsNullOrWhiteSpace(sha256Hash)) throw new ArgumentException("Hash es requerido", nameof(sha256Hash));
        HashSHA256 = sha256Hash;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetOcrResult(string ocrResultJson, DocumentStatus newStatus)
    {
        if (string.IsNullOrWhiteSpace(ocrResultJson)) throw new ArgumentException("JSON de OCR es requerido", nameof(ocrResultJson));
        if (EstadoDocumento == DocumentStatus.Valid || EstadoDocumento == DocumentStatus.Invalid) 
        {
            throw new InvalidOperationException($"No se puede actualizar el resultado OCR si el documento ya está en estado {EstadoDocumento}");
        }

        ResultadoOcrJson = ocrResultJson;
        EstadoDocumento = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateOcrResult(string ocrResultJson)
    {
        if (string.IsNullOrWhiteSpace(ocrResultJson)) throw new ArgumentException("JSON de OCR es requerido", nameof(ocrResultJson));
        ResultadoOcrJson = ocrResultJson;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
