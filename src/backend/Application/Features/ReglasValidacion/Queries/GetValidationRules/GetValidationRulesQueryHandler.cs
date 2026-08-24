namespace Application.Features.ReglasValidacion.Queries.GetValidationRules;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class GetValidationRulesQueryHandler
{
    private readonly IReglaValidacionRepository _repository;

    public GetValidationRulesQueryHandler(IReglaValidacionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ReglaValidacionDto>> Handle(GetValidationRulesQuery request, CancellationToken cancellationToken)
    {
        var reglas = await _repository.GetAllAsync(request.Page, request.PageSize, cancellationToken);

        return reglas.Select(r => new ReglaValidacionDto
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
        });
    }
}
