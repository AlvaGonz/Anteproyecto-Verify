namespace Application.Features.Auth.Shared;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.LoginUser;
using Domain.Entities;
using Domain.Enums;

/// <summary>
/// Shared 2FA challenge-building logic for password and Google login handlers.
/// Returns a placeholder <see cref="LoginUserResponseDto"/> with <c>Requires2fa = true</c>
/// or <c>null</c> if the user has 2FA disabled (caller proceeds with normal login).
///</summary>
public static class TwoFactorLoginBranch
{
    public static async Task<LoginUserResponseDto?> BuildChallengeResponseAsync(
        Usuario user,
        ITwoFactorChallengeStore challengeStore,
        CancellationToken cancellationToken)
    {
        if (!user.TwoFactorEnabled) return null;

        var challenge = await challengeStore.CreateAsync(user.Id, cancellationToken);
        var placeholderUser = new LoginUserUserDto(
            user.Id,
            user.Email,
            user.NombreCompleto,
            user.Rol == UserRole.Administrator ? "admin" : "user",
            user.AvatarUrl);

        return new LoginUserResponseDto(
            User: placeholderUser,
            Token: string.Empty,
            Requires2fa: true,
            ChallengeToken: challenge.ChallengeToken,
            EmailMasked: MaskEmail(user.Email));
    }

    public static string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains('@')) return email;
        var at = email.IndexOf('@');
        var local = email[..at];
        var domain = email[at..];
        if (local.Length <= 2) return local[0] + "***" + domain;
        return local[..2] + "***" + domain;
    }
}
