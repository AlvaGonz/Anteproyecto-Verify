using System;

namespace Domain.Entities;

public class CatastroTitulo
{
    public Guid IdCatastroTitulo { get; set; }
    public string? CodigoDesignacionCatastral { get; set; }
    public string? NumeroTitulo { get; set; }
    public string? Rnc { get; set; }
    public string? Provincia { get; set; }
    public string? Municipio { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public decimal? Superficie { get; set; }
    public string? Matricula { get; set; }
    public string? Oficina { get; set; }
    
    // Nuevas variables mapeadas desde OCR
    public DateTime? FechaInscripcion { get; set; }
    public DateTime? FechaEmision { get; set; }
    public string? VieneDe { get; set; }
    public string? DesignCatastralOrigen { get; set; }
    public string? DesigCatastralPosicional { get; set; }
}
