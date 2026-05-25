namespace Infrastructure.Security;

using Application.Abstractions.Security;
using BCrypt.Net;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            return BCrypt.Verify(password, hashedPassword);
        }
        catch
        {
            return false;
        }
    }
}
