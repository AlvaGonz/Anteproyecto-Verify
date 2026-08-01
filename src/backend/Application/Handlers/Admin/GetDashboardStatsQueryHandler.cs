using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Admin;
using Application.Queries.Admin;

namespace Application.Handlers.Admin
{
    public class GetDashboardStatsQueryHandler
    {
        private readonly IDashboardRepository _dashboardRepository;

        public GetDashboardStatsQueryHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            return await _dashboardRepository.GetAdminDashboardStatsAsync(cancellationToken);
        }

        public async Task<DashboardStatsDto> HandleForUser(Guid userId, CancellationToken cancellationToken)
        {
            return await _dashboardRepository.GetUserDashboardStatsAsync(userId, cancellationToken);
        }
    }
}
