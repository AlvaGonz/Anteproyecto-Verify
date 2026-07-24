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

        var cleanedRnc = new string(rnc.Where(char.IsDigit).ToArray());

        var record = await _context.DGII
            .FirstOrDefaultAsync(d => d.Rnc == cleanedRnc, cancellationToken);

        if (record == null)
        {
            return NotFound(new { message = $"RNC {rnc} not found in DGII registry." });
        }

        return Ok(record);
    }
}
