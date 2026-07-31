using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using Application.Abstractions.Security;

namespace Infrastructure.Security;

public class RecoveryCodeService : IRecoveryCodeService
{
    private const int CodeLen = 10;
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public RecoveryCodeSet Generate(int count = 10)
    {
        var plain = new List<string>(count);
        var hashed = new List<string>(count);
        for (var i = 0; i < count; i++)
        {
            var code = NewCode(CodeLen);
            plain.Add(code);
            hashed.Add(Hash(code));
        }
        return new RecoveryCodeSet(plain, Serialize(hashed));
    }

    public string Hash(string plainCode)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(plainCode);
        var salt = RandomNumberGenerator.GetBytes(16);
        var derived = BCrypt.Net.BCrypt.HashPassword(plainCode, workFactor: 11);
        return derived;
    }

    public bool Verify(string hashedCode, string plainCode) =>
        BCrypt.Net.BCrypt.Verify(plainCode, hashedCode);

    public string Serialize(IReadOnlyList<string> hashedCodes) =>
        JsonSerializer.Serialize(hashedCodes);

    public IReadOnlyList<string> Deserialize(string hashedJson) =>
        JsonSerializer.Deserialize<List<string>>(hashedJson) ?? new List<string>();

    public bool Consume(string currentHashedJson, string plainCode, out string newHashedJson)
    {
        var list = Deserialize(currentHashedJson).ToList();
        var idx = list.FindIndex(h => Verify(h, plainCode));
        if (idx < 0)
        {
            newHashedJson = currentHashedJson;
            return false;
        }
        list.RemoveAt(idx);
        newHashedJson = Serialize(list);
        return true;
    }

    private static string NewCode(int len)
    {
        var chars = new char[len];
        for (var i = 0; i < len; i++)
            chars[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
        return new string(chars);
    }
}
