namespace Domain.Entities;

using System;

public class SesionUsuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
    public bool IsRevoked { get; set; }
    
    // Opcional para futuras auditorías o controles
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public virtual Usuario? Usuario { get; set; }

    public SesionUsuario() { }

    public SesionUsuario(Guid usuarioId, string refreshToken, DateTime expiresAtUtc, string? ipAddress = null, string? userAgent = null)
    {
        UsuarioId = usuarioId;
        RefreshToken = refreshToken;
        ExpiresAtUtc = expiresAtUtc;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        IsRevoked = false;
    }
}
