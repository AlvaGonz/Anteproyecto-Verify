namespace Domain.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using Domain.Common;
using Domain.Enums;
using Domain.Policies;

public class Usuario : EntityBase, IEffectivePlanUser
{
    public string Nombre { get; private set; } = null!;
    public string Apellido { get; private set; } = null!;
    public string NombreCompleto { get; private set; } = null!;
    public string CorreoElectronico { get; private set; } = null!;
    public string Email => CorreoElectronico;
    public string ContrasenaHash { get; private set; } = null!;
    public string Telefono { get; private set; } = null!;
    public string Cedula { get; private set; } = null!;
    public string? Rnc { get; private set; }
    public string? RazonSocial { get; private set; }
    public string? NombreComercial { get; private set; }
    public string? ActividadEconomica { get; private set; }
    public string? Direccion { get; private set; }
    public string? Provincia { get; private set; }
    public string? Nickname { get; private set; }
    public string Identificacion => Cedula;
    public UserRole Rol { get; private set; }
    public bool Activo { get; private set; }
    public UserAccountStatus AccountStatus { get; private set; }
    public DateTime? DeletedAtUtc { get; private set; }
    public DateTime? RecoverUntilUtc { get; private set; }
    public DateTime? PurgeAtUtc { get; private set; }
    public string? DeletionReason { get; private set; }
    public bool EmailVerificado { get; private set; }
    public string? TokenVerificacion { get; private set; }
    public DateTime? TokenVerificacionExpiraUtc { get; private set; }
    
    // Recuperación de Contraseña
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiraUtc { get; private set; }
    
    public string? AvatarUrl { get; private set; }

    // Stripe Billing Integration
    public string? StripeCustomerId { get; private set; }
    public string? StripeSubscriptionId { get; private set; }
    public string? SubscriptionStatus { get; private set; }
    public DateTime? CurrentPeriodEnd { get; private set; }
    public bool CancelAtPeriodEnd { get; private set; }
    public DateTime? CancelAt { get; private set; }

    // Google Auth
    public bool SocialLogin { get; private set; }
    public string? GoogleId { get; private set; }

    public bool AceptoDescargo { get; private set; }

    // Post-verify checkout flow: plan selected before registration, completed after verification
    // ponytail: PendingPlanCode holds the plan key (profesional/empresa/corporativo), PendingBillingCycle holds monthly/yearly
    public string? PendingPlanCode { get; private set; }
    public string? PendingBillingCycle { get; private set; }

    // Optimistic concurrency token
    [Timestamp]
    public byte[]? RowVersion { get; private set; }

    public Guid? PlanSuscripcionId { get; private set; }
    public PlanSuscripcion? Plan { get; private set; }
    IPlanData? Domain.Policies.IEffectivePlanUser.Plan => Plan;
    public int ConsultasUsadas { get; private set; }
    public int ProyectosCreados { get; private set; }

    public int? MaxProyectosDelegados { get; private set; }
    public int? MaxConsultasDelegadas { get; private set; }

    public Guid? TitularId { get; private set; }
    public Usuario? Titular { get; private set; }
    Domain.Policies.IEffectivePlanUser? Domain.Policies.IEffectivePlanUser.Titular => Titular;
    public ICollection<Usuario> MiembrosEquipo { get; private set; } = new List<Usuario>();

    // Navigation properties
    public ICollection<Proyecto> Proyectos { get; private set; } = new List<Proyecto>();

    int? Domain.Policies.IEffectivePlanUser.MaxUsuariosSecundarios => Plan?.MaxUsuariosSecundarios;

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
        AccountStatus = UserAccountStatus.Active;
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

