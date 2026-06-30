namespace Domain.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    public bool EmailVerificado { get; private set; }
    public string? TokenVerificacion { get; private set; }
    public DateTime? TokenVerificacionExpiraUtc { get; private set; }
    
    public string? AvatarUrl { get; private set; }

    // Stripe Billing Integration
    public string? StripeCustomerId { get; private set; }
    public string? StripeSubscriptionId { get; private set; }
    public string? SubscriptionStatus { get; private set; }
    public DateTime? CurrentPeriodEnd { get; private set; }

    // Optimistic concurrency token
    [Timestamp]
    public byte[]? RowVersion { get; private set; }

    public Guid? PlanSuscripcionId { get; private set; }
    public PlanSuscripcion? Plan { get; private set; }
    public int ConsultasUsadas { get; private set; }
    public int ProyectosCreados { get; private set; }

    public Guid? TitularId { get; private set; }
    public Usuario? Titular { get; private set; }
    public ICollection<Usuario> MiembrosEquipo { get; private set; } = new List<Usuario>();

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
        EmailVerificado = false;
    }

    public void UpdateContactInfo(string telefono, string cedula)
    {
        if (string.IsNullOrWhiteSpace(telefono)) throw new ArgumentException("Teléfono requerido", nameof(telefono));
        if (string.IsNullOrWhiteSpace(cedula)) throw new ArgumentException("Cédula requerida", nameof(cedula));
        Telefono = telefono;
        Cedula = cedula;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateProfile(string nombre, string apellido, string telefono)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(apellido)) throw new ArgumentException("Apellido requerido", nameof(apellido));
        if (string.IsNullOrWhiteSpace(telefono)) throw new ArgumentException("Teléfono requerido", nameof(telefono));
        
        Nombre = nombre;
        Apellido = apellido;
        NombreCompleto = $"{nombre} {apellido}";
        Telefono = telefono;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdatePassword(string contrasenaHash)
    {
        if (string.IsNullOrWhiteSpace(contrasenaHash)) throw new ArgumentException("Contraseña requerida", nameof(contrasenaHash));
        ContrasenaHash = contrasenaHash;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateAvatarUrl(string avatarUrl)
    {
        AvatarUrl = avatarUrl;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateRol(UserRole rol)
    {
        Rol = rol;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void GenerarTokenVerificacion()
    {
        TokenVerificacion = Guid.NewGuid().ToString("N");
        TokenVerificacionExpiraUtc = DateTime.UtcNow.AddHours(24);
    }

    public bool VerificarEmail(string token)
    {
        if (EmailVerificado) return true;
        
        if (string.IsNullOrWhiteSpace(token) || 
            TokenVerificacion != token || 
            DateTime.UtcNow > TokenVerificacionExpiraUtc)
        {
            return false;
        }

        EmailVerificado = true;
        TokenVerificacion = null;
        TokenVerificacionExpiraUtc = null;
        UpdatedAtUtc = DateTime.UtcNow;
        return true;
    }

    public void AsignarPlan(Guid planId)
    {
        PlanSuscripcionId = planId;
        ConsultasUsadas = 0; // Reset count when changing plans
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStripeSubscription(string? stripeCustomerId, string? stripeSubscriptionId, string? status, DateTime? currentPeriodEnd)
    {
        if (stripeCustomerId != null) StripeCustomerId = stripeCustomerId;
        StripeSubscriptionId = stripeSubscriptionId;
        SubscriptionStatus = status;
        CurrentPeriodEnd = currentPeriodEnd;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void IncrementarConsulta()
    {
        ConsultasUsadas++;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void IncrementarProyecto()
    {
        ProyectosCreados++;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ResetearConsumosMensuales()
    {
        ConsultasUsadas = 0;
        ProyectosCreados = 0;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AsignarTitular(Guid titularId)
    {
        TitularId = titularId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void RemoverTitular()
    {
        TitularId = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public bool EsAdministrador()
    {
        return Rol == UserRole.Administrator || Rol == UserRole.Owner;
    }
}
