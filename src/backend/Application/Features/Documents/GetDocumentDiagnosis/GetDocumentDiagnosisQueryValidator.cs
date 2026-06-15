namespace Application.Features.Documents.GetDocumentDiagnosis;

using FluentValidation;

public class GetDocumentDiagnosisQueryValidator : AbstractValidator<GetDocumentDiagnosisQuery>
{
    public GetDocumentDiagnosisQueryValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("El ID del proyecto es requerido.");
    }
}
