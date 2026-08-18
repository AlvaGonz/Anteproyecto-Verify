namespace UnitTests.Application.Features.ReglasValidacion;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.ReglasValidacion.Commands.EvaluateRule;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class EvaluateRuleCommandHandlerTests
{
    private readonly Mock<IReglaValidacionRepository> _repositoryMock;
    private readonly EvaluateRuleCommandHandler _handler;

    public EvaluateRuleCommandHandlerTests()
    {
        _repositoryMock = new Mock<IReglaValidacionRepository>();
        _handler = new EvaluateRuleCommandHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenSuperficieWithinTolerance_ShouldReturnCumpleTrue()
    {
        var ruleId = Guid.NewGuid();
        var regla = new ReglaValidacion(
            nombre: "Tolerancia Superficie vs Mensura",
            descripcion: "Desc",
            condicionLogica: "Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= ValorUmbral",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            valorUmbral: 0.05m,
            minValor: 0.01m,
            maxValor: 0.20m,
            codigo: "RULE-008-SUPERFICIE",
            id: ruleId
        );

        _repositoryMock
            .Setup(r => r.GetByIdAsync(ruleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(regla);

        var command = new EvaluateRuleCommand
        {
            ReglaId = ruleId,
            ProyectoId = Guid.NewGuid(),
            SuperficieProyecto = 1040m,
            SuperficieCatastro = 1000m
        };

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.Cumple);
        Assert.Equal(0.04m, result.ValorCalculado);
        Assert.Equal(0.05m, result.ValorUmbral);
        Assert.Contains("dentro de tolerancia", result.Mensaje);
    }

    [Fact]
    public async Task Handle_WhenSuperficieExceedsTolerance_ShouldReturnCumpleFalse()
    {
        var ruleId = Guid.NewGuid();
        var regla = new ReglaValidacion(
            nombre: "Tolerancia Superficie vs Mensura",
            descripcion: "Desc",
            condicionLogica: "Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= ValorUmbral",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            valorUmbral: 0.05m,
            minValor: 0.01m,
            maxValor: 0.20m,
            codigo: "RULE-008-SUPERFICIE",
            id: ruleId
        );

        _repositoryMock
            .Setup(r => r.GetByIdAsync(ruleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(regla);

        var command = new EvaluateRuleCommand
        {
            ReglaId = ruleId,
            ProyectoId = Guid.NewGuid(),
            SuperficieProyecto = 1100m,
            SuperficieCatastro = 1000m
        };

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.Cumple);
        Assert.Equal(0.10m, result.ValorCalculado);
        Assert.Equal(0.05m, result.ValorUmbral);
        Assert.Contains("fuera de tolerancia", result.Mensaje);
    }

    [Fact]
    public async Task Handle_WhenCatastroSuperficieIsZero_ShouldThrowArgumentException()
    {
        var ruleId = Guid.NewGuid();
        var regla = new ReglaValidacion(
            nombre: "Tolerancia",
            descripcion: "Desc",
            condicionLogica: "cond",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            valorUmbral: 0.05m,
            id: ruleId
        );

        _repositoryMock
            .Setup(r => r.GetByIdAsync(ruleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(regla);

        var command = new EvaluateRuleCommand
        {
            ReglaId = ruleId,
            ProyectoId = Guid.NewGuid(),
            SuperficieProyecto = 1000m,
            SuperficieCatastro = 0m
        };

        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
    }
}
