namespace Application.Features.Auth.Commands.UploadAvatar;

using System;
using System.IO;

public record UploadAvatarCommand(
    Guid UserId,
    Stream FileStream,
    string FileName,
    string ContentType
);

public record UploadAvatarResultDto(bool IsSuccess, string? ErrorMessage, string? Data);
