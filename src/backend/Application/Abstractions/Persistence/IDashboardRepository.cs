using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Admin;

namespace Application.Abstractions.Persistence
{
    public interface IDashboardRepository
    {
        Task<DashboardStatsDto> GetAdminDashboardStatsAsync(CancellationToken cancellationToken = default);
        Task<DashboardStatsDto> GetUserDashboardStatsAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
