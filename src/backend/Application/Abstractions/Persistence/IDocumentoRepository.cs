namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IDocumentoRepository
{
    Task<Documento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Documento>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(Documento documento, CancellationToken cancellationToken = default);
    void Update(Documento documento);
    void Delete(Documento documento);
    Task<long> GetTotalStorageBytesByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
