namespace Application.Features.Validations.Commands.InitiateDgriValidation;

using System;

public class InitiateDgriValidationCommand
{
    public Guid ProyectoId { get; set; }
    public string DatosRegistrales { get; set; } = string.Empty;
    public Guid UsuarioId { get; set; }
}
