namespace Application.Abstractions.Security;

public sealed record RecoveryCodeSet(IReadOnlyList<string> PlainCodes, string HashedJson);

public interface IRecoveryCodeService
{
    RecoveryCodeSet Generate(int count = 10);
    string Hash(string plainCode);
    bool Verify(string hashedCode, string plainCode);
    string Serialize(IReadOnlyList<string> hashedCodes);
    IReadOnlyList<string> Deserialize(string hashedJson);
    bool Consume(string currentHashedJson, string plainCode, out string newHashedJson);
}
