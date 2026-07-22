namespace Application.Common.Security;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public static class FileSignatureValidator
{
    private static readonly Dictionary<string, List<byte[]>> _fileSignatures = new()
    {
        { ".pdf", new List<byte[]> { new byte[] { 0x25, 0x50, 0x44, 0x46 } } },
        { ".png", new List<byte[]> { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
        { ".jpg", new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
            }
        },
        { ".jpeg", new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
            }
        },
        { ".webp", new List<byte[]> { new byte[] { 0x52, 0x49, 0x46, 0x46 } } }
    };

    public static bool IsValidFileSignature(string fileName, Stream fileStream)
    {
        if (string.IsNullOrEmpty(fileName) || fileStream == null || fileStream.Length == 0)
        {
            return false;
        }

        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        if (!_fileSignatures.TryGetValue(ext, out var signatures))
        {
            return false; // Extension not supported for strict validation
        }

        using var reader = new BinaryReader(fileStream, System.Text.Encoding.UTF8, true);
        var headerBytes = reader.ReadBytes(signatures.Max(m => m.Length));
        
        // Reset stream position so it can be read again later
        fileStream.Position = 0;

        return signatures.Any(signature => 
            headerBytes.Take(signature.Length).SequenceEqual(signature));
    }
}
