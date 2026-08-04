namespace Application.Features.PublicVerification.Queries.SearchGlobal;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;

public class SearchGlobalQuery
{
    public string Type { get; set; } = string.Empty;
    public string Query { get; set; } = string.Empty;

    public SearchGlobalQuery(string type, string query)
    {
        Type = type;
        Query = query;
    }
}

public class SearchGlobalQueryHandler
{
    private readonly IGlobalSearchRepository _globalSearchRepository;

    public SearchGlobalQueryHandler(IGlobalSearchRepository globalSearchRepository)
    {
        _globalSearchRepository = globalSearchRepository;
    }

    public async Task<SearchResultDto?> HandleAsync(SearchGlobalQuery request, CancellationToken cancellationToken = default)
    {
        return await _globalSearchRepository.SearchGlobalAsync(request.Type, request.Query, cancellationToken);
    }
}
