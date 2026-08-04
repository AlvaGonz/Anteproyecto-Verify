namespace Domain.Entities;

using System;
using Domain.Common;

public class DatoValidado : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? DocumentoId { get; private set; }
    public Documento? Documento { get; private set; }

    public string TipoDocumento { get; private set; } = null!;
    
    // JSON strings
    public string DatosOcrJson { get; private set; } = "{}";
    public string DatosMatchJson { get; private set; } = "{}";
    
    public double PorcentajeTotal { get; private set; }

    private DatoValidado() { } // For EF Core

    public DatoValidado(Guid proyectoId, Guid? documentoId, string tipoDocumento)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(tipoDocumento)) throw new ArgumentException("TipoDocumento requerido", nameof(tipoDocumento));

        ProyectoId = proyectoId;
        DocumentoId = documentoId;
        TipoDocumento = tipoDocumento;
    }

    public void UpdateResultados(string datosOcrJson, string datosMatchJson, double porcentajeTotal)
    {
        DatosOcrJson = datosOcrJson ?? "{}";
        DatosMatchJson = datosMatchJson ?? "{}";
        PorcentajeTotal = porcentajeTotal;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
