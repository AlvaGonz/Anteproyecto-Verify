namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Usuario : EntityBase
{
    public string Nombre { get; private set; } = null!;
    public string Apellido { get; private set; } = null!;
    public string NombreCompleto { get; private set; } = null!;
    public string CorreoElectronico { get; private set; } = null!;
    public string Email => CorreoElectronico;
    public string ContrasenaHash { get; private set; } = null!;
    public string Telefono { get; private set; } = null!;
    public string Cedula { get; private set; } = null!;
    public string Identificacion => Cedula;
    public UserRole Rol { get; private set; }
    public bool Activo { get; private set; }

    // Navigation properties
    public ICollection<Proyecto> Proyectos { get; private set; } = new List<Proyecto>();

    private Usuario() { } // For EF Core

    public Usuario(string nombre, string apellido, string correoElectronico, string contrasenaHash, UserRole rol, string telefono, string cedula)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(apellido)) throw new ArgumentException("Apellido requerido", nameof(apellido));
        if (string.IsNullOrWhiteSpace(correoElectronico)) throw new ArgumentException("Correo requerido", nameof(correoElectronico));
        if (string.IsNullOrWhiteSpace(contrasenaHash)) throw new ArgumentException("Contraseña requerida", nameof(contrasenaHash));
        if (string.IsNullOrWhiteSpace(telefono)) throw new ArgumentException("Teléfono requerido", nameof(telefono));
        if (string.IsNullOrWhiteSpace(cedula)) throw new ArgumentException("Cédula requerida", nameof(cedula));

        Nombre = nombre;
        Apellido = apellido;
        NombreCompleto = $"{nombre} {apellido}";
        CorreoElectronico = correoElectronico;
        ContrasenaHash = contrasenaHash;
        Rol = rol;
        Telefono = telefono;
        Cedula = cedula;
        Activo = true;
    }

    public void UpdateContactInfo(string telefono, string cedula)
    {
        if (string.IsNullOrWhiteSpace(telefono)) throw new ArgumentException("Teléfono requerido", nameof(telefono));
        if (string.IsNullOrWhiteSpace(cedula)) throw new ArgumentException("Cédula requerida", nameof(cedula));
        Telefono = telefono;
        Cedula = cedula;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateRol(UserRole rol)
    {
        Rol = rol;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
