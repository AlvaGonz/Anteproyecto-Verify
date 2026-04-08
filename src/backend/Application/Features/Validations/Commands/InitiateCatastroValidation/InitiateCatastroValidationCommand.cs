namespace Application.Features.Validations.Commands.InitiateCatastroValidation;

using System;

public class InitiateCatastroValidationCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
