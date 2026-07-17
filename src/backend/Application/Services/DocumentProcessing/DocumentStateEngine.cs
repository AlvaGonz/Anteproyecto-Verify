namespace Application.Services.DocumentProcessing;

using Application.Abstractions.Ocr;
using Domain.Entities;
using Domain.Enums;
using System;

public interface IDocumentStateEngine
{
    void ApplyOcrResult(Documento document, OcrResult ocrResult);
}

public class DocumentStateEngine : IDocumentStateEngine
{
    public void ApplyOcrResult(Documento document, OcrResult ocrResult)
    {
        if (document.EstadoDocumento != DocumentStatus.Processing && document.EstadoDocumento != DocumentStatus.Uploaded)
        {
            throw new InvalidOperationException($"Cannot apply OCR result to document in state {document.EstadoDocumento}");
        }

        if (ocrResult.Success)
        {
            document.SetOcrResult(ocrResult.RawJson, DocumentStatus.PreVerificado);
        }
        else
        {
            document.SetOcrResult(ocrResult.RawJson, DocumentStatus.Observado);
        }
    }
}
