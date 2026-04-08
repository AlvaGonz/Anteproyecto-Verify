namespace Application.Features.Validation.Queries.GetActiveAlertsByProject;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;

public class GetActiveAlertsByProjectQueryHandler
{
    private readonly IAlertaValidacionRepository _alertaRepository;

    public GetActiveAlertsByProjectQueryHandler(IAlertaValidacionRepository alertaRepository)
    {
        _alertaRepository = alertaRepository;
    }

    public async Task<List<AlertaValidacionDto>> Handle(GetActiveAlertsByProjectQuery request, CancellationToken cancellationToken)
    {
        var alertas = await _alertaRepository.GetByProyectoIdAsync(request.ProyectoId, cancellationToken);
        
        return alertas.Where(a => !a.Resuelta).Select(a => new AlertaValidacionDto
        {
            Id = a.Id,
            ProyectoId = a.ProyectoId,
            DocumentoId = a.DocumentoId,
            Type = a.Type,
            Category = a.Category,
            Titulo = a.Titulo,
            Descripcion = a.Descripcion,
            Recomendacion = a.Recomendacion,
            Resuelta = a.Resuelta,
            FechaGeneracion = a.FechaGeneracion,
            NivelRiesgo = a.NivelRiesgo
        }).ToList();
    }
}
