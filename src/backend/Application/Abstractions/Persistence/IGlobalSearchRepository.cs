namespace Application.Abstractions.Persistence;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Validation;

public interface IGlobalSearchRepository
{
    Task<SearchResultDto?> SearchGlobalAsync(string searchType, string query, CancellationToken cancellationToken = default);
}
