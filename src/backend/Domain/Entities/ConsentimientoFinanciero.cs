namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ConsentimientoFinanciero : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public Usuario Usuario { get; private set; } = null!;
    
    public DateTime FechaHoraUtc { get; private set; }
    public string IpOrigen { get; private set; }
    public string VersionPolitica { get; private set; }
    public EstadoConsentimiento Estado { get; private set; }
    public DateTime FechaExpiracionUtc { get; private set; }

    private ConsentimientoFinanciero() { } // For EF Core

    public ConsentimientoFinanciero(Guid usuarioId, string ipOrigen, string versionPolitica, int vigenciaDias = 30)
    {
        if (usuarioId == Guid.Empty) throw new ArgumentException("Usuario requerido", nameof(usuarioId));
        if (string.IsNullOrWhiteSpace(ipOrigen)) throw new ArgumentException("IP de origen requerida", nameof(ipOrigen));
        if (string.IsNullOrWhiteSpace(versionPolitica)) throw new ArgumentException("Versión de política requerida", nameof(versionPolitica));

        UsuarioId = usuarioId;
        IpOrigen = ipOrigen;
        VersionPolitica = versionPolitica;
        FechaHoraUtc = DateTime.UtcNow;
        Estado = EstadoConsentimiento.Vigente;
        FechaExpiracionUtc = FechaHoraUtc.AddDays(vigenciaDias);
    }

    public void Revocar()
    {
        Estado = EstadoConsentimiento.Revocado;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void VerificarVigencia()
    {
        if (Estado == EstadoConsentimiento.Vigente && DateTime.UtcNow > FechaExpiracionUtc)
        {
            Estado = EstadoConsentimiento.Expirado;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
