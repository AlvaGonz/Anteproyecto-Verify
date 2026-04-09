namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Collections.Generic;

public class PublicProjectStatusDto
{
    public string CodigoPublico { get; set; } = string.Empty;
    public string NombreProyecto { get; set; } = string.Empty;
    public string EstadoValidacion { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public List<DimensionResumenDto> ResumenDimensiones { get; set; } = new();
}

public class DimensionResumenDto
{
    public string Dimension { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
}
