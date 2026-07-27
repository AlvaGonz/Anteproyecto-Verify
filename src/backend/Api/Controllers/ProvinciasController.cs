namespace Api.Controllers;

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/provinces")]
public class ProvinciasController : ControllerBase
{
    private readonly string _connectionString;

    public ProvinciasController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DockerConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? string.Empty;
    }

    [HttpGet]
    [AllowAnonymous]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, NoStore = false)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var provincias = new List<object>();

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new SqlCommand(
            "SELECT IdProvincia, NombreProvincia, Latitud, Longitud FROM Provincia ORDER BY NombreProvincia",
            connection);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            provincias.Add(new
            {
                id = reader.GetGuid(0).ToString(),
                nombre = reader.GetString(1).Trim(),
                latitud = reader.GetDecimal(2),
                longitud = reader.GetDecimal(3)
            });
        }

        return Ok(provincias);
    }
}
