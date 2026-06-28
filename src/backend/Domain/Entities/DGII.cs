namespace Domain.Entities;

using System;

public class DGII
{
    public string Rnc { get; set; } = null!;
    public string NombreRazonSocial { get; set; } = null!;
    public string? NombreComercial { get; set; }
    public string? Categoria { get; set; }
    public string? RegimenPagos { get; set; }
    public string? Estado { get; set; }
    public string? ActividadEconomica { get; set; }
    public string? AdministracionLocal { get; set; }
    public string? FacturadorElectronico { get; set; }
    public string? LicenciasVhm { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
