using System;
using System.Collections.Generic;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Documents.Extractions
{
    public class CertificadoTituloRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractFieldsCorrectly_WhenLabelsArePresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "Oficina:" },
                new OcrLine { Text = "Santo Domingo" },
                new OcrLine { Text = "Designación Catastral:" },
                new OcrLine { Text = "DC-12345" },
                new OcrLine { Text = "Fecha y Hora de Inscripción: 2023-01-15 14:30:00" },
                new OcrLine { Text = "Viene de: 54321" },
                new OcrLine { Text = "Municipio: Boca Chica" },
                new OcrLine { Text = "Provincia: Santo Domingo" },
                new OcrLine { Text = "Superficie:" },
                new OcrLine { Text = "250.50 m2" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.Oficina.RawValue.Should().Be("Santo Domingo");
            extraction.DesignacionCatastral.RawValue.Should().Be("DC-12345");
            extraction.FechaYHoraInscripcion.RawValue.Should().Be("2023-01-15 14:30:00");
            extraction.VieneDe.RawValue.Should().Be("54321");
            extraction.Municipio.RawValue.Should().Be("Boca Chica");
            extraction.Provincia.RawValue.Should().Be("Santo Domingo");
            extraction.SuperficieM2.RawValue.Should().Be("250.50 m2");
        }

        [Fact]
        public void MapFromOcrResult_ShouldMarkMissing_WhenLabelsAreNotPresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "No useful info here" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Incomplete);
            
            extraction.Oficina.Status.Should().Be(FieldStatus.Missing);
            extraction.DesignacionCatastral.Status.Should().Be(FieldStatus.Missing);
            extraction.FechaYHoraInscripcion.Status.Should().Be(FieldStatus.Missing);
            extraction.VieneDe.Status.Should().Be(FieldStatus.Missing);
            extraction.Municipio.Status.Should().Be(FieldStatus.Missing);
            extraction.Provincia.Status.Should().Be(FieldStatus.Missing);
            extraction.SuperficieM2.Status.Should().Be(FieldStatus.Missing);
        }
    }
}
