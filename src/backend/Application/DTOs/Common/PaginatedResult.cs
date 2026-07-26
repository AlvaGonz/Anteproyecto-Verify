using System.Collections.Generic;

namespace Application.DTOs.Common
{
    public record PaginatedResult<T>(
        IReadOnlyList<T> Items,
        int TotalCount,
        int Page,
        int PageSize
    );
}
