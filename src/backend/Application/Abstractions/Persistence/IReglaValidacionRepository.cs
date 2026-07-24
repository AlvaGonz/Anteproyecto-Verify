namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;

public interface IReglaValidacionRepository
{
    Task<ReglaValidacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReglaValidacion>> GetAllAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReglaValidacion>> GetActiveRulesAsync(TipoProyecto tipoProyecto, DocumentType tipoDocumento, CancellationToken cancellationToken = default);
    Task AddAsync(ReglaValidacion regla, CancellationToken cancellationToken = default);
}
