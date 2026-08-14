namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Collections.Generic;

public class PublicProjectStatusDto
{
    public Guid Id { get; set; }
    public string CodigoPublico { get; set; } = string.Empty;
    public string NombreProyecto { get; set; } = string.Empty;
    public string? Ubicacion { get; set; }
    public string EstadoValidacion { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public List<DimensionResumenDto> ResumenDimensiones { get; set; } = new();
    public List<PublicDocumentSummaryDto> Documentos { get; set; } = new();
}

public class DimensionResumenDto
{
    public string Dimension { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
}

public class PublicDocumentSummaryDto
{
    public Guid Id { get; set; }
    public int TipoDocumento { get; set; }
    public string NombreArchivoOriginal { get; set; } = string.Empty;
    public int EstadoDocumento { get; set; }
}
