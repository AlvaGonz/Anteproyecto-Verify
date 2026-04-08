namespace Infrastructure.Certifications;

using System;
using System.Security.Cryptography;
using System.Text;
using Application.Abstractions.Certifications;

public class CertificationCodeGenerator : ICertificationCodeGenerator
{
    private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded I, O, 1, 0 for readability
    private const int RandomLength = 8;

    public string GenerateCode()
    {
        var year = DateTime.UtcNow.Year;
        var randomPart = GetSecureRandomString(RandomLength);
        
        return $"VF-{year}-{randomPart}";
    }

    private string GetSecureRandomString(int length)
    {
        var result = new StringBuilder(length);
        using (var rng = RandomNumberGenerator.Create())
        {
            var bytes = new byte[length];
            rng.GetBytes(bytes);

            foreach (var b in bytes)
            {
                result.Append(Chars[b % Chars.Length]);
            }
        }
        return result.ToString();
    }
}
