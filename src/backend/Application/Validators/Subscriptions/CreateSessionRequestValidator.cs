using Application.DTOs.Subscriptions;
using FluentValidation;
using Microsoft.Extensions.Configuration;

namespace Application.Validators.Subscriptions;

public class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
{
    public CreateSessionRequestValidator(IConfiguration configuration)
    {
        RuleFor(x => x.PriceId)
            .NotEmpty().WithMessage("PriceId es requerido.")
            .Must(priceId => IsValidPriceId(priceId, configuration))
            .WithMessage("El PriceId proporcionado no es válido.");

        RuleFor(x => x.UserId).NotEmpty();
    }

    private bool IsValidPriceId(string priceId, IConfiguration config)
    {
        var validPrices = new[]
        {
            config["Stripe:Prices:ProfesionalMonthly"],
            config["Stripe:Prices:ProfesionalAnual"],
            config["Stripe:Prices:EmpresaMonthly"],
            config["Stripe:Prices:EmpresaAnual"],
            config["Stripe:Prices:EnterpriseMonthly"],
            config["Stripe:Prices:EnterpriseAnual"]
        };

        return validPrices.Contains(priceId) && !string.IsNullOrEmpty(priceId);
    }
}
