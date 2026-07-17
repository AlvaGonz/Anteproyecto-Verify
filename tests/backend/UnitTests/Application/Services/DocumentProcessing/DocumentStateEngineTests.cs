namespace UnitTests.Application.Services.DocumentProcessing;

using System;
using global::Application.Services.DocumentProcessing;
using global::Application.Abstractions.Ocr;
using global::Domain.Entities;
using global::Domain.Enums;
using Xunit;

public class DocumentStateEngineTests
{
    private Documento CreateTestDocument(DocumentStatus status)
    {
        var doc = new Documento(
            Guid.NewGuid(),
            DocumentType.ID,
            "test.pdf",
            "test.pdf",
            "/path/to/test.pdf",
            "application/pdf",
            ".pdf",
            1024,
            Guid.NewGuid()
        );

        if (status != DocumentStatus.Uploaded)
        {
            doc.UpdateStatus(status);
        }

        return doc;
    }

    [Fact]
    public void ApplyOcrResult_Success_SetsPreVerificado()
    {
        var engine = new DocumentStateEngine();
        var doc = CreateTestDocument(DocumentStatus.Processing);
        var result = new OcrResult { Success = true, RawJson = "{\"ok\":true}" };

        engine.ApplyOcrResult(doc, result);

        Assert.Equal(DocumentStatus.PreVerificado, doc.EstadoDocumento);
        Assert.Equal(result.RawJson, doc.ResultadoOcrJson);
    }

    [Fact]
    public void ApplyOcrResult_Failure_SetsObservado()
    {
        var engine = new DocumentStateEngine();
        var doc = CreateTestDocument(DocumentStatus.Processing);
        var result = new OcrResult { Success = false, RawJson = "{\"ok\":false}" };

        engine.ApplyOcrResult(doc, result);

        Assert.Equal(DocumentStatus.Observado, doc.EstadoDocumento);
        Assert.Equal(result.RawJson, doc.ResultadoOcrJson);
    }

    [Fact]
    public void ApplyOcrResult_FromValidState_ThrowsInvalidOperationException()
    {
        var engine = new DocumentStateEngine();
        var doc = CreateTestDocument(DocumentStatus.Valid);
        var result = new OcrResult { Success = true, RawJson = "{}" };

        Assert.Throws<InvalidOperationException>(() => engine.ApplyOcrResult(doc, result));
    }
}
