namespace Tests.Unit.Domain;

using global::Domain.Enums;
using Xunit;

public class ProjectStatusCodesTests
{
    [Theory]
    [InlineData(ProjectStatus.Creado, "CREADO")]
    [InlineData(ProjectStatus.Editado, "EDITADO")]
    [InlineData(ProjectStatus.Revision, "REVISION")]
    [InlineData(ProjectStatus.ConObservacion, "OBSERVACION")]
    [InlineData(ProjectStatus.Publicado, "PUBLICADO")]
    public void ToCodigoUnico_MapsEnumToCanonicalDbCode(ProjectStatus status, string expected)
    {
        Assert.Equal(expected, status.ToCodigoUnico());
    }

    [Theory]
    [InlineData("CREADO", ProjectStatus.Creado)]
    [InlineData("editado", ProjectStatus.Editado)]
    [InlineData("REVISION", ProjectStatus.Revision)]
    [InlineData("OBSERVACION", ProjectStatus.ConObservacion)]
    [InlineData("PUBLICADO", ProjectStatus.Publicado)]
    [InlineData("Editado", ProjectStatus.Editado)]
    public void TryParseCodigoUnico_AcceptsCanonicalAndLegacyNames(string codigo, ProjectStatus expected)
    {
        Assert.True(ProjectStatusCodes.TryParseCodigoUnico(codigo, out var status));
        Assert.Equal(expected, status);
    }

    [Fact]
    public void TryParseCodigoUnico_RejectsUnknown()
    {
        Assert.False(ProjectStatusCodes.TryParseCodigoUnico("RECHAZADO", out _));
    }
}
