using System;
using Domain.Enums;

namespace Application.Features.Auth.Commands.UpdatePublicPreferences;

public record UpdatePublicPreferencesCommand(
    Guid UserId,
    NombrePublicoModo? NombreModo,
    IdentificacionPublicaModo? IdentificacionModo
);
