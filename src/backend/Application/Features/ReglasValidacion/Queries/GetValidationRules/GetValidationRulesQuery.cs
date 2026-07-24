namespace Application.Features.ReglasValidacion.Queries.GetValidationRules;

using System;
using System.Collections.Generic;
using Domain.Enums;

public class ReglaValidacionDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CondicionLogica { get; set; } = string.Empty;
    public string TipoDocumentoAplicable { get; set; } = string.Empty;
    public string NivelAlerta { get; set; } = string.Empty;
    public string TipoProyecto { get; set; } = string.Empty;
    public bool Activa { get; set; }
    public int Version { get; set; }
    public DateTime FechaCreacionUtc { get; set; }
}

public class GetValidationRulesQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
