namespace Application.Abstractions.DocumentIntelligence;

using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Application.Contracts.Documents;

public interface IDocumentValidationService
{
    Task<DocumentValidationResult> ValidateDocumentAsync(Stream fileStream, string contentType, string fileName, CancellationToken cancellationToken = default);
}
