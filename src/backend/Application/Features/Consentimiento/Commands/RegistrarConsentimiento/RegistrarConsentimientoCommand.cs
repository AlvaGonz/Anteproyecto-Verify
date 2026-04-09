namespace Application.Features.Consentimiento.Commands.RegistrarConsentimiento;

using System;

public class RegistrarConsentimientoCommand
{
    public Guid UsuarioId { get; set; }
    public string IpOrigen { get; set; } = string.Empty;
    public string VersionPolitica { get; set; } = string.Empty;
}
