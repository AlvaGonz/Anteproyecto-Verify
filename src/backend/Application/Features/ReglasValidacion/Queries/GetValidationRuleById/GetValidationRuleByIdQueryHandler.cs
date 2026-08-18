namespace Application.Features.ReglasValidacion.Queries.GetValidationRuleById;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.ReglasValidacion.Queries.GetValidationRules;

public class GetValidationRuleByIdQueryHandler
{
    private readonly IReglaValidacionRepository _repository;

    public GetValidationRuleByIdQueryHandler(IReglaValidacionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReglaValidacionDto?> Handle(GetValidationRuleByIdQuery request, CancellationToken cancellationToken)
    {
        var r = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (r == null) return null;

        return new ReglaValidacionDto
        {
            Id = r.Id,
            Codigo = r.Codigo,
            Nombre = r.Nombre,
            Descripcion = r.Descripcion,
            CondicionLogica = r.CondicionLogica,
            Expresion = r.Expresion,
            ValorUmbral = r.ValorUmbral,
            MinValor = r.MinValor,
            MaxValor = r.MaxValor,
            TipoDocumentoAplicable = r.TipoDocumentoAplicable.ToString(),
            NivelAlerta = r.NivelAlerta.ToString(),
            TipoProyecto = r.TipoProyecto.ToString(),
            Activa = r.Activa,
            Version = r.Version,
            FechaCreacionUtc = r.FechaCreacionUtc,
            RowVersion = r.RowVersion != null ? Convert.ToBase64String(r.RowVersion) : null
        };
    }
}
