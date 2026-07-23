using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Documents.Extractions
{
    public class PlanoMensuraCatastralRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractFieldsCorrectly_WhenLabelsArePresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "DIRECCION REGIONAL DE MENSURAS CATASTRALES" },
                new OcrLine { Text = "DEPARTAMENTO ESTE" },
                new OcrLine { Text = "PLANO INDIVIDUAL" },
                new OcrLine { Text = "OPERACION SUBDIVISION" },
                new OcrLine { Text = "DESIGNACION CATASTRAL POSICIONAL: 42018023893_1_1" },
                new OcrLine { Text = "CATASTRAL DE ORIGEN TEMPORAL: 42018023893_11_1" },
                new OcrLine { Text = "PROVINCIA LA ALTAGRACIA" },
                new OcrLine { Text = "MUNICIPIO HIGUEY" },
                new OcrLine { Text = "SECCION BAIGUA" },
                new OcrLine { Text = "LUGAR JUANILLO" },
                new OcrLine { Text = "SUPERFICIE A REGISTRAR PARCELA 12,130.07m2" },
                new OcrLine { Text = "ESCALA 1:400" },
                new OcrLine { Text = "HOJA 1 DE 1" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.Departamento.RawValue.Should().Be("ESTE");
            extraction.Operacion.NormalizedValue.Should().Be("SUBDIVISION");
            extraction.DesignacionCatastralPosicional.RawValue.Should().Be("42018023893_1_1");
            extraction.DesignacionCatastralOrigen.RawValue.Should().Be("42018023893_11_1");
            extraction.Provincia.RawValue.Should().Be("LA ALTAGRACIA");
            extraction.Municipio.RawValue.Should().Be("HIGUEY");
            extraction.Seccion.RawValue.Should().Be("BAIGUA");
            extraction.Lugar.RawValue.Should().Be("JUANILLO");
            extraction.SuperficieARegistrarParcelaM2.NormalizedValue.Should().Be("12130.07");
            extraction.Escala.NormalizedValue.Should().Be("1:400");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFields_WithMessyOcr_AndProximity()
        {
            // Arrange - testing the proximity block fallback logic
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "PROVINCIA" },
                new OcrLine { Text = "LA ALTAGRACIA" }, // Spatial fallback
                new OcrLine { Text = "IUNICIPIO" }, // Typo header
                new OcrLine { Text = "HIGUEY" },
                new OcrLine { Text = "DESIGNACION TEMPORA" },
                new OcrLine { Text = "42018023893_1_1" },
                new OcrLine { Text = "FICIEAREGISTRAR PARCELA 12,130.07m" },
                new OcrLine { Text = "DEPARTAMENTOESTE" }, // Merged typo
                new OcrLine { Text = "OPEACIONSUBDIVISIN" } // Merged typo
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.DesignacionCatastralPosicional.RawValue.Should().Contain("42018023893_1_1");
            extraction.SuperficieARegistrarParcelaM2.NormalizedValue.Should().Be("12130.07");
            extraction.Provincia.RawValue.Should().Be("LA ALTAGRACIA");
            extraction.Municipio.RawValue.Should().Be("HIGUEY");
            extraction.Departamento.RawValue.Should().Be("ESTE");
            extraction.Operacion.NormalizedValue.Should().Be("SUBDIVISION");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFields_FromRawJson()
        {
            // Arrange - testing the actual RawJson format output from PaddleOCR
            var rawJson = "[[[[947.0, 350.0], [1156.0, 350.0], [1156.0, 360.0], [947.0, 360.0]], ('DIRECCION REGIONAL DE MENSURAS CATASTRALES', 0.97)], [[[987.0, 361.0], [1061.0, 361.0], [1061.0, 370.0], [987.0, 370.0]], ('DEPARTAMENTO', 0.99)], [[[1058.0, 360.0], [1086.0, 360.0], [1086.0, 369.0], [1058.0, 369.0]], ('ESTE', 0.98)], [[[997.0, 376.0], [1084.0, 376.0], [1084.0, 389.0], [997.0, 389.0]], ('PLANO INDIVIDUAL', 0.99)], [[[895.0, 395.0], [1002.0, 395.0], [1002.0, 408.0], [895.0, 408.0]], ('OPERACIOSUBDISION', 0.71)], [[[955.0, 412.0], [1131.0, 412.0], [1131.0, 425.0], [955.0, 425.0]], ('DESIGNACION CATASTRAL POSICIONAL:', 0.98)], [[[987.0, 478.0], [1070.0, 478.0], [1070.0, 491.0], [987.0, 491.0]], ('42022121591_11_1', 0.99)], [[[898.0, 555.0], [917.0, 555.0], [917.0, 565.0], [898.0, 565.0]], ('SECCI', 0.88)], [[[939.0, 552.0], [990.0, 554.0], [989.0, 567.0], [938.0, 565.0]], ('JINASARAGU', 0.87)], [[[1014.0, 642.0], [1064.0, 645.0], [1063.0, 659.0], [1013.0, 656.0]], ('927.30 m2', 0.99)], [[[1094.0, 637.0], [1149.0, 637.0], [1149.0, 646.0], [1094.0, 646.0]], ('ESCALA11: 40', 0.95)]]";
            
            var ocrResult = new OcrResult
            {
                Success = true,
                RawJson = rawJson,
                ExtractedText = "" // Intentionally empty to test fallback to RawJson
            };

            // Act
            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.Departamento.RawValue.Should().Be("ESTE");
            extraction.Operacion.NormalizedValue.Should().Be("SUBDIVISION");
            extraction.DesignacionCatastralPosicional.RawValue.Should().Be("42022121591_11_1");
            extraction.Seccion.RawValue.Should().Be("JINASARAGU");
            extraction.SuperficieARegistrarParcelaM2.NormalizedValue.Should().Be("927.30");
            extraction.Escala.NormalizedValue.Should().Be("1:40");
        }

        [Fact]
        public void MapFromOcrResult_ShouldMarkMissing_WhenLabelsAreNotPresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "PLANO DE MENSURA" },
                new OcrLine { Text = "No useful info here" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Incomplete);
            
            extraction.DesignacionCatastralPosicional.Status.Should().Be(FieldStatus.Missing);
            extraction.Provincia.Status.Should().Be(FieldStatus.Missing);
            extraction.Municipio.Status.Should().Be(FieldStatus.Missing);
            extraction.SuperficieARegistrarParcelaM2.Status.Should().Be(FieldStatus.Missing);
        }
        [Fact]
        public void MapFromOcrResult_ShouldExtractConcatenatedFields_WhenOnSameLine()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "SUPERFICIE PARCELA: 156,222.44 m² PROVINCIA: LA VEGA 1 No. de Lámina ESCALA: 1:2,500" },
                new OcrLine { Text = "MUNICIPIO: CONCEPCIÓN DE LA VEGA" },
                new OcrLine { Text = "SECCIÓN: LUGAR: TERRERO" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join("\n", lines.Select(l => l.Text))
            };

            // Act
            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.Provincia.NormalizedValue.Should().Be("LA VEGA");
            extraction.Escala.NormalizedValue.Should().Be("1:2500");
            extraction.SuperficieARegistrarParcelaM2.NormalizedValue.Should().Be("156222.44");
            extraction.Municipio.NormalizedValue.Should().Be("CONCEPCIÓN DE LA VEGA");
            extraction.Seccion.NormalizedValue.Should().Be(string.Empty);
            extraction.Lugar.NormalizedValue.Should().Be("TERRERO");
        }
    }
}
