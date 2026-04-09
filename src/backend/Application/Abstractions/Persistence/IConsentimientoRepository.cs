namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IConsentimientoRepository
{
    Task<ConsentimientoFinanciero?> GetVigenteByUsuarioIdAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task AddAsync(ConsentimientoFinanciero consentimiento, CancellationToken cancellationToken = default);
    void Update(ConsentimientoFinanciero consentimiento);
}
