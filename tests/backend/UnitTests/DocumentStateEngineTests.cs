namespace UnitTests;

using System;
using global::Application.Services.DocumentProcessing;
using global::Application.Services.DocumentProcessing.FieldValidation;
using global::Application.Abstractions.Ocr;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;
using System.Collections.Generic;
using System.Text.Json;

public class DocumentStateEngineTests
{
    private readonly Mock<IDocumentFieldNormalizer> _normalizerMock;
    private readonly Mock<IDocumentValidationRuleEngine> _ruleEngineMock;
    private readonly DocumentStateEngine _engine;

    public DocumentStateEngineTests()
    {
        _normalizerMock = new Mock<IDocumentFieldNormalizer>();
        _ruleEngineMock = new Mock<IDocumentValidationRuleEngine>();
        _engine = new DocumentStateEngine(_normalizerMock.Object, _ruleEngineMock.Object);
    }

    private Documento CreateTestDocument()
    {
        return new Documento(
            Guid.NewGuid(), 
            DocumentType.TITLE, 
            "test.pdf", 
            "test.pdf", 
            "url", 
            "application/pdf", 
            ".pdf", 
            100, 
            Guid.NewGuid()
        );
    }

    [Fact]
    public void StateEngine_Uploaded_To_Verificado_When_ValidationPasses()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing); // Handled before calling ApplyOcrResult

        var ocrResult = new OcrResult { Success = true, RawJson = "{}" };
        var normalizedFields = new Dictionary<string, ExtractedField>();
        
        _normalizerMock.Setup(x => x.Normalize(ocrResult, doc.TipoDocumento)).Returns(normalizedFields);
        
        var validationResult = new DocumentFieldValidationResult(
            EstadoResultante: "Verificado",
            CamposFaltantesObligatorios: new List<string>(),
            CamposDetectadosOpcionales: new List<string>(),
            AlertasIntegridad: new List<string>(),
            ConfianzaPromedio: 0.95
        );
        
        _ruleEngineMock.Setup(x => x.Validate(normalizedFields, It.IsAny<IReadOnlyList<DocumentFieldRule>>(), 0.80)).Returns(validationResult);

        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.Verificado, doc.EstadoDocumento);
    }

    [Fact]
    public void StateEngine_Processing_To_Observado_When_ValidationFails()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing);

        var ocrResult = new OcrResult { Success = true, RawJson = "{ \"Result\": \"Valid\" }" };
        var normalizedFields = new Dictionary<string, ExtractedField>();
        
        _normalizerMock.Setup(x => x.Normalize(ocrResult, doc.TipoDocumento)).Returns(normalizedFields);
        
        var validationResult = new DocumentFieldValidationResult(
            EstadoResultante: "Observado",
            CamposFaltantesObligatorios: new List<string> { "matricula_serial" },
            CamposDetectadosOpcionales: new List<string>(),
            AlertasIntegridad: new List<string>(),
            ConfianzaPromedio: 0.95
        );
        
        _ruleEngineMock.Setup(x => x.Validate(normalizedFields, It.IsAny<IReadOnlyList<DocumentFieldRule>>(), 0.80)).Returns(validationResult);

        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.Observado, doc.EstadoDocumento);
    }

    [Fact]
    public void StateEngine_Processing_To_Observado_When_OcrFails()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing);

        var ocrResult = new OcrResult { Success = false, RawJson = "{ \"Error\": \"Bad image\" }" };
        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.Observado, doc.EstadoDocumento);
        Assert.Contains("Bad image", doc.ResultadoOcrJson);
    }

    [Fact]
    public void StateEngine_Rejects_Invalid_Transition()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Valid); // Invalid starting state

        var ocrResult = new OcrResult { Success = true, RawJson = "{}" };

        var ex = Assert.Throws<InvalidOperationException>(() => { _engine.ApplyOcrResult(doc, ocrResult); });
        Assert.Contains("Cannot apply OCR result to document in state", ex.Message);
    }
}
