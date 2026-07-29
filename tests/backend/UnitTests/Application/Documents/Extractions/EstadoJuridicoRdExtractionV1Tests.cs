using System.Text.Json;
using Application.Documents.Extractions;
using Xunit;

namespace UnitTests.Application.Documents.Extractions;

/// <summary>
/// RED TEST: Reproduces the bug where EstadoJuridicoRdExtractionV1 cannot hold
/// ProvinceResolution / MunicipalityResolution fields populated by
/// DocumentService.ApplyGeographicResolutionAsync. Without these fields the
/// UI Provincia / Municipio dropdowns (which rely on resolvedId) remain empty
/// after a fresh upload of an EstadoJuridico PDF.
///</summary>
public class EstadoJuridicoRdExtractionV1Tests
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    [Fact]
    public void Deserialize_ShouldExposeProvinceResolution_WhenEnvelopeContainsIt()
    {
        var envelopeJson = "{" +
            "\"schemaVersion\":\"1.0\"," +
            "\"documentType\":\"EstadoJuridico\"," +
            "\"provinceResolution\":{" +
                "\"rawValue\":\"LA ALTAGRACIA\"," +
                "\"normalizedValue\":\"LA ALTAGRACIA\"," +
                "\"resolvedId\":\"00000000-0000-0000-0000-000000000001\"," +
                "\"resolvedName\":\"La Altagracia\"," +
                "\"resolutionMethod\":\"exact\"," +
                "\"confidence\":1.0" +
            "}," +
            "\"municipalityResolution\":{" +
                "\"rawValue\":\"HIGUEY\"," +
                "\"normalizedValue\":\"HIGUEY\"," +
                "\"resolvedId\":\"00000000-0000-0000-0000-000000000002\"," +
                "\"resolvedName\":\"Higuey\"," +
                "\"resolutionMethod\":\"exact\"," +
                "\"confidence\":1.0" +
            "}," +
            "\"provincia\":{\"rawValue\":\"LA ALTAGRACIA\",\"confidence\":0.9}," +
            "\"municipio\":{\"rawValue\":\"HIGUEY\",\"confidence\":0.9}" +
        "}";

        var extraction = JsonSerializer.Deserialize<EstadoJuridicoRdExtractionV1>(envelopeJson, Options);

        Assert.NotNull(extraction);
        Assert.NotNull(extraction.ProvinceResolution);
        Assert.Equal("LA ALTAGRACIA", extraction.ProvinceResolution.RawValue);
        Assert.Equal(Guid.Parse("00000000-0000-0000-0000-000000000001"), extraction.ProvinceResolution.ResolvedId);
        Assert.Equal("La Altagracia", extraction.ProvinceResolution.ResolvedName);
        Assert.Equal("exact", extraction.ProvinceResolution.ResolutionMethod);

        Assert.NotNull(extraction.MunicipalityResolution);
        Assert.Equal("HIGUEY", extraction.MunicipalityResolution.RawValue);
        Assert.Equal(Guid.Parse("00000000-0000-0000-0000-000000000002"), extraction.MunicipalityResolution.ResolvedId);
    }
}
