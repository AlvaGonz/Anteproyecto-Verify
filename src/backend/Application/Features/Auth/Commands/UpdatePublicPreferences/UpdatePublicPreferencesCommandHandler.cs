using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

namespace Application.Features.Auth.Commands.UpdatePublicPreferences;

public record UpdatePublicPreferencesResultDto(bool IsSuccess, string? ErrorMessage);

public class UpdatePublicPreferencesCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePublicPreferencesCommandHandler(IUsuarioRepository usuarioRepository, IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdatePublicPreferencesResultDto> Handle(UpdatePublicPreferencesCommand request, CancellationToken cancellationToken)
    {
        if (request.NombreModo is null || request.IdentificacionModo is null)
        {
            return new UpdatePublicPreferencesResultDto(false, "Debe especificar nombre y modo de identificación.");
        }

        var user = await _usuarioRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return new UpdatePublicPreferencesResultDto(false, "Usuario no encontrado.");
        }

        user.UpdatePreferenciasPublicas(request.NombreModo, request.IdentificacionModo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UpdatePublicPreferencesResultDto(true, null);
    }
}
