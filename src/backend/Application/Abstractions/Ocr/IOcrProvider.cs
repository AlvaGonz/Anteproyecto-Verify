namespace Application.Abstractions.Ocr;

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public interface IOcrProvider
{
    Task<OcrResult> ProcessDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default);
}
