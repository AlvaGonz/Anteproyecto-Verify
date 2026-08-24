namespace Application.Features.ReglasValidacion.Commands.UpdateRule;

using System;
using Domain.Enums;

public class UpdateRuleCommand
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Codigo { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string CondicionLogica { get; set; } = null!;
    public string? Expresion { get; set; }
    public decimal? ValorUmbral { get; set; }
    public decimal? MinValor { get; set; }
    public decimal? MaxValor { get; set; }
    public DocumentType TipoDocumentoAplicable { get; set; }
    public NivelAlerta NivelAlerta { get; set; }
    public TipoProyecto TipoProyecto { get; set; }
    public bool? Activa { get; set; }
    public string? RowVersion { get; set; }

    public Guid? UsuarioId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}
