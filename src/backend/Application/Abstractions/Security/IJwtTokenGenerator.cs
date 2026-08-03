namespace Application.Abstractions.Security;

using System.Security.Claims;
using Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateToken(Usuario user, bool mfaAuthenticated = false);
}
