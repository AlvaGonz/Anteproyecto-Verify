namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class SelloIntegridad : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public string CodigoSello { get; private set; } = null!;
    public string Nombre { get; private set; } = null!;
    public NivelSelloIntegridad Nivel { get; private set; }
    public string UrlQr { get; private set; } = null!;
    public string FirmaDigital { get; private set; } = null!;
    public DateTime FechaEmisionUtc { get; private set; }
    public DateTime FechaExpiracionUtc { get; private set; }
    public EstadoSello Estado { get; private set; }

    private SelloIntegridad() { } // For EF Core

    public SelloIntegridad(
        Guid proyectoId,
        string codigoSello,
        string nombre,
        NivelSelloIntegridad nivel,
        string urlQr,
        string firmaDigital,
        int vigenciaMeses = 12)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(codigoSello)) throw new ArgumentException("Código de sello requerido", nameof(codigoSello));
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(urlQr)) throw new ArgumentException("URL de QR requerida", nameof(urlQr));
        if (string.IsNullOrWhiteSpace(firmaDigital)) throw new ArgumentException("Firma digital requerida", nameof(firmaDigital));

        ProyectoId = proyectoId;
        CodigoSello = codigoSello;
        Nombre = nombre;
        Nivel = nivel;
        UrlQr = urlQr;
        FirmaDigital = firmaDigital;
        FechaEmisionUtc = DateTime.UtcNow;
        FechaExpiracionUtc = FechaEmisionUtc.AddMonths(vigenciaMeses);
        Estado = EstadoSello.Emitido;
    }

    public void Revocar()
    {
        Estado = EstadoSello.Revocado;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void VerificarVigencia()
    {
        if (Estado == EstadoSello.Emitido && DateTime.UtcNow > FechaExpiracionUtc)
        {
            Estado = EstadoSello.Expirado;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
