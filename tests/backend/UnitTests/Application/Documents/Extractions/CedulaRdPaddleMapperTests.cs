using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Documents.Extractions
{
    public class CedulaRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractAll5Fields_FromCedula0001Fixture()
        {
            // Arrange - Real OCR raw lines from Cedula nueva_0001.pdf
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "REPOBLICA" },
                new OcrLine { Text = "Junta Central Electoral" },
                new OcrLine { Text = "CEDULA BE IGENTIDAD" },
                new OcrLine { Text = "DOMINICANA" },
                new OcrLine { Text = "Y ELECTORA." },
                new OcrLine { Text = "Número de cédula" },
                new OcrLine { Text = "00010032696" },
                new OcrLine { Text = "Nombre" },
                new OcrLine { Text = "MARIA" },
                new OcrLine { Text = "MIGUEL" },
                new OcrLine { Text = "BA/ SPECIMEX" },
                new OcrLine { Text = "Apeltida" },
                new OcrLine { Text = "CRUZ GQMEZ" },
                new OcrLine { Text = "lacjonalidad" },
                new OcrLine { Text = "Estado civil" },
                new OcrLine { Text = "OMINICANA" },
                new OcrLine { Text = "SOLTERY" },
                new OcrLine { Text = "Fecha de nacimient " },
                new OcrLine { Text = "04 JUNtO 1962" },
                new OcrLine { Text = "ugar de nacirmiento" },
                new OcrLine { Text = "SANTO DOMINGO" },
                new OcrLine { Text = "1406/62" },
                new OcrLine { Text = "Ocupación u ofici" },
                new OcrLine { Text = "Vigrencia Masta 03.05:2025" },
                new OcrLine { Text = "INGENIERO INDUSTRIAL" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var result = CedulaExtractionMapper.MapFromOcrResult(ocrResult);

            // Assert
            result.Should().NotBeNull();
            result!.CedulaNumber.Status.Should().Be(FieldStatus.Valid);
            result.CedulaNumber.NormalizedValue.Should().Be("00010032696");

            result.FirstNames.Status.Should().Be(FieldStatus.Valid);
            result.FirstNames.NormalizedValue.Should().Be("MARIA MIGUEL");

            result.LastNames.Status.Should().Be(FieldStatus.Valid);
            result.LastNames.NormalizedValue.Should().Be("CRUZ GOMEZ");

            result.BirthDate.Status.Should().Be(FieldStatus.Valid);
            result.BirthDate.NormalizedValue.Should().Be("04-06-1962");

            result.ExpiryDate.Status.Should().Be(FieldStatus.Valid);
            result.ExpiryDate.NormalizedValue.Should().Be("03-05-2025");

            result.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
        }

        [Fact]
        public void MapFromOcrResult_ShouldFilterSpecimenWatermark_Pecimex()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Número de cédula" },
                new OcrLine { Text = "00010032696" },
                new OcrLine { Text = "Nombre" },
                new OcrLine { Text = "MARIA PECIMEX" },
                new OcrLine { Text = "Apellido" },
                new OcrLine { Text = "CRUZ GOMEZ SPECIMEN" },
                new OcrLine { Text = "Fecha de nacimiento" },
                new OcrLine { Text = "02 SEPTIEMBRE 1962" },
                new OcrLine { Text = "Vigencia hasta 09-04-2036" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var result = CedulaExtractionMapper.MapFromOcrResult(ocrResult);

            // Assert
            result.Should().NotBeNull();
            result!.FirstNames.NormalizedValue.Should().Be("MARIA");
            result.LastNames.NormalizedValue.Should().Be("CRUZ GOMEZ");
            result.BirthDate.NormalizedValue.Should().Be("02-09-1962");
            result.ExpiryDate.NormalizedValue.Should().Be("09-04-2036");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtract_FromAdrianCedula()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Número de cédula" },
                new OcrLine { Text = "91" },
                new OcrLine { Text = "402-2860001-7" },
                new OcrLine { Text = "Nombre" },
                new OcrLine { Text = "ADRIAN ALEXANDER" },
                new OcrLine { Text = "3" },
                new OcrLine { Text = "Apellido" },
                new OcrLine { Text = "ALVAREZ" },
                new OcrLine { Text = "GONZALEZ" },
                new OcrLine { Text = "Fecha de nacimiento" },
                new OcrLine { Text = "11 ENERO 2002" },
                new OcrLine { Text = "ta 11-01-2039" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var result = CedulaExtractionMapper.MapFromOcrResult(ocrResult);

            // Assert
            result.Should().NotBeNull();
            result!.CedulaNumber.NormalizedValue.Should().Be("402-2860001-7");
            result.FirstNames.NormalizedValue.Should().Be("ADRIAN ALEXANDER");
            result.LastNames.NormalizedValue.Should().Be("ALVAREZ GONZALEZ");
            result.BirthDate.NormalizedValue.Should().Be("11-01-2002");
            result.ExpiryDate.NormalizedValue.Should().Be("11-01-2039");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtract_FromSanchezCedula()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Número de cédula" },
                new OcrLine { Text = "5" },
                new OcrLine { Text = "000-1006717-1" },
                new OcrLine { Text = "3" },
                new OcrLine { Text = "Nombres" },
                new OcrLine { Text = ":" },
                new OcrLine { Text = "CARMEN" },
                new OcrLine { Text = "JOSE" },
                new OcrLine { Text = "Apelido" },
                new OcrLine { Text = "SANCHEZ" },
                new OcrLine { Text = "ESTELAR" },
                new OcrLine { Text = "08 NOVIEMBRE 2001" },
                new OcrLine { Text = "thasta 14-12-2037" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var result = CedulaExtractionMapper.MapFromOcrResult(ocrResult);

            // Assert
            result.Should().NotBeNull();
            result!.CedulaNumber.NormalizedValue.Should().Be("000-1006717-1");
            result.FirstNames.NormalizedValue.Should().Be("CARMEN JOSE");
            result.LastNames.NormalizedValue.Should().Be("SANCHEZ ESTELAR");
            result.BirthDate.NormalizedValue.Should().Be("08-11-2001");
            result.ExpiryDate.NormalizedValue.Should().Be("14-12-2037");
        }
    }
}
