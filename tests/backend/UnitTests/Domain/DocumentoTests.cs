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

        doc.SetOcrResult(json, DocumentStatus.PreVerificado);

        Assert.Equal(json, doc.ResultadoOcrJson);
        Assert.Equal(DocumentStatus.PreVerificado, doc.EstadoDocumento);
    }

    [Fact]
    public void Documento_SetOcrResult_EmptyJson_ThrowsArgumentException()
    {
        var doc = CreateTestDocument();

        Assert.Throws<ArgumentException>(() => doc.SetOcrResult("", DocumentStatus.PreVerificado));
    }

    [Fact]
    public void Documento_SetOcrResult_Rejects_Invalid_Transition()
    {
        var doc = CreateTestDocument();
        doc.UpdateStatus(DocumentStatus.Valid);

        Assert.Throws<InvalidOperationException>(() => doc.SetOcrResult("{}", DocumentStatus.PreVerificado));
    }
}
