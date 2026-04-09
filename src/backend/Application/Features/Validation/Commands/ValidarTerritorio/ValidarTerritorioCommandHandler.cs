namespace Application.Features.Validation.Commands.ValidarTerritorio;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Geo;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
using Domain.ValueObjects;

public class ValidarTerritorioResultDto
{
    public bool Ejecutado { get; set; }
    public bool EsValido { get; set; }
    public string? Mensaje { get; set; }
}

public class ValidarTerritorioCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly ICatastroGeoService _catastroGeoService;
    private readonly IHallazgoRepository _hallazgoRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ValidarTerritorioCommandHandler(
        IProyectoRepository proyectoRepository,
        ICatastroGeoService catastroGeoService,
        IHallazgoRepository hallazgoRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _catastroGeoService = catastroGeoService;
        _hallazgoRepository = hallazgoRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ValidarTerritorioResultDto> Handle(ValidarTerritorioCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var coordenadas = Coordenadas.Parse(project.UbicacionGps);
        
        // RS1: Si no hay coordenadas, la validación no se ejecuta
        if (coordenadas == null)
        {
            return new ValidarTerritorioResultDto
            {
                Ejecutado = false,
                EsValido = true,
                Mensaje = "No hay coordenadas GPS válidas para ejecutar la validación territorial."
            };
        }

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Validación territorial iniciada",
            "Validacion",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando coordenadas: {coordenadas}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var geoResult = await _catastroGeoService.ValidarCoordenadasAsync(coordenadas, cancellationToken);

        if (!geoResult.IsSuccess)
        {
            return new ValidarTerritorioResultDto
            {
                Ejecutado = true,
                EsValido = false,
                Mensaje = $"Error al consultar Catastro: {geoResult.ErrorMessage}"
            };
        }

        bool esValido = true;
        string mensaje = "Validación territorial exitosa.";

        // RS3: Generar inconsistencia territorial si coordenadas fuera de límites
        if (!geoResult.DentroDeLimites)
        {
            esValido = false;
            mensaje = "Las coordenadas se encuentran fuera de los límites territoriales válidos.";
            
            var hallazgoLimites = new Hallazgo(
                project.Id,
                null,
                "Validación Territorial",
                mensaje,
                FindingSeverity.High,
                "Verificar las coordenadas GPS proporcionadas.",
                "CatastroGeoService"
            );
            await _hallazgoRepository.AddAsync(hallazgoLimites, cancellationToken);
        }
        else
        {
            // RS2: Verificar congruencia entre zona de uso de suelo y tipo de proyecto
            if (!string.IsNullOrEmpty(geoResult.ZonaUsoSuelo))
            {
                bool zonaCompatible = EsZonaCompatible(project.Categoria, geoResult.ZonaUsoSuelo);
                if (!zonaCompatible)
                {
                    esValido = false;
                    mensaje = $"Incongruencia de uso de suelo: Proyecto {project.Categoria} en zona {geoResult.ZonaUsoSuelo}.";
                    
                    var hallazgoUsoSuelo = new Hallazgo(
                        project.Id,
                        null,
                        "Validación Territorial",
                        mensaje,
                        FindingSeverity.Medium,
                        "Verificar la categoría del proyecto o solicitar cambio de uso de suelo.",
                        "CatastroGeoService"
                    );
                    await _hallazgoRepository.AddAsync(hallazgoUsoSuelo, cancellationToken);
                }
            }
        }

        var auditoriaFin = new Auditoria(
            request.UsuarioId,
            "Validación territorial finalizada",
            "Validacion",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Resultado: {(esValido ? "Válido" : "Inválido")} - {mensaje}"
        );
        await _auditoriaRepository.AddAsync(auditoriaFin, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ValidarTerritorioResultDto
        {
            Ejecutado = true,
            EsValido = esValido,
            Mensaje = mensaje
        };
    }

    private bool EsZonaCompatible(ProjectCategory categoria, string zonaUsoSuelo)
    {
        // Lógica simplificada para el mock
        if (categoria == ProjectCategory.Residencial && zonaUsoSuelo.Contains("Residencial", StringComparison.OrdinalIgnoreCase)) return true;
        if (categoria == ProjectCategory.Comercial && zonaUsoSuelo.Contains("Comercial", StringComparison.OrdinalIgnoreCase)) return true;
        if (categoria == ProjectCategory.Industrial && zonaUsoSuelo.Contains("Industrial", StringComparison.OrdinalIgnoreCase)) return true;
        if (categoria == ProjectCategory.Turistico && zonaUsoSuelo.Contains("Turistico", StringComparison.OrdinalIgnoreCase)) return true;
        
        // Si es mixto, suele ser compatible con residencial o comercial
        if (categoria == ProjectCategory.Mixto && (zonaUsoSuelo.Contains("Residencial", StringComparison.OrdinalIgnoreCase) || zonaUsoSuelo.Contains("Comercial", StringComparison.OrdinalIgnoreCase))) return true;

        return false;
    }
}
