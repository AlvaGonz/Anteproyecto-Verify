using Application.Documents.Extractions;
using FluentAssertions;
using Xunit;

namespace UnitTests.Application.Documents.Extractions
{
    public class CertificadoTituloGeoResolutionTests
    {
        [Fact]
        public void CertificadoTituloRdExtractionV1_HasResolutionProperties()
        {
            var extraction = new CertificadoTituloRdExtractionV1();

            // Properties exist and are nullable (default null until populated by GeoResolutionService)
            extraction.ProvinceResolution.Should().BeNull();
            extraction.MunicipalityResolution.Should().BeNull();
        }

        [Fact]
        public void GeographicResolutionResult_IsSerializableWithAllFields()
        {
            var result = new GeographicResolutionResult
            {
                RawValue = "OFICINA LAALTAGRACIA",
                NormalizedValue = "LAALTAGRACIA",
                ResolvedId = Guid.Parse("11111111-0000-0000-0000-000000000002"),
                ResolvedName = "La Altagracia",
                ResolutionMethod = "alias",
                Confidence = 0.95,
                AliasesMatched = new List<string> { "LAALTAGRACIA" },
                Warnings = new List<string>()
            };

            result.RawValue.Should().Be("OFICINA LAALTAGRACIA");
            result.NormalizedValue.Should().Be("LAALTAGRACIA");
            result.ResolvedId.Should().NotBeNull();
            result.ResolvedName.Should().Be("La Altagracia");
            result.ResolutionMethod.Should().Be("alias");
            result.Confidence.Should().Be(0.95);
            result.AliasesMatched.Should().Contain("LAALTAGRACIA");
            result.SuggestedAction.Should().Be(ResolutionAction.AutoApply);
        }

        [Fact]
        public void GeographicResolutionResult_Unresolved_HasCorrectDefaults()
        {
            var result = GeographicResolutionResult.Unresolved("XYZ", "XYZ");

            result.RawValue.Should().Be("XYZ");
            result.NormalizedValue.Should().Be("XYZ");
            result.ResolutionMethod.Should().Be("unresolved");
            result.Confidence.Should().Be(0.0);
            result.ResolvedId.Should().BeNull();
            result.ResolvedName.Should().BeNull();
            result.SuggestedAction.Should().Be(ResolutionAction.Ignore);
        }

        [Theory]
        [InlineData("exact", 1.0, ResolutionAction.AutoApply)]
        [InlineData("alias", 0.95, ResolutionAction.AutoApply)]
        [InlineData("fuzzy", 0.92, ResolutionAction.AutoApply)]
        [InlineData("fuzzy", 0.85, ResolutionAction.Review)]
        [InlineData("fuzzy", 0.75, ResolutionAction.Ignore)]
        [InlineData("unresolved", 0.0, ResolutionAction.Ignore)]
        public void SuggestedAction_DerivedFromMethodAndConfidence(
            string method, double confidence, ResolutionAction expectedAction)
        {
            var result = new GeographicResolutionResult
            {
                ResolutionMethod = method,
                Confidence = confidence
            };

            result.SuggestedAction.Should().Be(expectedAction);
        }
    }
}