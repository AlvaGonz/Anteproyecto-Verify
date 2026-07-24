using System;
using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Documents.Extractions
{
    public class CertificacionIPIRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractFieldsCorrectly_WhenLabelsArePresent()
        {
            // Arrange - Simulating typical IPI document OCR output
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "NO. DE CERTIFICACION" },
                new OcrLine { Text = "CERT-2024-001234" },
                new OcrLine { Text = "NO. INMUEBLE" },
                new OcrLine { Text = "INM-456789" },
                new OcrLine { Text = "PARCELA NO." },
                new OcrLine { Text = "3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.NumeroCertificacion.RawValue.Should().Be("CERT-2024-001234");
            extraction.NumeroCertificacion.Status.Should().Be(FieldStatus.Valid);
            
            extraction.NumeroInmueble.RawValue.Should().Be("INM-456789");
            extraction.NumeroInmueble.Status.Should().Be(FieldStatus.Valid);
            
            extraction.ParcelaNumero.RawValue.Should().Be("3094667545124-AD");
            extraction.ParcelaNumero.Status.Should().Be(FieldStatus.Valid);
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFields_WithProximityBlockFallback()
        {
            // Arrange - Testing the proximity block fallback (label on one line, value on next)
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "NO. DE CERTIFICACION" },
                new OcrLine { Text = "CERT-2024-001234" }, // Value on next line (proximity)
                new OcrLine { Text = "NO. INMUEBLE" },
                new OcrLine { Text = "INM-456789" }, // Value on next line
                new OcrLine { Text = "PARCELA NO." },
                new OcrLine { Text = "3094667545124-AD" } // Value on next line
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.NumeroCertificacion.RawValue.Should().Be("CERT-2024-001234");
            extraction.NumeroInmueble.RawValue.Should().Be("INM-456789");
            extraction.ParcelaNumero.RawValue.Should().Be("3094667545124-AD");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFields_WithInlineValues()
        {
            // Arrange - Value on same line after label
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "NO. DE CERTIFICACION: CERT-2024-001234" },
                new OcrLine { Text = "NO. INMUEBLE: INM-456789" },
                new OcrLine { Text = "PARCELA NO.: 3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.NumeroCertificacion.RawValue.Should().Be("CERT-2024-001234");
            extraction.NumeroInmueble.RawValue.Should().Be("INM-456789");
            extraction.ParcelaNumero.RawValue.Should().Be("3094667545124-AD");
        }

        [Fact]
        public void MapFromOcrResult_ShouldHandleAbbreviatedLabels()
        {
            // Arrange - Common abbreviated forms in OCR
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "CERT. NO." },
                new OcrLine { Text = "CERT-2024-001234" },
                new OcrLine { Text = "NO. INM." },
                new OcrLine { Text = "INM-456789" },
                new OcrLine { Text = "PARCELA NO." },
                new OcrLine { Text = "3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.NumeroCertificacion.RawValue.Should().Be("CERT-2024-001234");
            extraction.NumeroInmueble.RawValue.Should().Be("INM-456789");
            extraction.ParcelaNumero.RawValue.Should().Be("3094667545124-AD");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFromRawJson()
        {
            // Arrange - Testing the actual RawJson format from PaddleOCR
            var rawJson = "[[[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERTIFICACION IPI', 0.99)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. DE CERTIFICACION', 0.98)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERT-2024-001234', 0.97)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. INMUEBLE', 0.96)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('INM-456789', 0.95)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('PARCELA NO.', 0.94)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('3094667545124-AD', 0.93)]]";
            
            var ocrResult = new OcrResult
            {
                Success = true,
                Provider = "PaddleOcr",
                RawJson = rawJson,
                ExtractedText = "" // Intentionally empty to test fallback to RawJson
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.NumeroCertificacion.RawValue.Should().Be("CERT-2024-001234");
            extraction.NumeroInmueble.RawValue.Should().Be("INM-456789");
            extraction.ParcelaNumero.RawValue.Should().Be("3094667545124-AD");
        }

        [Fact]
        public void MapFromOcrResult_ShouldMarkMissing_WhenLabelsAreNotPresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "No useful info here" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Incomplete);
            
            extraction.NumeroCertificacion.Status.Should().Be(FieldStatus.Missing);
            extraction.NumeroInmueble.Status.Should().Be(FieldStatus.Missing);
            extraction.ParcelaNumero.Status.Should().Be(FieldStatus.Missing);
        }
    }
}