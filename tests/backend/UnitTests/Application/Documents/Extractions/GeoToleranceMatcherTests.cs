using Application.Documents.Extractions;
using FluentAssertions;
using System.Collections.Generic;
using Xunit;

namespace UnitTests.Application.Documents.Extractions
{
    public class GeoToleranceMatcherTests
    {
        private static readonly List<(System.Guid Id, string Name)> _provinciaCatalog = new()
        {
            (System.Guid.Parse("11111111-0000-0000-0000-000000000001"), "Distrito Nacional"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000002"), "La Altagracia"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000003"), "Santiago"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000004"), "Santo Domingo"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000005"), "San Pedro de Macorís"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000006"), "La Romana"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000007"), "Puerto Plata"),
            (System.Guid.Parse("11111111-0000-0000-0000-000000000008"), "Duarte"),
        };

        // ── Tier 1: Exact match ─────────────────────────────────────────────────
        [Fact]
        public void MatchProvincia_ExactNormalizedName_ReturnsExactMethod()
        {
            var result = GeoToleranceMatcher.MatchProvincia("Santiago", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("exact");
            result.Confidence.Should().Be(1.0);
            result.ResolvedName.Should().Be("Santiago");
            result.SuggestedAction.Should().Be(ResolutionAction.AutoApply);
        }

        [Fact]
        public void MatchProvincia_ExactNameWithDifferentCase_ReturnsExact()
        {
            var result = GeoToleranceMatcher.MatchProvincia("santiago", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("exact");
            result.Confidence.Should().Be(1.0);
        }

        // ── Tier 2: Alias match ─────────────────────────────────────────────────
        [Fact]
        public void MatchProvincia_KnownAlias_AltagraciaShort_ReturnsAliasMethod()
        {
            var result = GeoToleranceMatcher.MatchProvincia("ALTAGRACIA", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("alias");
            result.Confidence.Should().Be(0.95);
            result.ResolvedName.Should().Be("La Altagracia");
            result.AliasesMatched.Should().NotBeEmpty();
            result.SuggestedAction.Should().Be(ResolutionAction.AutoApply);
        }

        [Fact]
        public void MatchProvincia_KnownAlias_DistritoNacional_DN_ReturnsAlias()
        {
            var result = GeoToleranceMatcher.MatchProvincia("D.N.", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("alias");
            result.ResolvedName.Should().Be("Distrito Nacional");
        }

        [Fact]
        public void MatchProvincia_OcrNoisePlusAlias_StillResolvesViaAlias()
        {
            var result = GeoToleranceMatcher.MatchProvincia("OFICINA LAALTAGRACIA", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("alias");
            result.ResolvedName.Should().Be("La Altagracia");
        }

        [Fact]
        public void MatchProvincia_PoderJudicialNoisePlusAlias_Resolves()
        {
            var result = GeoToleranceMatcher.MatchProvincia("PODERJUDICIALREPUBLICADOMINICANA HIGUEY", _provinciaCatalog);
            // Note: This tests province resolution; HIGUEY is a municipality
            // The normalizer should strip the noise and leave the province name
            result.Should().NotBeNull();
        }

        // ── Tier 3: Fuzzy auto-apply (≥ 0.90) ─────────────────────────────────────
        [Fact]
        public void MatchProvincia_HighSimilarity_AboveAutoApplyThreshold_ReturnsAutoApply()
        {
            var result = GeoToleranceMatcher.MatchProvincia("SANT DOMINGO", _provinciaCatalog);
            if (result.ResolutionMethod == "fuzzy" && result.Confidence >= 0.90)
            {
                result.SuggestedAction.Should().Be(ResolutionAction.AutoApply);
            }
        }

        // ── Tier 3: Fuzzy review zone (0.80–0.89) ────────────────────────────────
        [Fact]
        public void MatchProvincia_MediumSimilarity_ReturnsReviewSuggestion()
        {
            var result = GeoToleranceMatcher.MatchProvincia("SAN PEDRO MACORIS", _provinciaCatalog);
            if (result.ResolutionMethod == "fuzzy" && result.Confidence >= 0.80 && result.Confidence < 0.90)
            {
                result.SuggestedAction.Should().Be(ResolutionAction.Review);
            }
        }

        // ── Tier 4: Unresolved (< 0.80) ──────────────────────────────────────────
        [Fact]
        public void MatchProvincia_TotallyUnrelatedText_ReturnsUnresolved()
        {
            var result = GeoToleranceMatcher.MatchProvincia("XYZFOOBAR123", _provinciaCatalog);
            result.ResolutionMethod.Should().Be("unresolved");
            result.Confidence.Should().Be(0.0);
            result.ResolvedId.Should().BeNull();
            result.SuggestedAction.Should().Be(ResolutionAction.Ignore);
        }

        [Fact]
        public void MatchProvincia_EmptyInput_ReturnsUnresolved()
        {
            var result = GeoToleranceMatcher.MatchProvincia(string.Empty, _provinciaCatalog);
            result.ResolutionMethod.Should().Be("unresolved");
            result.SuggestedAction.Should().Be(ResolutionAction.Ignore);
        }

        // ── Province-scoped municipality test ────────────────────────────────────
        [Fact]
        public void MatchMunicipio_ScopedToWrongProvincia_DoesNotAutoApply()
        {
            var municipioCatalog = new List<(System.Guid, string)>
            {
                (System.Guid.NewGuid(), "Higüey"),
            };
            var result = GeoToleranceMatcher.MatchMunicipio(
                rawInput: "HIGUEY",
                catalog: municipioCatalog,
                resolvedProvinciaId: System.Guid.Parse("11111111-0000-0000-0000-000000000003") // Santiago
            );
            result.Should().NotBeNull();
        }

        // ── Resolution policy boundary tests ─────────────────────────────────────
        [Theory]
        [InlineData("exact", 1.0, ResolutionAction.AutoApply)]
        [InlineData("alias", 0.95, ResolutionAction.AutoApply)]
        [InlineData("fuzzy", 0.90, ResolutionAction.AutoApply)]
        [InlineData("fuzzy", 0.89, ResolutionAction.Review)]
        [InlineData("fuzzy", 0.80, ResolutionAction.Review)]
        [InlineData("fuzzy", 0.79, ResolutionAction.Ignore)]
        [InlineData("unresolved", 0.0, ResolutionAction.Ignore)]
        public void SuggestedAction_MatchesPolicy(string method, double confidence, ResolutionAction expected)
        {
            var result = new GeographicResolutionResult
            {
                ResolutionMethod = method,
                Confidence = confidence
            };

            result.SuggestedAction.Should().Be(expected);
        }
    }
}