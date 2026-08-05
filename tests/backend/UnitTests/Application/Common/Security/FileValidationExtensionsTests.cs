using System;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using Api.Extensions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Common.Security
{
    public class FileValidationExtensionsTests
    {
        private static IFormFile CreateFormFile(string fileName, string contentType, byte[] content)
        {
            var stream = new MemoryStream(content);
            return new FormFile(stream, 0, content.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = contentType
            };
        }

        private static byte[] CreateFakePdfBytes(string textContent)
        {
            return Encoding.UTF8.GetBytes(textContent);
        }

        private static byte[] CreateGenuinePdfBytes()
        {
            var ms = new MemoryStream();
            ms.Write(new byte[] { 0x25, 0x50, 0x44, 0x46 }); // %PDF
            ms.Write(Encoding.ASCII.GetBytes("-1.4\n%\xe2\xe3\xcf\xd3\n"));
            ms.Write(Encoding.ASCII.GetBytes("1 0 obj\n<< /Type /Catalog >>\nendobj\n"));
            ms.Write(Encoding.ASCII.GetBytes("xref\n0 1\n0000000000 65535 f \n"));
            ms.Write(Encoding.ASCII.GetBytes("trailer\n<< /Size 1 >>\nstartxref\n9\n%%EOF"));
            return ms.ToArray();
        }

        [Fact]
        public void IsValidPdf_AcceptsGenuinePdf()
        {
            var bytes = CreateGenuinePdfBytes();
            var file = CreateFormFile("documento.pdf", "application/pdf", bytes);

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeTrue(errorMessage ?? "");
            errorMessage.Should().BeNull();
        }

        [Fact]
        public void IsValidPdf_RejectsFakePdf_WhenContentIsPlainText()
        {
            var bytes = CreateFakePdfBytes("esto no es un PDF real");
            var file = CreateFormFile("documento.pdf", "application/pdf", bytes);

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeFalse();
            errorMessage.Should().Contain("PDF");
        }

        [Fact]
        public void IsValidPdf_RejectsFile_WhenExceeds10MB()
        {
            var bytes = CreateGenuinePdfBytes();
            var bigBytes = new byte[11 * 1024 * 1024];
            Array.Copy(bytes, bigBytes, bytes.Length);
            var file = CreateFormFile("grande.pdf", "application/pdf", bigBytes);

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeFalse();
            errorMessage.Should().Contain("10MB");
        }

        [Fact]
        public void IsValidPdf_RejectsFile_WhenWrongExtension()
        {
            var bytes = CreateGenuinePdfBytes();
            var file = CreateFormFile("documento.exe", "application/pdf", bytes);

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeFalse();
            errorMessage.Should().NotBeNull();
            errorMessage!.ToLowerInvariant().Should().Contain("pdf");
        }

        [Fact]
        public void IsValidPdf_RejectsFile_WhenWrongMimeType()
        {
            var bytes = CreateGenuinePdfBytes();
            var file = CreateFormFile("documento.pdf", "text/plain", bytes);

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeFalse();
            errorMessage.Should().NotBeNull();
            errorMessage!.ToLowerInvariant().Should().Contain("pdf");
        }

        [Fact]
        public void IsValidPdf_RejectsFile_WhenSizeIsZero()
        {
            var file = CreateFormFile("vacio.pdf", "application/pdf", Array.Empty<byte>());

            var (isValid, errorMessage) = file.IsValidPdf();

            isValid.Should().BeFalse();
        }

        [Fact]
        public void IsValidPdf_ResetsStreamPosition_AfterReadingHeader()
        {
            var bytes = CreateGenuinePdfBytes();
            var file = CreateFormFile("doc.pdf", "application/pdf", bytes);

            var (isValid, _) = file.IsValidPdf();

            isValid.Should().BeTrue();
            using var stream = file.OpenReadStream();
            stream.Position.Should().Be(0);
        }
    }
}
