namespace Application.Features.Credit.Commands.ConsultarCredito;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices.Credit;
using Application.Abstractions.Persistence;
using Application.Common;
using Domain.Entities;
using Domain.Enums;

public class ConsultarCreditoResultDto
{
    public bool IsSuccess { get; set; }
    public string? Mensaje { get; set; }
    public NivelRiesgoCrediticio? NivelRiesgo { get; set; }
}

public class ConsultarCreditoCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConsentimientoRepository _consentimientoRepository;
    private readonly IResultadoCrediticioRepository _resultadoCrediticioRepository;
    private readonly ITransUnionService _transUnionService;
    private readonly IHallazgoRepository _hallazgoRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConsultarCreditoCommandHandler(
        IProyectoRepository proyectoRepository,
        IUsuarioRepository usuarioRepository,
        IConsentimientoRepository consentimientoRepository,
        IResultadoCrediticioRepository resultadoCrediticioRepository,
        ITransUnionService transUnionService,
        IHallazgoRepository hallazgoRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _usuarioRepository = usuarioRepository;
        _consentimientoRepository = consentimientoRepository;
        _resultadoCrediticioRepository = resultadoCrediticioRepository;
        _transUnionService = transUnionService;
        _hallazgoRepository = hallazgoRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ConsultarCreditoResultDto> Handle(ConsultarCreditoCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var promotor = await _usuarioRepository.GetByIdAsync(project.PromotorId, cancellationToken);
        if (promotor == null)
            throw new KeyNotFoundException($"Promotor con ID {project.PromotorId} no encontrado.");

        // RS1: Verificar consentimiento vigente
        var consentimiento = await _consentimientoRepository.GetVigenteByUsuarioIdAsync(promotor.Id, cancellationToken);
        if (consentimiento == null)
        {
            return new ConsultarCreditoResultDto
            {
                IsSuccess = false,
                Mensaje = "No existe un consentimiento financiero vigente para el promotor."
            };
        }

        // COMP-001 Gate: consent must be under current policy version (Law 172-13 Art. 17)
        if (consentimiento.VersionPolitica != ConsentGateConstants.CurrentVersionPolitica)
        {
            return new ConsultarCreditoResultDto
            {
                IsSuccess = false,
                Mensaje = $"El consentimiento fue otorgado bajo la versión {consentimiento.VersionPolitica} y la política actual es {ConsentGateConstants.CurrentVersionPolitica}. Se requiere renovar el consentimiento."
            };
        }

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Consulta crediticia iniciada",
            "Validacion",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando TransUnion para promotor {promotor.Identificacion}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // RS2: Consultar buró
        if (string.IsNullOrWhiteSpace(promotor.Identificacion))
        {
            return new ConsultarCreditoResultDto
            {
                IsSuccess = false,
                Mensaje = "El promotor no tiene una identificación (cédula) registrada para la consulta."
            };
        }

        var tuResult = await _transUnionService.ConsultarHistorialAsync(promotor.Identificacion, cancellationToken);
        if (!tuResult.IsSuccess)
        {
            return new ConsultarCreditoResultDto
            {
                IsSuccess = false,
                Mensaje = $"Error al consultar TransUnion: {tuResult.ErrorMessage}"
            };
        }

        // RS3: Guardar solo indicadores de riesgo
        var resultadoCrediticio = new ResultadoCrediticio(
            project.Id,
            consentimiento.Id,
            tuResult.Score,
            tuResult.PorcentajeEndeudamiento,
            tuResult.AtrasosUltimos12Meses,
            tuResult.NivelRiesgo
        );
        await _resultadoCrediticioRepository.AddAsync(resultadoCrediticio, cancellationToken);

        // RS4: Generar hallazgo si el riesgo es Alto o Crítico
        if (tuResult.NivelRiesgo == NivelRiesgoCrediticio.Alto || tuResult.NivelRiesgo == NivelRiesgoCrediticio.Critico)
        {
            var hallazgo = new Hallazgo(
                project.Id,
                null,
                "Riesgo Crediticio",
                $"El promotor presenta un nivel de riesgo crediticio {tuResult.NivelRiesgo}.",
                FindingSeverity.High,
                "Requerir garantías adicionales o justificación financiera.",
                "TransUnionService"
            );
            await _hallazgoRepository.AddAsync(hallazgo, cancellationToken);
        }

        var auditoriaFin = new Auditoria(
            request.UsuarioId,
            "Consulta crediticia finalizada",
            "Validacion",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Resultado: Nivel de Riesgo {tuResult.NivelRiesgo}"
        );
        await _auditoriaRepository.AddAsync(auditoriaFin, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ConsultarCreditoResultDto
        {
            IsSuccess = true,
            Mensaje = "Consulta crediticia completada exitosamente.",
            NivelRiesgo = tuResult.NivelRiesgo
        };
    }
}
