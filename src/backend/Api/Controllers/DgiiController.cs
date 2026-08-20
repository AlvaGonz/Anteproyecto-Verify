namespace Api.Controllers;

using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class DgiiController : ControllerBase
{
    private readonly AppDbContext _context;

    public DgiiController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("rnc/{rnc}")]
    public async Task<IActionResult> GetByRnc(string rnc, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rnc))
        {
            return BadRequest(new { message = "RNC is required." });
        }

        var cleanedRnc = rnc.Replace("-", "").Trim();

        var record = await _context.DGII
            .FirstOrDefaultAsync(d => d.Rnc == cleanedRnc, cancellationToken);

        if (record == null)
        {
            var citizen = await _context.JCE_Ciudadanos
                .FirstOrDefaultAsync(c => c.Cedula == cleanedRnc, cancellationToken);

            if (citizen != null)
            {
                return Ok(new
                {
                    Rnc = citizen.Cedula,
                    NombreRazonSocial = $"{citizen.Nombres} {citizen.Apellidos}".Trim(),
                    NombreComercial = $"{citizen.Nombres} {citizen.Apellidos}".Trim(),
                    Estado = "ACTIVO",
                    ActividadEconomica = "PERSONA FÍSICA",
                    Categoria = "Física",
                    RegimenPagos = "Normal"
                });
            }

            return NotFound(new { message = $"RNC or Cedula {rnc} not found in registries." });
        }

        return Ok(record);
    }
}
