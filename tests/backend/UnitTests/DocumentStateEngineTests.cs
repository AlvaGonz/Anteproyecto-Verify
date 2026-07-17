namespace UnitTests;

using System;
using global::Application.Services.DocumentProcessing;
using global::Application.Abstractions.Ocr;
using Domain.Entities;

using Domain.Enums;
using Xunit;

public class DocumentStateEngineTests
{
    private readonly DocumentStateEngine _engine;

    public DocumentStateEngineTests()
    {
        _engine = new DocumentStateEngine();
    }

    private Documento CreateTestDocument()
    {
        return new Documento(
            Guid.NewGuid(), 
            DocumentType.CertificadoTitulo, 
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
    public void StateEngine_Uploaded_To_Processing_Succeeds()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing); // Handled before calling ApplyOcrResult

        var ocrResult = new OcrResult { Success = true, RawJson = "{}" };
        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.PreVerificado, doc.EstadoDocumento);
    }

    [Fact]
    public void StateEngine_Processing_To_PreVerificado_When_AllFieldsPresent()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing);

        var ocrResult = new OcrResult { Success = true, RawJson = "{ \"Result\": \"Valid\" }" };
        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.PreVerificado, doc.EstadoDocumento);
        Assert.Equal(ocrResult.RawJson, doc.ResultadoOcrJson);
    }

    [Fact]
    public void StateEngine_Processing_To_Observado_When_FieldsMissing()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Processing);

        var ocrResult = new OcrResult { Success = false, RawJson = "{ \"Error\": \"Missing fields\" }" };
        _engine.ApplyOcrResult(doc, ocrResult);

        Assert.Equal(DocumentStatus.Observado, doc.EstadoDocumento);
        Assert.Equal(ocrResult.RawJson, doc.ResultadoOcrJson);
    }

    [Fact]
    public void StateEngine_Rejects_Invalid_Transition()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Valid); // Invalid starting state

        var ocrResult = new OcrResult { Success = true, RawJson = "{}" };

        var ex = Assert.Throws<InvalidOperationException>(() => _engine.ApplyOcrResult(doc, ocrResult));
        Assert.Contains("Cannot apply OCR result to document in state", ex.Message);
    }
}
