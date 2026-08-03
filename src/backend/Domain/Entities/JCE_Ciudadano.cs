using System;

namespace Domain.Entities;

public class JCE_Ciudadano
{
    public string Cedula { get; set; } = string.Empty; // Primary Key
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public DateTime FechaExpiracion { get; set; }
}
