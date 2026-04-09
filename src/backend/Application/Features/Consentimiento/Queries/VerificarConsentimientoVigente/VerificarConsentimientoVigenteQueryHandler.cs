namespace Application.Features.Consentimiento.Queries.VerificarConsentimientoVigente;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class VerificarConsentimientoVigenteResultDto
{
    public bool TieneConsentimientoVigente { get; set; }
}

public class VerificarConsentimientoVigenteQueryHandler
{
    private readonly IConsentimientoRepository _consentimientoRepository;

    public VerificarConsentimientoVigenteQueryHandler(IConsentimientoRepository consentimientoRepository)
    {
        _consentimientoRepository = consentimientoRepository;
    }

    public async Task<VerificarConsentimientoVigenteResultDto> Handle(VerificarConsentimientoVigenteQuery request, CancellationToken cancellationToken)
    {
        var vigente = await _consentimientoRepository.GetVigenteByUsuarioIdAsync(request.UsuarioId, cancellationToken);
        
        return new VerificarConsentimientoVigenteResultDto
        {
            TieneConsentimientoVigente = vigente != null
        };
    }
}
