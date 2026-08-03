namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public sealed record GetTwoFactorStatusQuery(Guid UsuarioId);
public sealed record TwoFactorStatusDto(bool Enabled, bool HasRecoveryCodes);

public sealed class GetTwoFactorStatusQueryHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    public GetTwoFactorStatusQueryHandler(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<TwoFactorStatusDto> Handle(GetTwoFactorStatusQuery request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UsuarioId, cancellationToken);
        if (user is null)
            return new TwoFactorStatusDto(false, false);

        var hasCodes = !string.IsNullOrWhiteSpace(user.RecoveryCodesHashJson)
            && user.RecoveryCodesHashJson != "[]";
        return new TwoFactorStatusDto(user.TwoFactorEnabled, hasCodes);
    }
}
