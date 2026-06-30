using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Queries.Admin;
using Application.Handlers.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/dashboard")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly GetDashboardStatsQueryHandler _handler;

        public AdminDashboardController(GetDashboardStatsQueryHandler handler)
        {
            _handler = handler;
        }

        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            if (!IsAdmin())
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
            }

            var query = new GetDashboardStatsQuery();
            var result = await _handler.Handle(query, cancellationToken);
            
            return Ok(result);
        }

        private bool IsAdmin()
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return false;
            }

            var roles = User.Claims
                .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)
                .ToList();

            return roles.Any(r => 
                string.Equals(r, "admin", System.StringComparison.OrdinalIgnoreCase) || 
                string.Equals(r, "Administrator", System.StringComparison.OrdinalIgnoreCase));
        }
    }
}
