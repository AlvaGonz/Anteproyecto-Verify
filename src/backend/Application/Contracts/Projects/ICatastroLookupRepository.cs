namespace Application.Contracts.Projects;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Projects;

public interface ICatastroLookupRepository
{
    Task<CatastroLookupDto?> GetByGpsAsync(decimal latitud, decimal longitud, CancellationToken cancellationToken = default);
}
