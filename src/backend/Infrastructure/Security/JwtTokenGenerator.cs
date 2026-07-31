namespace Infrastructure.Security;

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _jwtOptions;

    public JwtTokenGenerator(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }

    public string GenerateToken(Usuario user, bool mfaAuthenticated = false)
    {
        var roleStr = user.Rol switch
        {
            UserRole.Administrator => "admin",
            UserRole.User => "user",
            _ => "user"
        };

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.CorreoElectronico),
            new Claim(JwtRegisteredClaimNames.Name, user.NombreCompleto),
            new Claim(ClaimTypes.Role, roleStr),
            new Claim("cedula", user.Cedula ?? string.Empty),
            new Claim("telefono", user.Telefono ?? string.Empty),
            new Claim("two_factor_enabled", user.TwoFactorEnabled ? "true" : "false"),
            new Claim("amr", mfaAuthenticated ? "2fa" : "pwd")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
