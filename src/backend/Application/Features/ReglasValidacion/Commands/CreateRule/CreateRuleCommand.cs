namespace Application.Features.ReglasValidacion.Commands.CreateRule;

using System;
using Domain.Enums;

public class CreateRuleCommand
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CondicionLogica { get; set; } = string.Empty;
    public DocumentType TipoDocumentoAplicable { get; set; }
    public NivelAlerta NivelAlerta { get; set; }
    public TipoProyecto TipoProyecto { get; set; }
    public Guid? UsuarioId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}
