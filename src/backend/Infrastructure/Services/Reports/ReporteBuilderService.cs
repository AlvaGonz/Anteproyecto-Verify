namespace Infrastructure.Services.Reports;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Reports;
using Domain.Enums;

public class ReporteBuilderService : IReporteBuilder
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IHallazgoRepository _hallazgoRepository;
    private readonly IValidacionRepository _validacionRepository;

    public ReporteBuilderService(
        IProyectoRepository proyectoRepository,
        IHallazgoRepository hallazgoRepository,
        IValidacionRepository validacionRepository)
    {
        _proyectoRepository = proyectoRepository;
        _hallazgoRepository = hallazgoRepository;
        _validacionRepository = validacionRepository;
    }

    public async Task<ReporteHallazgosDto> BuildReporteAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {proyectoId} no encontrado.");

        var hallazgos = await _hallazgoRepository.GetByProyectoIdAsync(proyectoId, cancellationToken);

        int criticos = hallazgos.Count(h => h.Severity == FindingSeverity.Critical);
        int altos = hallazgos.Count(h => h.Severity == FindingSeverity.High);
        int medios = hallazgos.Count(h => h.Severity == FindingSeverity.Medium);
        int bajos = hallazgos.Count(h => h.Severity == FindingSeverity.Low);

        bool esApto = criticos == 0 && altos == 0;

        string resumen = esApto 
            ? "El proyecto cumple con los requisitos principales y es apto para continuar el proceso." 
            : "El proyecto presenta hallazgos de severidad alta o crítica que deben ser subsanados.";

        var detalles = hallazgos.Select(h => new
        {
            h.Id,
            h.Tipo,
            h.Descripcion,
            Severidad = h.Severity.ToString(),
            h.Recomendacion,
            h.FuenteValidacion,
            h.FechaDeteccionUtc
        }).ToList();

        var validaciones = await _validacionRepository.GetByProyectoIdAsync(proyectoId, cancellationToken);
        
        var validacionesDto = validaciones.Select(v => new ValidacionResumenDto
        {
            TipoValidacion = v.TipoValidacion,
            Estado = v.Estado.ToString(),
            Hallazgos = hallazgos
                .Where(h => h.ValidacionId == v.Id)
                .Select(h => new HallazgoResumenDto
                {
                    Descripcion = h.Descripcion,
                    Severidad = h.Severity.ToString()
                }).ToList()
        }).ToList();

        var orphanHallazgos = hallazgos.Where(h => h.ValidacionId == null).ToList();
        if (orphanHallazgos.Any())
        {
            validacionesDto.Add(new ValidacionResumenDto
            {
                TipoValidacion = "General / No Vinculado",
                Estado = orphanHallazgos.Count.ToString() + " hallazgo(s)",
                Hallazgos = orphanHallazgos.Select(h => new HallazgoResumenDto
                {
                    Descripcion = h.Descripcion,
                    Severidad = h.Severity.ToString()
                }).ToList()
            });
        }

        return new ReporteHallazgosDto
        {
            ProyectoId = project.Id,
            NombreProyecto = project.Nombre,
            CodigoInterno = project.CodigoInterno,
            UbicacionTexto = project.UbicacionTexto,
            ValorEstimado = project.ValorEstimado,
            DatosDesarrollador = project.DatosDesarrollador,
            RncDesarrollador = project.RncDesarrollador,
            Matricula = project.Matricula,
            DesignacionCatastral = project.DesignacionCatastral,
            SuperficieM2 = project.SuperficieM2,
            EstatusIpi = project.EstatusIpi,
            CategoriaNombre = project.CategoriaProyecto?.Nombre ?? "N/A",
            EstadoNombre = project.Estado?.Nombre ?? "N/A",
            ProvinciaNombre = project.Provincia?.NombreProvincia,
            FechaGeneracionUtc = DateTime.UtcNow,
            TotalHallazgos = hallazgos.Count(),
            HallazgosCriticos = criticos,
            HallazgosAltos = altos,
            HallazgosMedios = medios,
            HallazgosBajos = bajos,
            EsAptoParaSello = esApto,
            ResumenEjecutivo = resumen,
            Detalles = detalles,
            Validaciones = validacionesDto,
            Documentos = project.Documentos
                .Where(d => d.Activo)
                .Select(d => new DocumentoResumenDto
                {
                    NombreArchivo = d.NombreArchivoOriginal,
                    TipoDocumento = d.TipoDocumento.ToString(),
                    Estado = d.EstadoDocumento.ToString(),
                    TamanoBytes = d.TamanoBytes
                }).ToList()
        };
    }
}
