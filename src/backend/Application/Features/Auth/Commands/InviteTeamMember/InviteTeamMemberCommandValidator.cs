namespace Application.Features.Auth.Commands.InviteTeamMember;

using FluentValidation;

public class InviteTeamMemberCommandValidator : AbstractValidator<InviteTeamMemberCommand>
{
    public InviteTeamMemberCommandValidator()
    {
        RuleFor(x => x.CorreoElectronico)
            .NotEmpty().WithMessage("El correo electrónico es requerido.")
            .EmailAddress().WithMessage("El formato del correo electrónico es inválido.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres.");

        RuleFor(x => x.Apellido)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .MaximumLength(100).WithMessage("El apellido no puede exceder los 100 caracteres.");

        RuleFor(x => x.TitularId)
            .NotEmpty().WithMessage("El ID del titular es requerido.");
    }
}
