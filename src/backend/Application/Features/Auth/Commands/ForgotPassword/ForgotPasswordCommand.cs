using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email);

public record ForgotPasswordResponseDto(bool IsSuccess, string? ErrorMessage);
