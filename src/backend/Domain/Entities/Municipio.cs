namespace Domain.Entities;

using System;
using System.Collections.Generic;

public class Municipio
{
    public Guid IdMunicipio { get; private set; }
    public Guid IdProvincia { get; private set; }
    public string NombreMunicipio { get; private set; } = null!;
    public decimal? Latitud { get; private set; }
    public decimal? Longitud { get; private set; }

    public Provincia Provincia { get; private set; } = null!;
}
