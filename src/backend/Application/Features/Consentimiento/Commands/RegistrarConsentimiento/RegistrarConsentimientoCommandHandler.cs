namespace Application.Features.Consentimiento.Commands.RegistrarConsentimiento;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.Extensions.Configuration;

public class RegistrarConsentimientoResultDto
{
    public Guid ConsentimientoId { get; set; }
    public bool IsSuccess { get; set; }
}

public class RegistrarConsentimientoCommandHandler
{
    private readonly IConsentimientoRepository _consentimientoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly int _vigenciaDias;

    public RegistrarConsentimientoCommandHandler(
        IConsentimientoRepository consentimientoRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _consentimientoRepository = consentimientoRepository;
        _unitOfWork = unitOfWork;
        _vigenciaDias = configuration.GetValue<int>("Consentimiento:VigenciaDias", 30);
    }

    public async Task<RegistrarConsentimientoResultDto> Handle(RegistrarConsentimientoCommand request, CancellationToken cancellationToken)
    {
        // Invalidar consentimientos anteriores vigentes
        var vigente = await _consentimientoRepository.GetVigenteByUsuarioIdAsync(request.UsuarioId, cancellationToken);
        if (vigente != null)
        {
            vigente.Revocar();
            _consentimientoRepository.Update(vigente);
        }

        var nuevoConsentimiento = new ConsentimientoFinanciero(
            request.UsuarioId,
            request.IpOrigen,
            request.VersionPolitica,
            _vigenciaDias
        );

        await _consentimientoRepository.AddAsync(nuevoConsentimiento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegistrarConsentimientoResultDto
        {
            ConsentimientoId = nuevoConsentimiento.Id,
            IsSuccess = true
        };
    }
}
