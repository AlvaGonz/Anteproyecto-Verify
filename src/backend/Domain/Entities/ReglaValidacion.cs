namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ReglaValidacion : EntityBase
{
    public string Nombre { get; private set; } = null!;
    public string Descripcion { get; private set; } = null!;
    public string CondicionLogica { get; private set; } = null!;
    public DocumentType TipoDocumentoAplicable { get; private set; }
    public NivelAlerta NivelAlerta { get; private set; }
    public TipoProyecto TipoProyecto { get; private set; }
    public bool Activa { get; private set; }
    public int Version { get; private set; }
    public DateTime FechaCreacionUtc { get; private set; }
    public Guid CreadaPor { get; private set; }
    public Guid? ReglaAnteriorId { get; private set; }

    public virtual Usuario Creador { get; private set; } = null!;

    private ReglaValidacion() { } // For EF Core

    public ReglaValidacion(
        string nombre,
        string descripcion,
        string condicionLogica,
        DocumentType tipoDocumentoAplicable,
        NivelAlerta nivelAlerta,
        TipoProyecto tipoProyecto,
        Guid creadaPor,
        int version = 1,
        Guid? reglaAnteriorId = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(condicionLogica)) throw new ArgumentException("Condición lógica requerida", nameof(condicionLogica));

        Nombre = nombre;
        Descripcion = descripcion;
        CondicionLogica = condicionLogica;
        TipoDocumentoAplicable = tipoDocumentoAplicable;
        NivelAlerta = nivelAlerta;
        TipoProyecto = tipoProyecto;
        Activa = true;
        Version = version;
        FechaCreacionUtc = DateTime.UtcNow;
        CreadaPor = creadaPor;
        ReglaAnteriorId = reglaAnteriorId;
    }

    public void Desactivar()
    {
        Activa = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activar()
    {
        Activa = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
