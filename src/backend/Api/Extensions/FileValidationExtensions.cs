namespace Api.Extensions;

using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;

public static class FileValidationExtensions
{
    private static readonly byte[] PdfMagicNumber = { 0x25, 0x50, 0x44, 0x46 };
    private const long MaxFileSize = 10 * 1024 * 1024;
    private const string RequiredExtension = ".pdf";
    private const string RequiredMimeType = "application/pdf";

    public static (bool IsValid, string? ErrorMessage) IsValidPdf(this IFormFile file)
    {
        if (file == null || file.Length == 0)
            return (false, "El archivo está vacío o no fue proporcionado.");

        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (extension != RequiredExtension)
            return (false, $"Extensión no permitida. Solo se aceptan archivos {RequiredExtension}.");

        if (!string.Equals(file.ContentType, RequiredMimeType, StringComparison.OrdinalIgnoreCase))
            return (false, $"El tipo MIME del archivo no corresponde a un PDF válido ({RequiredMimeType}).");

        if (file.Length > MaxFileSize)
            return (false, $"El archivo excede el tamaño máximo permitido (10MB).");

        using var stream = file.OpenReadStream();
        var headerBytes = new byte[PdfMagicNumber.Length];
        var bytesRead = stream.Read(headerBytes, 0, PdfMagicNumber.Length);

        if (bytesRead < PdfMagicNumber.Length)
            return (false, "El archivo no contiene suficientes datos para validar su firma.");

        if (!headerBytes.SequenceEqual(PdfMagicNumber))
            return (false, "El archivo proporcionado no es un PDF válido. Su firma digital (magic number) no corresponde a un PDF auténtico.");

        return (true, null);
    }
}
