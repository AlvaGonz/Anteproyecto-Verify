namespace Application.Features.Validation.Commands.ExecuteAyuntamientoValidation;

using System;

public class ExecuteAyuntamientoValidationCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
