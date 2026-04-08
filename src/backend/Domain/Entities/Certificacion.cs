namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class Certificacion : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? ReporteId { get; private set; }
    public Reporte? Reporte { get; private set; }

    public string CodigoVerificacion { get; private set; }
    public CertificationStatus EstadoCertificacion { get; private set; }
    
    public DateTime FechaEmisionUtc { get; private set; }
    public DateTime? FechaVigenciaUtc { get; private set; }
    
    public string UrlVerificacion { get; private set; }
    
    public int? ScoreIntegridad { get; private set; }
    public IntegrityStatus EstadoIntegridad { get; private set; }
    
    public int Version { get; private set; }
    
    public Guid EmisorId { get; private set; }
    
    public bool Revocado { get; private set; }
    public string? MotivoRevocacion { get; private set; }

    private Certificacion() { } // For EF Core

    public Certificacion(
        Guid proyectoId, 
        Guid? reporteId, 
        string codigoVerificacion, 
        string urlVerificacion,
        int? scoreIntegridad,
        IntegrityStatus estadoIntegridad,
        Guid emisorId,
        int version = 1)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(codigoVerificacion)) throw new ArgumentException("Código requerido", nameof(codigoVerificacion));
        if (string.IsNullOrWhiteSpace(urlVerificacion)) throw new ArgumentException("URL requerida", nameof(urlVerificacion));
        if (emisorId == Guid.Empty) throw new ArgumentException("Emisor requerido", nameof(emisorId));

        ProyectoId = proyectoId;
        ReporteId = reporteId;
        CodigoVerificacion = codigoVerificacion;
        UrlVerificacion = urlVerificacion;
        ScoreIntegridad = scoreIntegridad;
        EstadoIntegridad = estadoIntegridad;
        EmisorId = emisorId;
        Version = version;
        
        EstadoCertificacion = CertificationStatus.Emitido;
        FechaEmisionUtc = DateTime.UtcNow;
        Revocado = false;
    }

    public void Revoke(string motivo)
    {
        if (Revocado) return;
        
        Revocado = true;
        EstadoCertificacion = CertificationStatus.Revocado;
        MotivoRevocacion = motivo;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
