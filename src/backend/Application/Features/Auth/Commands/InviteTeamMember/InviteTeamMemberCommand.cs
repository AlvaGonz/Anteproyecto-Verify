namespace Application.Features.Auth.Commands.InviteTeamMember;

using System;

public record InviteTeamMemberCommand(
    Guid TitularId,
    string Nombre,
    string Apellido,
    string CorreoElectronico,
    string? Telefono
);

public record InviteTeamMemberResult(
    bool Success,
    string Message,
    Guid? UsuarioId = null
);
