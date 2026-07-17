using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;
using Application.Abstractions.Ocr;

namespace UnitTests.Application.Abstractions.Ocr;

public class IOcrProviderContractTests
{
    private class FakeOcrProvider : IOcrProvider
    {
        public Task<OcrResult> ExtractAsync(Stream fileStream, string contentType, CancellationToken ct)
        {
            if (fileStream == null || fileStream.Length == 0)
            {
                return Task.FromResult(new OcrResult
                {
                    Success = false,
                    ErrorMessage = "Stream is empty or null"
                });
            }

            return Task.FromResult(new OcrResult
            {
                Success = true,
                RawText = "Simulated extracted text",
                Confidence = 0.95,
                Provider = "FakeOCR",
                SourceFile = "test.jpg",
                Lines = new List<OcrLine> 
                { 
                    new OcrLine { Text = "Simulated extracted text", Confidence = 0.95 }
                },
                Fields = new Dictionary<string, OcrField>()
            });
        }

        public Task<IReadOnlyDictionary<string, OcrField>> GetStructuredFieldsAsync(OcrResult result)
        {
            return Task.FromResult<IReadOnlyDictionary<string, OcrField>>(result.Fields);
        }

        public double GetConfidenceScore(OcrResult result)
        {
            return result.Confidence;
        }

        public Task<OcrResult> ProcessDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default)
        {
            return ExtractAsync(documentStream, fileName, cancellationToken);
        }
    }

    [Fact]
    public async Task ExtractAsync_WithValidStream_ReturnsNormalizedOcrResult()
    {
        // Arrange
        var provider = new FakeOcrProvider();
        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        // Act
        var result = await provider.ExtractAsync(stream, "image/jpeg", CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.RawText.Should().Be("Simulated extracted text");
        result.Confidence.Should().BeInRange(0, 1);
        result.Provider.Should().Be("FakeOCR");
    }

    [Fact]
    public async Task ExtractAsync_WithEmptyStream_ReturnsFailedResult()
    {
        // Arrange
        var provider = new FakeOcrProvider();
        using var stream = new MemoryStream(); // Empty

        // Act
        var result = await provider.ExtractAsync(stream, "image/jpeg", CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GetConfidenceScore_ReturnsExpectedValue()
    {
        // Arrange
        var provider = new FakeOcrProvider();
        var result = new OcrResult { Confidence = 0.88 };

        // Act
        var score = provider.GetConfidenceScore(result);

        // Assert
        score.Should().Be(0.88);
    }
}
