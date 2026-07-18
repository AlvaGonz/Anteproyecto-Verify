using System.Linq;
using Application.Abstractions.Ocr;
using Domain.Enums;
using Infrastructure.DocumentProcessing;
using Xunit;

namespace UnitTests.Infrastructure.DocumentProcessing;

public class DocumentFieldNormalizerTests
{
    private readonly DocumentFieldNormalizer _sut;

    public DocumentFieldNormalizerTests()
    {
        _sut = new DocumentFieldNormalizer();
    }

    [Fact]
    public void Normalize_WithValidOcrResult_ReturnsExtractedFields()
    {
        // Arrange
        var ocrResult = new OcrResult
        {
            Success = true,
            ExtractedText = "Matrícula: 12345\nPropietario: Juan Perez\nFecha: 10/10/2023\nInmueble: Apartamento 1A"
        };

        // Act
        var fields = _sut.Normalize(ocrResult, DocumentType.TITLE);

        // Assert
        Assert.NotNull(fields);
        Assert.True(fields.ContainsKey("matricula_serial"));
        Assert.True(fields["matricula_serial"].Presente);
        
        Assert.True(fields.ContainsKey("titular"));
        Assert.True(fields["titular"].Presente);
        
        Assert.True(fields.ContainsKey("fecha"));
        Assert.True(fields["fecha"].Presente);
    }

    [Fact]
    public void Normalize_WithEmptyText_ReturnsEmptyDictionary()
    {
        // Arrange
        var ocrResult = new OcrResult
        {
            Success = true,
            ExtractedText = ""
        };

        // Act
        var fields = _sut.Normalize(ocrResult, DocumentType.TITLE);

        // Assert
        Assert.Empty(fields);
    }

    [Fact]
    public void Normalize_MissingMandatoryField_ReturnsFieldAsNotPresent()
    {
        // Arrange
        var ocrResult = new OcrResult
        {
            Success = true,
            ExtractedText = "Propietario: Juan Perez\nFecha: 10/10/2023" // Missing matricula and descripcion
        };

        // Act
        var fields = _sut.Normalize(ocrResult, DocumentType.TITLE);

        // Assert
        Assert.True(fields.ContainsKey("matricula_serial"));
        Assert.False(fields["matricula_serial"].Presente);
        
        Assert.True(fields.ContainsKey("descripcion_inmueble"));
        Assert.False(fields["descripcion_inmueble"].Presente);
    }
}
