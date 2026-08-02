using System;
using System.Security.Cryptography;
using Application.Abstractions.Security;
using Microsoft.AspNetCore.DataProtection;

namespace Infrastructure.Security;

public class TwoFactorSecretProtector : ITwoFactorSecretProtector
{
    private readonly IDataProtector _protector;

    public TwoFactorSecretProtector(IDataProtector protector)
    {
        _protector = protector;
    }

    public string Protect(string plainSecret) => _protector.Protect(plainSecret);
    public string Unprotect(string protectedSecret) => _protector.Unprotect(protectedSecret);
}
