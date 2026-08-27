namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Collections.Generic;
using Application.DTOs;
using Domain.Enums;

public class PublicProjectStatusDto
{
    public Guid Id { get; set; }
    public string CodigoPublico { get; set; } = string.Empty;
    public string CodigoInterno { get; set; } = string.Empty;
    public string NombreProyecto { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Ubicacion { get; set; }
    public string? UbicacionTexto { get; set; }
    public string? UbicacionGps { get; set; }
    public string? ImagenUrl { get; set; }
    public string? ImagenAdicional1 { get; set; }
    public string? ImagenAdicional2 { get; set; }
    public string? ImagenAdicional3 { get; set; }
    public string? ImagenAdicional4 { get; set; }
    public string? ImagenAdicional5 { get; set; }
    public decimal? ValorEstimado { get; set; }
    public int CategoriaId { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public string? DatosDesarrollador { get; set; }
    public string? RncDesarrollador { get; set; }
    public string? DesignacionCatastral { get; set; }
    public string? Matricula { get; set; }
    public string? Propietario { get; set; }
    public string? CedulaRncPropietario { get; set; }
    public string? Ipi { get; set; }
    public EstadoJuridico EstadoJuridico { get; set; }
    public string? EstatusIpi { get; set; }
    public decimal? SuperficieM2 { get; set; }
    public string EstatusDescripcion { get; set; } = string.Empty;
    public string EstadoProyecto { get; set; } = string.Empty;
    public string EstadoValidacion { get; set; } = string.Empty;
    public IntegrityStatus EstadoIntegridad { get; set; }
    public Guid UsuarioCreadorId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public string? Cercania { get; set; }
    public DateTime FechaEmision { get; set; }
    public ProjectRegistrantDto? RegistradoPor { get; set; }
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
