namespace Application.Features.PublicConsulta.Queries.SearchPublicProjects;

using System;
using System.Collections.Generic;

public class SearchPublicProjectsQuery
{
    public string Query { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}

public class PublicProjectSearchResultDto
{
    public Guid Id { get; set; }
    public string NombreProyecto { get; set; } = string.Empty;
    public string? CodigoPublico { get; set; }
    public string EstadoValidacion { get; set; } = string.Empty;
    public string? UbicacionTexto { get; set; }
    public int EstadoJuridico { get; set; }
    public string EstadoProyecto { get; set; } = string.Empty;
    public int EstadoIntegridad { get; set; }
    public string? Constructora { get; set; }
    public string? Registrante { get; set; }
    public string? ImagenUrl { get; set; }
    public int CategoriaId { get; set; }
    public decimal? ValorEstimado { get; set; }
    public string? DesignacionCatastral { get; set; }
    public string? Matricula { get; set; }
    public string? RncDesarrollador { get; set; }
    public string? CedulaRncPropietario { get; set; }
    public int CompletionRate { get; set; }
    public int IntegridadValidada { get; set; }
}

public class PublicProjectSearchResponseDto
{
    public List<PublicProjectSearchResultDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
