namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ReglaValidacion : EntityBase
{
    public string Nombre { get; private set; } = null!;
    public string? Codigo { get; private set; }
    public string Descripcion { get; private set; } = null!;
    public string CondicionLogica { get; private set; } = null!;
    public string? Expresion { get; private set; }
    public decimal? ValorUmbral { get; private set; }
    public decimal? MinValor { get; private set; }
    public decimal? MaxValor { get; private set; }
    public DocumentType TipoDocumentoAplicable { get; private set; }
    public NivelAlerta NivelAlerta { get; private set; }
    public TipoProyecto TipoProyecto { get; private set; }
    public bool Activa { get; private set; }
    public int Version { get; private set; }
    public DateTime FechaCreacionUtc { get; private set; }
    public Guid CreadaPor { get; private set; }
    public Guid? ReglaAnteriorId { get; private set; }
    public byte[]? RowVersion { get; private set; }

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
        Guid? reglaAnteriorId = null,
        decimal? valorUmbral = null,
        decimal? minValor = null,
        decimal? maxValor = null,
        string? expresion = null,
        string? codigo = null,
        Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(condicionLogica)) throw new ArgumentException("Condición lógica requerida", nameof(condicionLogica));

        if (id.HasValue && id.Value != Guid.Empty)
        {
            Id = id.Value;
        }

        if (valorUmbral.HasValue)
        {
            var min = minValor ?? 0.01m;
            var max = maxValor ?? 0.20m;
            if (valorUmbral.Value < min || valorUmbral.Value > max)
            {
                throw new DomainException(
                    $"El valor umbral ({valorUmbral.Value:P2}) debe estar entre {min:P2} y {max:P2}");
            }
        }

        Nombre = nombre;
        Descripcion = descripcion;
        CondicionLogica = condicionLogica;
        TipoDocumentoAplicable = tipoDocumentoAplicable;
        NivelAlerta = nivelAlerta;
        TipoProyecto = tipoProyecto;
        Activa = true;
        Version = version;
        FechaCreacionUtc = DateTime.UtcNow;
        CreatedAtUtc = DateTime.UtcNow;
        CreadaPor = creadaPor;
        ReglaAnteriorId = reglaAnteriorId;
        ValorUmbral = valorUmbral;
        MinValor = minValor;
        MaxValor = maxValor;
        Expresion = expresion;
        Codigo = codigo;
    }

    public void Update(
        string nombre,
        string descripcion,
        string condicionLogica,
        DocumentType tipoDocumentoAplicable,
        NivelAlerta nivelAlerta,
        TipoProyecto tipoProyecto,
        decimal? valorUmbral = null,
        decimal? minValor = null,
        decimal? maxValor = null,
        string? expresion = null,
        string? codigo = null,
        bool? activa = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(condicionLogica)) throw new ArgumentException("Condición lógica requerida", nameof(condicionLogica));

        if (valorUmbral.HasValue)
        {
            var min = minValor ?? MinValor ?? 0.01m;
            var max = maxValor ?? MaxValor ?? 0.20m;
            if (valorUmbral.Value < min || valorUmbral.Value > max)
            {
                throw new DomainException(
                    $"El valor umbral ({valorUmbral.Value:P2}) debe estar entre {min:P2} y {max:P2}");
            }
        }

        Nombre = nombre;
        Descripcion = descripcion;
        CondicionLogica = condicionLogica;
        TipoDocumentoAplicable = tipoDocumentoAplicable;
        NivelAlerta = nivelAlerta;
        TipoProyecto = tipoProyecto;

        if (valorUmbral.HasValue) ValorUmbral = valorUmbral;
        if (minValor.HasValue) MinValor = minValor;
        if (maxValor.HasValue) MaxValor = maxValor;
        if (!string.IsNullOrWhiteSpace(expresion)) Expresion = expresion;
        if (!string.IsNullOrWhiteSpace(codigo)) Codigo = codigo;
        if (activa.HasValue) Activa = activa.Value;

        Version++;
        UpdatedAtUtc = DateTime.UtcNow;
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
