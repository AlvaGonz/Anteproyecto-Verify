using System;
using global::Domain.Entities;
using global::Domain.Enums;
using Xunit;

public class DocumentoTests
{
    private Documento CreateTestDocument()
    {
        return new Documento(
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
    }

    [Fact]
    public void Documento_SetHash_Stores_SHA256()
    {
        var doc = CreateTestDocument();
        var hash = "d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2";

        doc.SetHash(hash);

        Assert.Equal(hash, doc.HashSHA256);
    }

    [Fact]
    public void Documento_SetHash_Empty_ThrowsArgumentException()
    {
        var doc = CreateTestDocument();

        Assert.Throws<ArgumentException>(() => doc.SetHash(""));
    }

    [Fact]
    public void Documento_SetOcrResult_Updates_Status_And_Json()
    {
        var doc = CreateTestDocument();
        var json = "{\"key\":\"value\"}";

        doc.SetOcrResult(json, DocumentStatus.EnRevision);

        Assert.Equal(json, doc.ResultadoOcrJson);
        Assert.Equal(DocumentStatus.EnRevision, doc.EstadoDocumento);
    }

    [Fact]
    public void SetOcrResult_ShouldThrowArgumentException_WhenJsonIsEmpty()
    {
        var doc = CreateTestDocument();

        Assert.Throws<ArgumentException>(() => doc.SetOcrResult("", DocumentStatus.EnRevision));
    }

    [Fact]
    public void SetOcrResult_ShouldThrowInvalidOperationException_WhenStatusIsNotProcessingOrUploaded()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Valid);

        Assert.Throws<InvalidOperationException>(() => doc.SetOcrResult("{}", DocumentStatus.EnRevision));
    }
}
