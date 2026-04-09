namespace Application.Features.Sello.Commands.EmitirSello;

using System;

public class EmitirSelloCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
