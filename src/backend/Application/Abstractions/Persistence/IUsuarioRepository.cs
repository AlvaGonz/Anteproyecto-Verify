namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Usuario?> GetByIdWithPlanAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(Usuario usuario, CancellationToken cancellationToken = default);
    void Update(Usuario usuario);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCedulaAsync(string cedula, CancellationToken cancellationToken = default);
    Task<Usuario?> GetByVerificationTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<Usuario?> GetByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<List<Usuario>> GetPendingPurgeAsync(CancellationToken cancellationToken = default);
    Task<Usuario?> GetByNicknameAsync(string nickname, CancellationToken cancellationToken = default);
    Task IncrementarConsultaAsync(Guid userId, CancellationToken cancellationToken = default);
}
