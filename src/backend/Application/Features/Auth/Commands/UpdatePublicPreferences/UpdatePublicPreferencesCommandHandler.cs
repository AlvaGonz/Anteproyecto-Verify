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
        // Regla de negocio: el usuario puede elegir una o ambas opciones por grupo,
        // pero NUNCA ninguna (modo 0 = sin selección)
        if (request.NombreModo is null || request.NombreModo == 0 ||
            request.IdentificacionModo is null || request.IdentificacionModo == 0)
        {
            return new UpdatePublicPreferencesResultDto(false, "Debe elegir al menos una opción de nombre y una de identificación.");
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
