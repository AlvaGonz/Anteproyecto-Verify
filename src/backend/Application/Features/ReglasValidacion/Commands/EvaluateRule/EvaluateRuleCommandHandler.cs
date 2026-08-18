namespace Application.Features.ReglasValidacion.Commands.EvaluateRule;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class EvaluateRuleCommandHandler
{
    private readonly IReglaValidacionRepository _repository;

    public EvaluateRuleCommandHandler(IReglaValidacionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ResultadoEvaluacionDto?> Handle(EvaluateRuleCommand request, CancellationToken cancellationToken)
    {
        var regla = await _repository.GetByIdAsync(request.ReglaId, cancellationToken);
        if (regla == null || !regla.Activa)
        {
            return null;
        }

        var supProyecto = request.SuperficieProyecto;
        var supCatastro = request.SuperficieCatastro;

        if (supCatastro <= 0)
        {
            throw new ArgumentException("La superficie oficial de catastro debe ser mayor que cero.", nameof(request.SuperficieCatastro));
        }

        var diferencia = Math.Abs(supProyecto - supCatastro);
        var toleranciaAplicada = diferencia / supCatastro;
        var umbral = regla.ValorUmbral ?? 0.05m;
        var cumple = toleranciaAplicada <= umbral;

        return new ResultadoEvaluacionDto
        {
            ReglaId = regla.Id,
            ReglaNombre = regla.Nombre,
            ReglaCodigo = regla.Codigo,
            Cumple = cumple,
            NivelAlerta = regla.NivelAlerta.ToString(),
            Mensaje = cumple
                ? $"Superficie dentro de tolerancia ({toleranciaAplicada:P2} <= {umbral:P2})"
                : $"Superficie fuera de tolerancia ({toleranciaAplicada:P2} > {umbral:P2})",
            ValorCalculado = Math.Round(toleranciaAplicada, 4),
            ValorUmbral = umbral,
            SuperficieProyecto = supProyecto,
            SuperficieCatastro = supCatastro,
            DiferenciaAbsoluta = diferencia
        };
    }
}
