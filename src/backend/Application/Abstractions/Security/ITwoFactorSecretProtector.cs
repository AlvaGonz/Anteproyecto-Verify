namespace Application.Abstractions.Security;

public interface ITwoFactorSecretProtector
{
    string Protect(string plainSecret);
    string Unprotect(string protectedSecret);
}
