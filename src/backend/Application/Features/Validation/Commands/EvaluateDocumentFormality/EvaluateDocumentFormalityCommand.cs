namespace Application.Features.Validation.Commands.EvaluateDocumentFormality;

using System;

public class EvaluateDocumentFormalityCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
}
