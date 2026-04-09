namespace Application.Features.Validation.Commands.ValidarTerritorio;

using System;

public class ValidarTerritorioCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
