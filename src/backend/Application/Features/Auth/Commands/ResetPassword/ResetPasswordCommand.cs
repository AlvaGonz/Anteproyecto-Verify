using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(string Token, string NewPassword);

public record ResetPasswordResponseDto(bool IsSuccess, string? ErrorMessage);
