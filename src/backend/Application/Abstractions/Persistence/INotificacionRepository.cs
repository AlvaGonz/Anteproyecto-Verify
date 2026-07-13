namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface INotificacionRepository
{
    Task<IEnumerable<Notificacion>> GetByUsuarioIdAsync(Guid usuarioId, bool soloNoLeidas = false, CancellationToken cancellationToken = default);
    Task<Notificacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Notificacion notificacion, CancellationToken cancellationToken = default);
    Task UpdateAsync(Notificacion notificacion, CancellationToken cancellationToken = default);
    Task DeleteAsync(Notificacion notificacion, CancellationToken cancellationToken = default);
}
