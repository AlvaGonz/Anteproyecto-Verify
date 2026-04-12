namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Usuario : EntityBase
{
    public string NombreCompleto { get; private set; } = null!;
    public string CorreoElectronico { get; private set; } = null!;
    public string Email => CorreoElectronico;
    public string ContrasenaHash { get; private set; } = null!;
    public string? Telefono { get; private set; }
    public string? Cedula { get; private set; }
    public string? Identificacion => Cedula;
    public UserRole Rol { get; private set; }
    public bool Activo { get; private set; }

    // Navigation properties
    public ICollection<Proyecto> Proyectos { get; private set; } = new List<Proyecto>();

    private Usuario() { } // For EF Core

    public Usuario(string nombreCompleto, string correoElectronico, string contrasenaHash, UserRole rol)
    {
        if (string.IsNullOrWhiteSpace(nombreCompleto)) throw new ArgumentException("Nombre requerido", nameof(nombreCompleto));
        if (string.IsNullOrWhiteSpace(correoElectronico)) throw new ArgumentException("Correo requerido", nameof(correoElectronico));
        if (string.IsNullOrWhiteSpace(contrasenaHash)) throw new ArgumentException("Contraseña requerida", nameof(contrasenaHash));

        NombreCompleto = nombreCompleto;
        CorreoElectronico = correoElectronico;
        ContrasenaHash = contrasenaHash;
        Rol = rol;
        Activo = true;
    }

    public void UpdateContactInfo(string? telefono, string? cedula)
    {
        Telefono = telefono;
        Cedula = cedula;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
