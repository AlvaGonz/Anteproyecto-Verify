namespace Application.DTOs.Validation;

using System;
using System.Collections.Generic;

public class SearchResultDto
{
    public string TipoConsulta { get; set; } = string.Empty; // "RNC", "Cedula", "Suelo", "IPI"
    public bool EsValido { get; set; }
    public string TituloPrincipal { get; set; } = string.Empty;
    public Dictionary<string, string> Detalles { get; set; } = new();
    public List<ProjectoBasicDto> ProyectosRelacionados { get; set; } = new();
    public List<DocumentoBasicDto> DocumentosRelacionados { get; set; } = new();
    public NetworkGraphDto GrafoRed { get; set; } = new();
}

public class DocumentoBasicDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}

public class ProjectoBasicDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}

public class NetworkGraphDto
{
    public List<NetworkNodeDto> Nodos { get; set; } = new();
    public List<NetworkEdgeDto> Enlaces { get; set; } = new();
}

public class NetworkNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // e.g. "Entidad", "Proyecto"
}

public class NetworkEdgeDto
{
    public string OrigenId { get; set; } = string.Empty;
    public string DestinoId { get; set; } = string.Empty;
    public string Relacion { get; set; } = string.Empty; // e.g. "ParticipaEn"
}
