namespace UnitTests;

using System;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Xunit;

public class ReglaValidacionDomainTests
{
    [Fact]
    public void CreateReglaValidacion_WithValidUmbral_ShouldSucceed()
    {
        var regla = new ReglaValidacion(
            nombre: "Tolerancia Superficie vs Mensura",
            descripcion: "Valida que la diferencia de superficie no exceda la tolerancia",
            condicionLogica: "Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= ValorUmbral",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            valorUmbral: 0.05m,
            minValor: 0.01m,
            maxValor: 0.20m,
            expresion: "|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia",
            codigo: "RULE-008-SUPERFICIE"
        );

        Assert.Equal("Tolerancia Superficie vs Mensura", regla.Nombre);
        Assert.Equal(0.05m, regla.ValorUmbral);
        Assert.Equal(0.01m, regla.MinValor);
        Assert.Equal(0.20m, regla.MaxValor);
        Assert.True(regla.Activa);
    }

    [Fact]
    public void CreateReglaValidacion_WithUmbralBelowMin_ShouldThrowDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new ReglaValidacion(
                nombre: "Tolerancia",
                descripcion: "Desc",
                condicionLogica: "cond",
                tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
                nivelAlerta: NivelAlerta.Media,
                tipoProyecto: TipoProyecto.Residencial,
                creadaPor: Guid.NewGuid(),
                valorUmbral: 0.005m, // Below 0.01
                minValor: 0.01m,
                maxValor: 0.20m
            )
        );
    }

    [Fact]
    public void CreateReglaValidacion_WithUmbralAboveMax_ShouldThrowDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new ReglaValidacion(
                nombre: "Tolerancia",
                descripcion: "Desc",
                condicionLogica: "cond",
                tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
                nivelAlerta: NivelAlerta.Media,
                tipoProyecto: TipoProyecto.Residencial,
                creadaPor: Guid.NewGuid(),
                valorUmbral: 0.25m, // Above 0.20
                minValor: 0.01m,
                maxValor: 0.20m
            )
        );
    }

    [Fact]
    public void Update_WithValidUmbral_ShouldUpdatePropertiesAndIncrementVersion()
    {
        var regla = new ReglaValidacion(
            nombre: "Tolerancia Inicial",
            descripcion: "Desc",
            condicionLogica: "cond",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            version: 1,
            valorUmbral: 0.05m,
            minValor: 0.01m,
            maxValor: 0.20m
        );

        regla.Update(
            nombre: "Tolerancia Modificada",
            descripcion: "Desc Actualizada",
            condicionLogica: "cond2",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Alta,
            tipoProyecto: TipoProyecto.Residencial,
            valorUmbral: 0.08m
        );

        Assert.Equal("Tolerancia Modificada", regla.Nombre);
        Assert.Equal(0.08m, regla.ValorUmbral);
        Assert.Equal(NivelAlerta.Alta, regla.NivelAlerta);
        Assert.Equal(2, regla.Version);
        Assert.NotNull(regla.UpdatedAtUtc);
    }

    [Fact]
    public void Update_WithInvalidUmbral_ShouldThrowDomainExceptionAndKeepState()
    {
        var regla = new ReglaValidacion(
            nombre: "Tolerancia Inicial",
            descripcion: "Desc",
            condicionLogica: "cond",
            tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
            nivelAlerta: NivelAlerta.Media,
            tipoProyecto: TipoProyecto.Residencial,
            creadaPor: Guid.NewGuid(),
            version: 1,
            valorUmbral: 0.05m,
            minValor: 0.01m,
            maxValor: 0.20m
        );

        Assert.Throws<DomainException>(() =>
            regla.Update(
                nombre: "Tolerancia Fallida",
                descripcion: "Desc",
                condicionLogica: "cond",
                tipoDocumentoAplicable: DocumentType.PlanoMensuraCatastral,
                nivelAlerta: NivelAlerta.Media,
                tipoProyecto: TipoProyecto.Residencial,
                valorUmbral: 0.30m // > 0.20
            )
        );

        Assert.Equal(0.05m, regla.ValorUmbral);
        Assert.Equal(1, regla.Version);
    }
}
