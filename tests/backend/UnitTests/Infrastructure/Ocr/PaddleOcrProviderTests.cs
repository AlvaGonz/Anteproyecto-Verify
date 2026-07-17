using System.IO;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Infrastructure.Ocr;
using Moq;
using Moq.Protected;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace UnitTests.Infrastructure.Ocr;

public class PaddleOcrProviderTests
{
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
    private readonly HttpClient _httpClient;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<PaddleOcrProvider>> _loggerMock;
    private readonly PaddleOcrProvider _provider;

    public PaddleOcrProviderTests()
    {
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_httpMessageHandlerMock.Object);
        _configurationMock = new Mock<IConfiguration>();
        _configurationMock.Setup(c => c["Ocr:PaddleOcrBaseUrl"]).Returns("http://localhost:8000");
        _loggerMock = new Mock<ILogger<PaddleOcrProvider>>();
        
        _provider = new PaddleOcrProvider(_httpClient, _configurationMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task ProcessDocumentAsync_ReturnsSuccessResult_OnValidResponse()
    {
        // Arrange
        var mockResponse = new
        {
            Success = true,
            ExtractedText = "Test Document",
            RawJson = "{\"score\": 0.99}"
        };

        var responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(mockResponse))
        };

        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(responseMessage);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        // Act
        var result = await _provider.ProcessDocumentAsync(stream, "test.pdf");

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.ExtractedText.Should().Be("Test Document");
        result.Confidence.Should().Be(0.9);
    }

    [Fact]
    public async Task ProcessDocumentAsync_ReturnsFailureResult_OnApiError()
    {
        // Arrange
        var responseMessage = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Internal Server Error")
        };

        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(responseMessage);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        // Act
        var result = await _provider.ProcessDocumentAsync(stream, "test.pdf");

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.ExtractedText.Should().BeEmpty();
    }
}
