namespace Application.Features.Validation.Commands.CheckDuplicateExpediente;

using System;

public class CheckDuplicateExpedienteCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
