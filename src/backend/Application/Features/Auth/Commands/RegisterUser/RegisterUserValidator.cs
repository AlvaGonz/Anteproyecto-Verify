namespace Application.Features.Auth.Commands.RegisterUser;

using FluentValidation;
using System.Text.RegularExpressions;

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    // Cédula check-digit algorithm (JCE Luhn mod-10 variant)
    private static bool ValidateCedulaCheckDigit(string digits)
    {
        if (digits.Length != 11) return false;
        int[] multipliers = { 1, 2, 1, 2, 1, 2, 1, 2, 1, 2 };
        int sum = 0;
        for (int i = 0; i < 10; i++)
        {
            int product = int.Parse(digits[i].ToString()) * multipliers[i];
            if (product >= 10) product -= 9;
            sum += product;
        }
        int checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit == int.Parse(digits[10].ToString());
    }

    public RegisterUserValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .Matches(@"^[a-zA-ZÀ-ÿ\s]+$").WithMessage("El nombre solo puede contener letras.");

        RuleFor(x => x.Apellido)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .Matches(@"^[a-zA-ZÀ-ÿ\s]+$").WithMessage("El apellido solo puede contener letras.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido.")
            .EmailAddress().WithMessage("Formato de email inválido.");

        // Strip non-digits then validate
        RuleFor(x => x.Telefono)
            .NotEmpty().WithMessage("El teléfono es requerido.")
            .Must(t =>
            {
                var digits = Regex.Replace(t ?? "", @"\D", "");
                return Regex.IsMatch(digits, @"^(809|829|849)\d{7}$");
            })
            .WithMessage("Teléfono inválido. Solo códigos 809, 829 o 849 (ej: 809-555-0199).");

        // Cédula: strip dashes → validate format → validate check digit
        RuleFor(x => x.Cedula)
            .NotEmpty().WithMessage("La cédula es requerida.")
            .Must(c =>
            {
                var digits = Regex.Replace(c ?? "", @"\D", "");
                return Regex.IsMatch(digits, @"^\d{11}$");
            })
            .WithMessage("La cédula debe tener 11 dígitos (formato: 001-1234567-8).")
            .Must(c =>
            {
                var digits = Regex.Replace(c ?? "", @"\D", "");
                return ValidateCedulaCheckDigit(digits);
            })
            .WithMessage("Cédula inválida: el dígito verificador no es correcto.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("La contraseña debe tener mínimo 8 caracteres.");
    }
}
