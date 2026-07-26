using Application.Documents.Extractions;
using FluentAssertions;
using Xunit;

namespace UnitTests.Application.Documents.Extractions
{
    public class GeoTextNormalizerTests
    {
        [Theory]
        [InlineData("  LA ALTAGRACIA  ", "LA ALTAGRACIA")]
        [InlineData("LA\tALTAGRACIA\n", "LA ALTAGRACIA")]
        [InlineData("la altagracia", "LA ALTAGRACIA")]
        public void Normalize_WhitespaceAndCase_ReturnsUppercaseSingleSpaced(string input, string expected)
        {
            var result = GeoTextNormalizer.Normalize(input);
            result.Should().Be(expected);
        }

        [Fact]
        public void Normalize_RemovesDiacritics()
        {
            var result = GeoTextNormalizer.Normalize("Higüey");
            result.Should().Be("HIGUEY");
        }

        [Theory]
        [InlineData("SANTO DOMINGO", "SANTO DOMINGO")]
        [InlineData("STO. DOMINGO", "SANTO DOMINGO")]
        [InlineData("STO DOMINGO", "SANTO DOMINGO")]
        [InlineData("STO. DGO.", "SANTO DOMINGO")]
        public void Normalize_ExpandsSantoAbbreviation(string input, string expected)
        {
            var result = GeoTextNormalizer.Normalize(input);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("STA. CRUZ", "SANTA CRUZ")]
        [InlineData("STA CRUZ", "SANTA CRUZ")]
        public void Normalize_ExpandsSantaAbbreviation(string input, string expected)
        {
            var result = GeoTextNormalizer.Normalize(input);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("OFICINA LA ALTAGRACIA", "LA ALTAGRACIA")]
        [InlineData("OFICINA LAALTAGRACIA", "LAALTAGRACIA")]
        [InlineData("PODER JUDICIAL REPUBLICA DOMINICANA HIGUEY", "HIGUEY")]
        [InlineData("PODERJUDICIALREPUBLICADOMINICANA HIGUEY", "HIGUEY")]
        [InlineData("REPUBLICA DOMINICANA SANTIAGO", "SANTIAGO")]
        [InlineData("PODER JUDICIAL SANTIAGO", "SANTIAGO")]
        [InlineData("REPUBLICA DOMINICANA", "")]
        [InlineData("PODER JUDICIAL REPUBLICA DOMINICANA", "")]
        public void Normalize_StripsKnownOcrNoisePrefixes(string input, string expected)
        {
            var result = GeoTextNormalizer.Normalize(input);
            result.Should().Be(expected);
        }

        [Fact]
        public void Normalize_HandlesMixedNoiseAndAbbreviation()
        {
            var result = GeoTextNormalizer.Normalize("OFICINA STO. DOMINGO");
            result.Should().Be("SANTO DOMINGO");
        }

        [Fact]
        public void Normalize_NullOrEmpty_ReturnsEmptyString()
        {
            GeoTextNormalizer.Normalize(null).Should().Be(string.Empty);
            GeoTextNormalizer.Normalize("").Should().Be(string.Empty);
            GeoTextNormalizer.Normalize("   ").Should().Be(string.Empty);
        }

        [Fact]
        public void Normalize_PreservesNonNoiseContent()
        {
            var result = GeoTextNormalizer.Normalize("SAN PEDRO DE MACORIS");
            result.Should().Be("SAN PEDRO DE MACORIS");
        }

        [Fact]
        public void Normalize_RemovesMultipleSpacesAndTabs()
        {
            var result = GeoTextNormalizer.Normalize("LA    ALTAGRACIA\t\t");
            result.Should().Be("LA ALTAGRACIA");
        }

        [Fact]
        public void Normalize_HandlesAccentedCharactersInProvinceNames()
        {
            GeoTextNormalizer.Normalize("San José de Ocoa").Should().Be("SAN JOSE DE OCOA");
            GeoTextNormalizer.Normalize("María Trinidad Sánchez").Should().Be("MARIA TRINIDAD SANCHEZ");
            GeoTextNormalizer.Normalize("Elías Piña").Should().Be("ELIAS PINA");
        }

        [Fact]
        public void Normalize_RemovesPunctuationNoise()
        {
            GeoTextNormalizer.Normalize("LA ALTAGRACIA.").Should().Be("LA ALTAGRACIA");
            GeoTextNormalizer.Normalize("LA, ALTAGRACIA").Should().Be("LA ALTAGRACIA");
        }
    }
}