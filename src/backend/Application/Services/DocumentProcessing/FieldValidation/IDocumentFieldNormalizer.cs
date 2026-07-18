namespace Application.Services.DocumentProcessing.FieldValidation;

using System.Collections.Generic;
using Application.Abstractions.Ocr;
using Domain.Enums;

/// <summary>
/// Maps raw OcrResult into a typed field bag keyed by rule Campo names.
/// </summary>
public interface IDocumentFieldNormalizer
{
    Dictionary<string, ExtractedField> Normalize(OcrResult ocrResult, DocumentType documentType);
}
