namespace Infrastructure.Persistence.Repositories;

using System.Threading;
using System.Threading.Tasks;
using Application.Contracts.Projects;
using Application.DTOs.Projects;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Data;
using System.Data.Common;

public class CatastroLookupRepository : ICatastroLookupRepository
{
    private readonly AppDbContext _context;

    public CatastroLookupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CatastroLookupDto?> GetByGpsAsync(decimal latitud, decimal longitud, CancellationToken cancellationToken = default)
    {
        var connection = _context.Database.GetDbConnection();
        var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT TOP 1 
                c.CodigoDesignacionCatastral as DesignacionCatastral,
                c.Matricula as Matricula,
                c.Superficie as SuperficieM2,
                c.Rnc as Propietario,
                c.Rnc as CedulaRncPropietario,
                c.Rnc as Ipi,
                p.Estatus as EstatusIpi
            FROM CatastroTitulo c
            LEFT JOIN PagoIPI p ON c.Rnc = p.Rnc
            WHERE ROUND(c.Latitud, 6) = @p0 AND ROUND(c.Longitud, 6) = @p1
        ";

        var p0 = command.CreateParameter();
        p0.ParameterName = "@p0";
        p0.Value = latitud;
        command.Parameters.Add(p0);

        var p1 = command.CreateParameter();
        p1.ParameterName = "@p1";
        p1.Value = longitud;
        command.Parameters.Add(p1);

        bool wasOpen = connection.State == ConnectionState.Open;
        if (!wasOpen) await connection.OpenAsync(cancellationToken);

        try
        {
            using var reader = await command.ExecuteReaderAsync(cancellationToken);
            if (await reader.ReadAsync(cancellationToken))
            {
                return new CatastroLookupDto(
                    reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
                    reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
                    reader.IsDBNull(2) ? 0 : reader.GetDecimal(2),
                    reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                    reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
                    reader.IsDBNull(5) ? string.Empty : reader.GetString(5),
                    reader.IsDBNull(6) ? string.Empty : reader.GetString(6)
                );
            }
            return null;
        }
        finally
        {
            if (!wasOpen) await connection.CloseAsync();
        }
    }
}
