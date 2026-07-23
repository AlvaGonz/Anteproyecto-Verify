using System;
using System.Collections.Generic;
using System.Linq;
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
                new OcrLine { Text = "Registro de Títulos de Santo Domingo" },
                new OcrLine { Text = "MATRÍCULA 0100234567" },
                new OcrLine { Text = "DESIGNACIÓN CATASTRAL 12345-67" },
                new OcrLine { Text = "FECHA Y HORA DE INSCRIPCION 15/01/2023" },
                new OcrLine { Text = "viene de 54321" },
                new OcrLine { Text = "MUNICIPIO San Pedro de Macoris" },
                new OcrLine { Text = "PROVINCIA Santo Domingo OFICINA" },
                new OcrLine { Text = "12,130.07 m2" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.Oficina.RawValue.Should().Be("Registro de Títulos de Santo Domingo");
            extraction.Matricula.RawValue.Should().Be("0100234567");
            extraction.DesignacionCatastral.RawValue.Should().Be("12345-67");
            extraction.FechaYHoraInscripcion.RawValue.Should().Be("FECHA Y HORA DE INSCRIPCION 15/01/2023");
            extraction.VieneDe.RawValue.Should().Be("54321");
            extraction.Municipio.RawValue.Should().Be("San Pedro de Macoris");
            extraction.Provincia.RawValue.Should().Be("Santo Domingo");
            extraction.SuperficieM2.RawValue.Should().Be("12,130.07");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractSuperficie_WhenLabelPrecedesValue()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "Registro de Títulos de Santo Domingo" },
                new OcrLine { Text = "MATRICULA No. 3000123456" },
                new OcrLine { Text = "DESIGNACIÓN CATASTRAL 12345-67" },
                new OcrLine { Text = "FECHA Y HORA DE INSCRIPCION 15/01/2023" },
                new OcrLine { Text = "viene de 54321" },
                new OcrLine { Text = "MUNICIPIO BocaChica" },
                new OcrLine { Text = "PROVINCIA Santo Domingo OFICINA" },
                new OcrLine { Text = "SUPERFICIE EN METROS CUADRADOS 12,130.0700" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            extraction.Matricula.RawValue.Should().Be("3000123456");
            extraction.SuperficieM2.RawValue.Should().Be("12,130.0700");
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
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
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
            extraction.Matricula.Status.Should().Be(FieldStatus.Missing);
        }
    }
}
