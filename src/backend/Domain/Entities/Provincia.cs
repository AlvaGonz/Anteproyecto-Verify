namespace Domain.Entities;

using System;
using System.Collections.Generic;

public class Provincia
{
    public Guid IdProvincia { get; private set; }
    public string NombreProvincia { get; private set; } = null!;
    public decimal? Latitud { get; private set; }
    public decimal? Longitud { get; private set; }

    public ICollection<Municipio> Municipios { get; private set; } = new List<Municipio>();
}
