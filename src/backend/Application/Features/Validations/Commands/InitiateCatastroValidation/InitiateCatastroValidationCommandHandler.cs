namespace Application.Features.Validations.Commands.InitiateCatastroValidation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Integrations;
using Application.Abstractions.Persistence;
using Application.Services;
using Domain.Entities;
using Domain.Enums;

public class InitiateCatastroValidationCommandHandler
{
    private readonly ICatastroService _catastroService;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IValidacionRepository _validacionRepository;
    private readonly IHallazgoRepository _hallazgoRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly CatastroComparisonService _comparisonService;

    public InitiateCatastroValidationCommandHandler(
        ICatastroService catastroService,
        IProyectoRepository proyectoRepository,
        IUsuarioRepository usuarioRepository,
        IValidacionRepository validacionRepository,
        IHallazgoRepository hallazgoRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork,
        CatastroComparisonService comparisonService)
    {
        _catastroService = catastroService;
        _proyectoRepository = proyectoRepository;
        _usuarioRepository = usuarioRepository;
        _validacionRepository = validacionRepository;
        _hallazgoRepository = hallazgoRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
        _comparisonService = comparisonService;
    }

    public async Task<bool> Handle(InitiateCatastroValidationCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var usuario = await _usuarioRepository.GetByIdWithPlanAsync(request.UsuarioId, cancellationToken);
        if (usuario == null)
            throw new KeyNotFoundException($"Usuario con ID {request.UsuarioId} no encontrado.");

        if (!Domain.Policies.SubscriptionTierPolicy.CanConsult(usuario))
        {
            throw new Application.Common.Exceptions.QuotaExceededException(
                Domain.Policies.SubscriptionTierPolicy.GetTierName(usuario), 
                "MaxConsultasMensuales", 
                "Límite de consultas externas alcanzado para su plan actual.");
        }

        usuario.IncrementarConsulta();
        _usuarioRepository.Update(usuario);

        if (string.IsNullOrWhiteSpace(project.UbicacionGps) || string.IsNullOrWhiteSpace(project.DesignacionCatastral))
        {
            // RS13: Activar consulta solo cuando el expediente tenga coordenadas Y designacion catastral
            return false;
        }

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Consulta Catastro iniciada",
            "IntegracionExterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando parcela: {project.DesignacionCatastral}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var response = await _catastroService.ConsultarParcelaAsync(project.UbicacionGps, project.DesignacionCatastral, cancellationToken);

            var validacion = new Validacion(project.Id, "Catastro");
            
            if (response.IsSuccess)
            {
                var comparisonResult = _comparisonService.Compare(project, response);

                validacion.CompleteValidation(
                    !comparisonResult.HasDiscrepancies,
                    comparisonResult.HasDiscrepancies ? "Discrepancias encontradas con Catastro" : "Datos coinciden con Catastro"
                );
                await _validacionRepository.AddAsync(validacion, cancellationToken);

                if (comparisonResult.HasDiscrepancies)
                {
                    if (!string.IsNullOrWhiteSpace(comparisonResult.LocationDiscrepancy))
                    {
                        var hallazgo = new Hallazgo(
                            project.Id,
                            FindingSeverity.High,
                            "CAT-001",
                            "Discrepancia de Ubicación GPS",
                            comparisonResult.LocationDiscrepancy,
                            validacion.Id
                        );
                        await _hallazgoRepository.AddAsync(hallazgo, cancellationToken);
                    }

                    if (!string.IsNullOrWhiteSpace(comparisonResult.LimitsDiscrepancy))
                    {
                        var hallazgo = new Hallazgo(
                            project.Id,
                            FindingSeverity.Medium,
                            "CAT-002",
                            "Discrepancia de Designación Catastral",
                            comparisonResult.LimitsDiscrepancy,
                            validacion.Id
                        );
                        await _hallazgoRepository.AddAsync(hallazgo, cancellationToken);
                    }
                }
            }
            else
            {
                validacion.CompleteValidation(false, $"Error Catastro: {response.ErrorMessage}");
                await _validacionRepository.AddAsync(validacion, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return response.IsSuccess;
        }
        catch (Exception ex)
        {
            var auditoriaError = new Auditoria(
                request.UsuarioId,
                "Error en consulta Catastro",
                "IntegracionExterna",
                "Proyecto",
                project.Id.ToString(),
                project.Id,
                $"Error: {ex.Message}"
            );
            await _auditoriaRepository.AddAsync(auditoriaError, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return false;
        }
    }
}
