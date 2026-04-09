namespace Application.Features.ReglasValidacion.Commands.ToggleRuleStatus;

using System;

public class ToggleRuleStatusCommand
{
    public Guid RuleId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}
