namespace Domain.Entities;

using System;
using Domain.Common;

public class Verificacion2FA : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public Usuario Usuario { get; private set; } = null!;
    public string SesionId { get; private set; } = null!;
    public string NumeroVerificable { get; private set; } = null!;
    public DateTime FechaCreacion { get; private set; }

    private Verificacion2FA() { }

    public Verificacion2FA(Guid usuarioId, string sesionId, string numeroVerificable)
    {
        if (usuarioId == Guid.Empty) throw new ArgumentException("Usuario requerido", nameof(usuarioId));
        if (string.IsNullOrWhiteSpace(sesionId)) throw new ArgumentException("Sesion requerida", nameof(sesionId));
        if (string.IsNullOrWhiteSpace(numeroVerificable) || numeroVerificable.Length != 6)
            throw new ArgumentException("NumeroVerificable must be exactly 6 alphanumeric characters", nameof(numeroVerificable));

        UsuarioId = usuarioId;
        SesionId = sesionId;
        NumeroVerificable = numeroVerificable;
        FechaCreacion = DateTime.UtcNow;
    }
}
