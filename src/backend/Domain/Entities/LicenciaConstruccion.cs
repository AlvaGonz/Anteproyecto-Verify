namespace Domain.Entities;

using System;

public class LicenciaConstruccion
{
    public Guid MivedId { get; set; }
    public string NumeroPermiso { get; set; } = null!;
    public string NombreProyecto { get; set; } = null!;
    public string? Tipologia { get; set; }
    public DateTime? FechaEntrada { get; set; }
    public DateTime? FechaEmision { get; set; }
    public string? Provincia { get; set; }
    public string? Municipio { get; set; }
    public int? UnidadesHabitacionales { get; set; }
    public int? LocalesComerciales { get; set; }
    public string? Rnc { get; set; }
    public string? NombreRazonSocial { get; set; }
}
