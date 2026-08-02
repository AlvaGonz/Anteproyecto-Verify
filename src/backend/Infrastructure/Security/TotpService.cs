using System;
using System.Buffers.Binary;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Application.Abstractions.Security;

namespace Infrastructure.Security;

public class TotpService : ITotpService
{
    private const int SecretBytes = 20;
    private const int StepSeconds = 30;
    private const int CodeDigits = 6;

    public string GenerateSecret() => Base32.Encode(RandomNumberGenerator.GetBytes(SecretBytes));

    public string BuildOtpAuthUri(string email, string secret, string issuer)
    {
        var label = Uri.EscapeDataString(email);
        var issuerEscaped = Uri.EscapeDataString(issuer);
        return $"otpauth://totp/{label}?secret={Uri.EscapeDataString(secret)}&issuer={issuerEscaped}&algorithm=SHA1&digits=6&period=30";
    }

    public int ComputeCode(string base32Secret, DateTime utcNow)
    {
        var key = Base32.Decode(base32Secret);
        var counter = (long)(utcNow - DateTime.UnixEpoch).TotalSeconds / StepSeconds;
        Span<byte> counterBytes = stackalloc byte[8];
        BinaryPrimitives.WriteInt64BigEndian(counterBytes, counter);

        using var hmac = new HMACSHA1(key);
        var hash = hmac.ComputeHash(counterBytes.ToArray());
        var offset = hash[hash.Length - 1] & 0x0F;
        var binary = ((hash[offset] & 0x7F) << 24)
                   | ((hash[offset + 1] & 0xFF) << 16)
                   | ((hash[offset + 2] & 0xFF) << 8)
                   | (hash[offset + 3] & 0xFF);
        return binary % (int)Math.Pow(10, CodeDigits);
    }

    public bool ValidateCode(string base32Secret, int submittedCode, int windowSteps = 1)
    {
        var now = DateTime.UtcNow;
        for (var step = -windowSteps; step <= windowSteps; step++)
        {
            var candidate = ComputeCode(base32Secret, now.AddSeconds(step * StepSeconds));
            if (candidate == submittedCode) return true;
        }
        return false;
    }

    private static class Base32
    {
        private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static string Encode(byte[] data)
        {
            if (data.Length == 0) return string.Empty;
            var sb = new StringBuilder((data.Length * 8 + 4) / 5);
            int buffer = 0, bitsLeft = 0, index = 0;
            while (index < data.Length)
            {
                buffer <<= 8;
                buffer |= data[index++];
                bitsLeft += 8;
                while (bitsLeft >= 5)
                {
                    bitsLeft -= 5;
                    sb.Append(Alphabet[(buffer >> bitsLeft) & 0x1F]);
                }
            }
            if (bitsLeft > 0)
            {
                sb.Append(Alphabet[(buffer << (5 - bitsLeft)) & 0x1F]);
            }
            return sb.ToString();
        }

        public static byte[] Decode(string s)
        {
            s = s.Trim().Replace(" ", "").ToUpperInvariant();
            if (string.IsNullOrEmpty(s)) return Array.Empty<byte>();
            var bytes = new List<byte>(s.Length * 5 / 8);
            int buffer = 0, bitsLeft = 0;
            foreach (var c in s)
            {
                int idx = Alphabet.IndexOf(c);
                if (idx < 0) throw new FormatException($"Invalid Base32 char: {c}");
                buffer <<= 5;
                buffer |= idx;
                bitsLeft += 5;
                if (bitsLeft >= 8)
                {
                    bitsLeft -= 8;
                    bytes.Add((byte)((buffer >> bitsLeft) & 0xFF));
                }
            }
            return bytes.ToArray();
        }
    }
}