    public void UpdateAccountStatus(UserAccountStatus status)
    {
        AccountStatus = status;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AceptarDescargo()
    {
        AceptoDescargo = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
    
    public void UpdateProfileExtension(string? direccion, string? provincia, string? nickname)
    {
        Direccion = direccion;
        Provincia = provincia;
        Nickname = nickname;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateRnc(string? rnc, string? razonSocial = null, string? nombreComercial = null, string? actividadEconomica = null)
    {
        Rnc = rnc;
        RazonSocial = razonSocial;
        NombreComercial = nombreComercial;
        ActividadEconomica = actividadEconomica;
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

    public void ForzarVerificacionEmail()
    {
        EmailVerificado = true;
        TokenVerificacion = null;
        TokenVerificacionExpiraUtc = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void GenerarTokenRecuperacion()
    {
        PasswordResetToken = Guid.NewGuid().ToString("N");
        PasswordResetTokenExpiraUtc = DateTime.UtcNow.AddHours(1); // Expiración en 1 hora
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiraUtc = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public bool IsPasswordResetTokenValid()
    {
        return !string.IsNullOrWhiteSpace(PasswordResetToken) &&
               PasswordResetTokenExpiraUtc.HasValue &&
               DateTime.UtcNow <= PasswordResetTokenExpiraUtc.Value;
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

    public void SetPendingPlan(string? planCode, string? billingCycle)
    {
        PendingPlanCode = planCode;
        PendingBillingCycle = billingCycle;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ClearPendingPlan()
    {
        PendingPlanCode = null;
        PendingBillingCycle = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AsignarTitular(Guid titularId)
    {
        TitularId = titularId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetDelegatedLimits(int? maxProyectos, int? maxConsultas)
    {
        MaxProyectosDelegados = maxProyectos;
        MaxConsultasDelegadas = maxConsultas;
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

    public void SetStripeCustomerId(string customerId)
    {
        if (string.IsNullOrWhiteSpace(customerId)) throw new ArgumentException("Customer ID requerido", nameof(customerId));
        StripeCustomerId = customerId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStripeSubscription(string? subscriptionId, string? status, DateTime? currentPeriodEnd)
    {
        StripeSubscriptionId = subscriptionId;
        SubscriptionStatus = status;
        CurrentPeriodEnd = currentPeriodEnd;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetCancellationScheduled(DateTime? cancelAt)
    {
        CancelAtPeriodEnd = true;
        CancelAt = cancelAt;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ClearCancellationScheduled()
    {
        CancelAtPeriodEnd = false;
        CancelAt = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    // ── Account Lifecycle ────────────────────────────

    public void RequestDeletion(string? reason)
    {
        if (AccountStatus == UserAccountStatus.PendingDeletion)
            throw new InvalidOperationException("La cuenta ya está pendiente de eliminación.");
        if (AccountStatus == UserAccountStatus.Purged)
            throw new InvalidOperationException("La cuenta ya ha sido purgada.");

        AccountStatus = UserAccountStatus.PendingDeletion;
        Activo = false;
        DeletedAtUtc = DateTime.UtcNow;
        RecoverUntilUtc = DateTime.UtcNow.AddDays(14);
        PurgeAtUtc = DateTime.UtcNow.AddDays(30);
        DeletionReason = reason;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void RecoverAccount()
    {
        if (AccountStatus != UserAccountStatus.PendingDeletion)
            throw new InvalidOperationException("La cuenta no está pendiente de eliminación.");
        if (!IsWithinRecoveryWindow)
            throw new InvalidOperationException("El período de recuperación ha expirado.");

        AccountStatus = UserAccountStatus.Active;
        Activo = true;
        DeletedAtUtc = null;
        RecoverUntilUtc = null;
        PurgeAtUtc = null;
        DeletionReason = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public bool IsWithinRecoveryWindow =>
        AccountStatus == UserAccountStatus.PendingDeletion &&
        RecoverUntilUtc.HasValue &&
        DateTime.UtcNow <= RecoverUntilUtc.Value;

    public void AnonymizePii()
    {
        Nombre = "Usuario eliminado";
        Apellido = "Usuario eliminado";
        NombreCompleto = "Usuario eliminado";
        CorreoElectronico = HashEmail(CorreoElectronico);
        Telefono = null!;
        AccountStatus = UserAccountStatus.Purged;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private static string HashEmail(string email)
    {
        var input = $"{email}::verifinca-anon-salt-2026";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        var hash = Convert.ToHexString(bytes).ToLowerInvariant();
        return $"{hash}@anon.verifinca.do";
    }

    public void VincularGoogleAccount(string googleId)
    {
        if (string.IsNullOrWhiteSpace(googleId)) throw new ArgumentException("Google ID requerido", nameof(googleId));
        SocialLogin = true;
        GoogleId = googleId;
        EmailVerificado = true; // Google verifies the email
        UpdatedAtUtc = DateTime.UtcNow;
    }

    // ── Two-Factor Authentication (TOTP + Recovery Codes) ──

    public bool TwoFactorEnabled { get; private set; }
    public string? TwoFactorSecretEncrypted { get; private set; }
    public string? RecoveryCodesHashJson { get; private set; }
    public int Failed2FAAttempts { get; private set; }
    public DateTime? Lockout2FAUntilUtc { get; private set; }
    public DateTime? Last2FAVerifiedUtc { get; private set; }
    public DateTime? EmailOtpLastSentUtc { get; private set; }

    public const int TwoFactorMaxFailedAttempts = 5;
    public static readonly TimeSpan TwoFactorLockoutDuration = TimeSpan.FromMinutes(5);

    public bool Is2FALockedOut
    {
        get
        {
            if (!Lockout2FAUntilUtc.HasValue) return false;
            if (DateTime.UtcNow >= Lockout2FAUntilUtc.Value)
            {
                Lockout2FAUntilUtc = null;
                Failed2FAAttempts = 0;
                return false;
            }
            return true;
        }
    }

    public DateTime? Lockout2FARemaining => Is2FALockedOut ? Lockout2FAUntilUtc : null;

    public void Begin2FAEnrollment(string secretEncrypted)
    {
        if (string.IsNullOrWhiteSpace(secretEncrypted))
            throw new ArgumentException("Secret requerido para activar 2FA.", nameof(secretEncrypted));
        if (TwoFactorEnabled)
            throw new InvalidOperationException("2FA ya está activado.");

        TwoFactorSecretEncrypted = secretEncrypted;
        RecoveryCodesHashJson = null;
        Failed2FAAttempts = 0;
        Lockout2FAUntilUtc = null;
        EmailOtpLastSentUtc = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Confirm2FAEnrollment(string recoveryCodesHashJson)
    {
        if (string.IsNullOrWhiteSpace(TwoFactorSecretEncrypted))
            throw new InvalidOperationException("No hay un enrollment pendiente de 2FA.");
        if (TwoFactorEnabled)
            throw new InvalidOperationException("2FA ya está activado.");
        if (string.IsNullOrWhiteSpace(recoveryCodesHashJson))
            throw new ArgumentException("Recovery codes requeridos.", nameof(recoveryCodesHashJson));

        TwoFactorEnabled = true;
        RecoveryCodesHashJson = recoveryCodesHashJson;
        Failed2FAAttempts = 0;
        Lockout2FAUntilUtc = null;
        Last2FAVerifiedUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Register2FASuccess()
    {
        Failed2FAAttempts = 0;
        Lockout2FAUntilUtc = null;
        Last2FAVerifiedUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Register2FAFailure()
    {
        Failed2FAAttempts++;
        if (Failed2FAAttempts >= TwoFactorMaxFailedAttempts)
        {
            Lockout2FAUntilUtc = DateTime.UtcNow.Add(TwoFactorLockoutDuration);
        }
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Disable2FA()
    {
        if (!TwoFactorEnabled)
            throw new InvalidOperationException("2FA no está activado.");
        TwoFactorEnabled = false;
        TwoFactorSecretEncrypted = null;
        RecoveryCodesHashJson = null;
        Failed2FAAttempts = 0;
        Lockout2FAUntilUtc = null;
        Last2FAVerifiedUtc = null;
        EmailOtpLastSentUtc = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ReplaceRecoveryCodes(string newRecoveryCodesHashJson)
    {
        if (!TwoFactorEnabled)
            throw new InvalidOperationException("2FA debe estar activado para regenerar códigos.");
        if (string.IsNullOrWhiteSpace(newRecoveryCodesHashJson))
            throw new ArgumentException("Recovery codes requeridos.", nameof(newRecoveryCodesHashJson));
        RecoveryCodesHashJson = newRecoveryCodesHashJson;
        Failed2FAAttempts = 0;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkEmailOtpSent()
    {
        EmailOtpLastSentUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private string? secretForEnrollment => TwoFactorSecretEncrypted;
}
