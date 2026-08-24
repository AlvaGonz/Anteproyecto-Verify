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

        [Fact]
        public void MapFromOcrResult_ShouldExtractDGIIFormat_WhenOcrMergesLabelAndValue()
        {
            // ponytail: real OCR output from DGII certificate — label+value merged, ó→6
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION" },
                new OcrLine { Text = "No.deCertificaci6nC0121952878225" },
                new OcrLine { Text = "La Dirección General de Impuestos Internos CERTIFICA: que el inmueble no.136400513193" },
                new OcrLine { Text = "ubicado en la AVENIDA REPUBLICA DE COLOMBIA" },
                new OcrLine { Text = "identificado como Parcela No.309466754512:4-A" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            extraction.Should().NotBeNull();
            extraction!.NumeroCertificacion.Status.Should().Be(FieldStatus.Valid);
            extraction.NumeroCertificacion.RawValue.Should().Be("C0121952878225");
            extraction.ParcelaNumero.RawValue.Should().Be("309466754512:4-A");
        }

        [Fact]
        public void ParcelaNumero_Normalized_PreservesColonAndHyphen()
        {
            var lines = new List<OcrLine> { new OcrLine { Text = "PARCELA NO.: 150106256710:4-A" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "PARCELA NO.: 150106256710:4-A" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.ParcelaNumero.NormalizedValue.Should().Be("150106256710:4-A");
        }

        [Fact]
        public void NumeroInmueble_Normalized_IsPurelyNumeric()
        {
            var lines = new List<OcrLine> { new OcrLine { Text = "NO. INMUEBLE: 458901236754" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "NO. INMUEBLE: 458901236754" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.NumeroInmueble.NormalizedValue.Should().Be("458901236754");
        }

        [Fact]
        public void NumeroCertificacion_Normalized_PreservesAlphanumerics()
        {
            var lines = new List<OcrLine> { new OcrLine { Text = "NO. DE CERTIFICACION: C0348921465789" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "NO. DE CERTIFICACION: C0348921465789" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.NumeroCertificacion.NormalizedValue.Should().Be("C0348921465789");
        }
        [Fact]
        public void ParcelaNumero_TruncatesNoiseAfterValidFormat()
        {
            // ponytail: OCR merges Parcela label → value → noise into one blob
            // e.g. "89754213098:5-BDCNOSDCAPTOUNIDAD" should become "89754213098:5-B"
            var lines = new List<OcrLine> { new OcrLine { Text = "PARCELA NO.: 89754213098:5-BDCNOSDCAPTOUNIDAD" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "PARCELA NO.: 89754213098:5-BDCNOSDCAPTOUNIDAD" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.ParcelaNumero.NormalizedValue.Should().Be("89754213098:5-B");
        }

        [Fact]
        public void ParcelaNumero_RepairsOcrLostColon()
        {
            // ponytail: OCR loses colon character, merging sub-parcel digit into the main number
            // e.g. "876543210983-B" should be repaired to "87654321098:3-B"
            var lines = new List<OcrLine> { new OcrLine { Text = "PARCELA NO.: 876543210983-B" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "PARCELA NO.: 876543210983-B" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.ParcelaNumero.NormalizedValue.Should().Be("87654321098:3-B");
        }

        [Fact]
        public void ParcelaNumero_RepairsOcrLostColon_WithSingleDigitSubParcel()
        {
            // ponytail: OCR loses colon — sub-parcel in DGII format is always 1 digit
            var lines = new List<OcrLine> { new OcrLine { Text = "PARCELA NO.: 1234567890145-C" } };
            var ocrResult = new OcrResult { Success = true, Lines = lines, ExtractedText = "PARCELA NO.: 1234567890145-C" };
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            extraction!.ParcelaNumero.NormalizedValue.Should().Be("123456789014:5-C");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractAll3Fields_FromCertificacionIPI0001Fixture()
        {
            // Arrange - Real OCR lines from Certificacion IPI_0001.pdf
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Reptblica Oomintcani" },
                new OcrLine { Text = "MINISTERIO DE HACIENDA" },
                new OcrLine { Text = "DIRECCION GENERAL DE IVIPUESTOS INTERNOS" },
                new OcrLine { Text = "RNC: 4-01-50625-4" },
                new OcrLine { Text = "CERTIFICACION" },
                new OcrLine { Text = "No. de Certificaci6n: 338738592876" },
                new OcrLine { Text = "La DIrecclón General de Impuestos Internos CERTIFICA: que el Inmuebie no. 070223482149:0021," },
                new OcrLine { Text = "ubicado en la AVENIDA REPUBLICA DE COLOMBIA, No. SN , 5ector de CARMEN MARIA" },
                new OcrLine { Text = "RESIDENCIAL, identificado camo Parcela No. 070223482149, D.C. No. $DC. Apto/Unidad" },
                new OcrLine { Text = "4-A, selar 8B, Manzana sM. sANTO DOMINGo De GUzMAN  DIstRItO NACIonAL : con un" },
                new OcrLine { Text = "area de mejora de 3g.20 Mtc2, amparado en el Certlficado de Titulo-Matricula No." },
                new OcrLine { Text = "IP1" },
                new OcrLine { Text = "Dicho inmuable fue valorado en la suma de RD$2,50o,00o.00 para fines fiscoles." },
                new OcrLine { Text = "Dada an 1a OFICINA VIRTUAL, a Ios seis (6} dias del mes de agosto del ano dos mil" },
                new OcrLine { Text = "velntluno (2021)." },
                new OcrLine { Text = "Esta certificación no constituva un juixie, de valor. sabre la veraridad de las declaraciones presentadas por a" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);

            extraction.NumeroCertificacion.Status.Should().Be(FieldStatus.Valid);
            extraction.NumeroCertificacion.NormalizedValue.Should().Be("338738592876");

            extraction.NumeroInmueble.Status.Should().Be(FieldStatus.Valid);
            extraction.NumeroInmueble.NormalizedValue.Should().Be("070223482149:0021");

            extraction.ParcelaNumero.Status.Should().Be(FieldStatus.Valid);
            extraction.ParcelaNumero.NormalizedValue.Should().Be("070223482149");
        }
    }
}