namespace Application.Features.Consentimiento.Queries.VerificarConsentimientoVigente;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Common;

public class VerificarConsentimientoVigenteResultDto
{
    public bool TieneConsentimientoVigente { get; set; }
}

public class VerificarConsentimientoVigenteQueryHandler
{
    private readonly IConsentimientoRepository _consentimientoRepository;

    // Current privacy policy version — increment when terms change (requires re-consent)

    public VerificarConsentimientoVigenteQueryHandler(IConsentimientoRepository consentimientoRepository)
    {
        _consentimientoRepository = consentimientoRepository;
    }

    public async Task<VerificarConsentimientoVigenteResultDto> Handle(VerificarConsentimientoVigenteQuery request, CancellationToken cancellationToken)
    {
        var vigente = await _consentimientoRepository.GetVigenteByUsuarioIdAsync(request.UsuarioId, cancellationToken);
        
        // COMP-001 Gate: consent must exist AND be under current policy version
        var tieneConsentimiento = vigente != null && vigente.VersionPolitica == ConsentGateConstants.CurrentVersionPolitica;
        
        return new VerificarConsentimientoVigenteResultDto
        {
            TieneConsentimientoVigente = tieneConsentimiento
        };
    }
}
