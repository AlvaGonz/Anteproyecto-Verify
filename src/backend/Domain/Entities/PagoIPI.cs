using System;

namespace Domain.Entities;

public class PagoIPI
{
    public string Rnc { get; set; } = string.Empty; // Primary Key
    public decimal Cuota_ipi { get; set; }
    public string Estatus { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    
    // Nuevos campos OCR
    public string? NoCertificacion { get; set; }
    public string? NoInmueble { get; set; }
    public string? ParcelaNo { get; set; }
}
