namespace Application.Contracts.Projects;

using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Application.DTOs.Projects;

public interface ICatastroLookupRepository
{
    Task<CatastroLookupDto?> GetByGpsAsync(decimal latitud, decimal longitud, CancellationToken cancellationToken = default);
    Task<List<CatastroLookupDto>> GetByMatriculaOrDesignacionAsync(string? matricula, string? designacion, CancellationToken cancellationToken = default);
}
