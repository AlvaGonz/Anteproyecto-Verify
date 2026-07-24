using System;
using System.Collections.Generic;
using System.Text.Json;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Domain.Enums;
using FluentAssertions;
using Xunit;

namespace UnitTests.Application.Documents.Extractions
{
    public class EstadoJuridicoRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractAllFields_WhenRealOcrIsProvided()
        {
            // Arrange
            var rawJson = "[[[[[650.0, 147.0], [738.0, 147.0], [738.0, 165.0], [650.0, 165.0]], ('MATRiCULA', 0.987751841545105)], [[[788.0, 172.0], [896.0, 172.0], [896.0, 190.0], [788.0, 190.0]], ('3000362328', 0.9985803365707397)], [[[649.0, 243.0], [886.0, 244.0], [886.0, 266.0], [649.0, 264.0]], ('FECHA Y HORA DE INSCRIPCIN', 0.97348952293396)], [[[762.0, 264.0], [920.0, 264.0], [920.0, 285.0], [762.0, 285.0]], ('Oct 1 2024 3:32PM', 0.9930131435394287)], [[[236.0, 300.0], [534.0, 300.0], [534.0, 323.0], [236.0, 323.0]], ('REGISTRO DE TITULOS', 0.9736431241035461)], [[[648.0, 308.0], [724.0, 312.0], [723.0, 335.0], [646.0, 331.0]], ('VIENE DE', 0.9731698036193848)], [[[186.0, 350.0], [575.0, 351.0], [575.0, 380.0], [186.0, 378.0]], ('JURISDICCION INMOBILIARIA', 0.9779608845710754)], [[[646.0, 368.0], [737.0, 372.0], [736.0, 395.0], [645.0, 391.0]], ('MUNICIPIO', 0.9943200349807739)], [[[186.0, 384.0], [582.0, 384.0], [582.0, 406.0], [186.0, 406.0]], ('PODER JUDICIAL : REPUBLICA DOMINICANA', 0.9670397639274597)], [[[810.0, 393.0], [875.0, 393.0], [875.0, 411.0], [810.0, 411.0]], ('HIGUEY', 0.9990212321281433)], [[[649.0, 424.0], [735.0, 424.0], [735.0, 442.0], [649.0, 442.0]], ('PROVINCIA', 0.9992256164550781)], [[[778.0, 446.0], [906.0, 446.0], [906.0, 465.0], [778.0, 465.0]], ('LA ALTAGRACIA', 0.9995031356811523)], [[[142.0, 473.0], [212.0, 477.0], [210.0, 500.0], [141.0, 496.0]], ('OFICINA', 0.9923158884048462)], [[[650.0, 479.0], [923.0, 479.0], [923.0, 500.0], [650.0, 500.0]], ('SUPERFICIE EN METROS CUADRADOS', 0.999100923538208)], [[[143.0, 500.0], [427.0, 502.0], [427.0, 525.0], [143.0, 523.0]], ('Registro de Titulos de Higey', 0.9928296208381653)], [[[798.0, 500.0], [888.0, 500.0], [888.0, 518.0], [798.0, 518.0]], ('12130.0700', 0.9998396635055542)], [[[140.0, 541.0], [343.0, 543.0], [342.0, 566.0], [140.0, 564.0]], ('DESIGNACION CATASTRAL', 0.9629235863685608)], [[[160.0, 568.0], [303.0, 568.0], [303.0, 589.0], [160.0, 589.0]], ('505483687149', 0.970548152923584)], [[[145.0, 610.0], [534.0, 610.0], [534.0, 627.0], [145.0, 627.0]], ('CERTIFICACIN DEL ESTADO JURiDICO DEL INMUEBLE', 0.9330494999885559)], [[[143.0, 886.0], [1006.0, 889.0], [1006.0, 911.0], [143.0, 907.0]], ('El inmueble se encuentra libre de derechos reales accesorios, cargas, gravmenes, anotaciones y/o medidas provisionales.', 0.9860182404518127)]]]";

            var ocrResult = new OcrResult
            {
                Success = true,
                Provider = "PaddleOcr",
                RawJson = rawJson
            };

            // Act
            var extraction = EstadoJuridicoRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.DocumentType.Should().Be("EstadoJuridico");
            
            extraction.Matricula.RawValue.Should().Be("3000362328");
            extraction.Matricula.Status.Should().Be(FieldStatus.Valid);

            extraction.FechaHoraInscripcion.RawValue.Should().Be("Oct 1 2024 3:32PM");
            extraction.FechaHoraInscripcion.NormalizedValue.Should().Be("2024-10-01T15:32:00");
            extraction.FechaHoraInscripcion.Status.Should().Be(FieldStatus.Valid);

            extraction.Oficina.RawValue.Should().Contain("Registro de Titulos de Hig");
            extraction.Oficina.Status.Should().Be(FieldStatus.Valid);

            extraction.Municipio.RawValue.Should().Be("HIGUEY");
            extraction.Provincia.RawValue.Should().Be("LA ALTAGRACIA");
            extraction.SuperficieMetrosCuadrados.RawValue.Should().Be("12130.0700");
            extraction.DesignacionCatastral.RawValue.Should().Be("505483687149");

            // Viene de is present in raw text as label but has no value following it
            extraction.VieneDe.RawValue.Should().BeEmpty();
            extraction.VieneDe.Status.Should().Be(FieldStatus.Missing);
            extraction.Warnings.Should().Contain("El campo VieneDe fue detectado pero no contiene valor");

            extraction.DeclaracionEstadoLegal.RawValue.Should().Contain("libre de derechos reales");
            extraction.HasActiveOppositions.Should().BeFalse();

            extraction.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
        }

        [Fact]
        public void MapFromOcrResult_ShouldReturnIncomplete_WhenRequiredFieldsAreMissing()
        {
            // Arrange
            var rawJson = "[[[[[0, 0], [1, 1], [1, 1], [0, 1]], ('PROVINCIA', 0.99)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('LA ALTAGRACIA', 0.99)]]]";

            var ocrResult = new OcrResult
            {
                Success = true,
                Provider = "PaddleOcr",
                RawJson = rawJson
            };

            // Act
            var extraction = EstadoJuridicoRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.Provincia.RawValue.Should().Be("LA ALTAGRACIA");
            extraction.Matricula.Status.Should().Be(FieldStatus.Missing);
            extraction.ExtractionStatus.Should().Be(ExtractionStatus.Incomplete);
        }
    }
}
