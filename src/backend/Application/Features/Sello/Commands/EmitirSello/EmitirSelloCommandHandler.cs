namespace Application.Features.Sello.Commands.EmitirSello;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Reports;
using Application.Abstractions.Services.Crypto;
using Domain.Entities;

public class EmitirSelloResultDto
{
    public bool IsSuccess { get; set; }
    public string? Mensaje { get; set; }
    public string? CodigoSello { get; set; }
    public string? UrlQr { get; set; }
}

public class EmitirSelloCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IReporteBuilder _reporteBuilder;
    private readonly IFirmaDigitalService _firmaDigitalService;
    private readonly IQrGeneratorService _qrGeneratorService;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EmitirSelloCommandHandler(
        IProyectoRepository proyectoRepository,
        ISelloIntegridadRepository selloRepository,
        IReporteBuilder reporteBuilder,
        IFirmaDigitalService firmaDigitalService,
        IQrGeneratorService qrGeneratorService,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _selloRepository = selloRepository;
        _reporteBuilder = reporteBuilder;
        _firmaDigitalService = firmaDigitalService;
        _qrGeneratorService = qrGeneratorService;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<EmitirSelloResultDto> Handle(EmitirSelloCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        // RS1: Verificar si ya tiene un sello vigente
        var selloExistente = await _selloRepository.GetByProyectoIdAsync(request.ProyectoId, cancellationToken);
        if (selloExistente != null)
        {
            selloExistente.VerificarVigencia();
            if (selloExistente.Estado == Domain.Enums.EstadoSello.Emitido)
            {
                return new EmitirSelloResultDto
                {
                    IsSuccess = false,
                    Mensaje = "El proyecto ya cuenta con un sello de integridad vigente."
                };
            }
        }

        // RS2: Validar que no existan hallazgos críticos o altos
        var reporte = await _reporteBuilder.ConstruirReporteAsync(request.ProyectoId, cancellationToken);
        if (!reporte.EsAptoParaSello)
        {
            return new EmitirSelloResultDto
            {
                IsSuccess = false,
                Mensaje = "El proyecto no es apto para el sello de integridad debido a hallazgos críticos o altos."
            };
        }

        // RS3: Generar código, firma y QR
        string codigoSello = $"VERIFINCA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        string datosAFirmar = $"{project.Id}|{codigoSello}|{project.IdentificacionCatastral}";
        
        string firmaDigital = await _firmaDigitalService.FirmarDatosAsync(datosAFirmar, cancellationToken);
        
        string urlVerificacion = $"https://verifinca.do/verificar/{codigoSello}";
        string urlQr = await _qrGeneratorService.GenerarQrUrlAsync(urlVerificacion, cancellationToken);

        var nuevoSello = new SelloIntegridad(
            project.Id,
            codigoSello,
            urlQr,
            firmaDigital
        );

        await _selloRepository.AddAsync(nuevoSello, cancellationToken);

        var auditoria = new Auditoria(
            request.UsuarioId,
            "Sello de integridad emitido",
            "Certificacion",
            "SelloIntegridad",
            nuevoSello.Id.ToString(),
            project.Id,
            $"Código: {codigoSello}"
        );
        await _auditoriaRepository.AddAsync(auditoria, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new EmitirSelloResultDto
        {
            IsSuccess = true,
            Mensaje = "Sello de integridad emitido exitosamente.",
            CodigoSello = codigoSello,
            UrlQr = urlQr
        };
    }
}
