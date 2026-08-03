using System;

namespace Domain.Entities;

public class PermisoSuelo
{
    public Guid IdPSuelo { get; set; }
    public string? NumeroPermiso { get; set; }
    public string? NumeroExpediente { get; set; }
    public DateTime? FechaEmision { get; set; }
    public string? Rnc { get; set; }
    public string? Provincia { get; set; }
    public string? Municipio { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public decimal? Superficie { get; set; }
    public string? TienePermiso { get; set; }
    public string? Documento { get; set; }
    
    // Nuevos campos
    public string? Departamento { get; set; }
    public string? Operacion { get; set; }
    public string? Seccion { get; set; }
    public string? Lugar { get; set; }
}
