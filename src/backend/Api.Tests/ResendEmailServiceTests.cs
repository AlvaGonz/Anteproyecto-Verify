using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Infrastructure.Email;
using Resend;
using NSubstitute;
using Xunit;

namespace Api.Tests;

public class ResendEmailServiceTests
{
    private readonly IResend _fakeResend;
    private readonly IConfiguration _configuration;
    private readonly ResendEmailService _sut;

    public ResendEmailServiceTests()
    {
        _fakeResend = Substitute.For<IResend>();

        _ = _fakeResend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));

        var inMemorySettings = new Dictionary<string, string?> {
            {"Resend:ApiToken", "fake-token"},
            {"Resend:FromEmail", "hola@verifinca.com"},
            {"Resend:FromName", "VeriFinca Test"}
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _sut = new ResendEmailService(
            _fakeResend,
            _configuration,
            NullLogger<ResendEmailService>.Instance
        );
    }

    private static (ResendEmailService sut, TestLogger<ResendEmailService> logger) CreateSutWithLogger(string apiToken = "re_prod_valid-token-not-mock")
    {
        var fakeResend = Substitute.For<IResend>();
        _ = fakeResend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));

        var inMemorySettings = new Dictionary<string, string?> {
            {"Resend:ApiToken", apiToken},
            {"Resend:FromEmail", "hola@verifinca.com"},
            {"Resend:FromName", "VeriFinca Test"}
        };
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var logger = new TestLogger<ResendEmailService>();
        var sut = new ResendEmailService(fakeResend, config, logger);
        return (sut, logger);
    }

    [Fact]
    public async Task SendEmailAsync_SendsMessageWithCorrectValues()
    {
        // Arrange
        string to = "test@verifinca.test";
        string subject = "Test Subject";
        string body = "Test Body";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendEmailAsync(to, subject, body);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Equal("hola@verifinca.com", capturedMsg!.From.Email);
        Assert.Equal("VeriFinca Test", capturedMsg.From.DisplayName);
        Assert.Equal(subject, capturedMsg.Subject);
        Assert.Equal(body, capturedMsg.HtmlBody);
        Assert.Contains(capturedMsg.To, addr => addr.Email == to);
    }

    [Fact]
    public async Task SendAccountVerificationAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@verifinca.test";
        string userName = "John Doe";
        string token = "token123";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendAccountVerificationAsync(to, userName, token);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Contains(capturedMsg!.To, addr => addr.Email == to);
        Assert.Equal("hola@handymansolutionrd.lat", capturedMsg.From.Email);
        Assert.Contains("Verificación de Cuenta", capturedMsg.Subject);
        Assert.Contains("John Doe", capturedMsg.HtmlBody);
        Assert.Contains("token123", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentUploadConfirmationAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@verifinca.test";
        string userName = "John Doe";
        string projectName = "My Estate";
        string docType = "Title";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendDocumentUploadConfirmationAsync(to, userName, projectName, docType);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Contains(capturedMsg!.To, addr => addr.Email == to);
        Assert.Equal("notificaciones@handymansolutionrd.lat", capturedMsg.From.Email);
        Assert.Contains("Confirmación de Recepción de Documento", capturedMsg.Subject);
        Assert.Contains("My Estate", capturedMsg.HtmlBody);
        Assert.Contains("Title", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentStatusUpdateAsync_Approved_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@verifinca.test";
        string userName = "John Doe";
        string projectName = "My Estate";
        string docType = "Title";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendDocumentStatusUpdateAsync(to, userName, projectName, docType, "verificado", null);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Contains(capturedMsg!.To, addr => addr.Email == to);
        Assert.Equal("notificaciones@handymansolutionrd.lat", capturedMsg.From.Email);
        Assert.Contains("Estatus de Documento Actualizado", capturedMsg.Subject);
        Assert.Contains("badge-verified", capturedMsg.HtmlBody);
        Assert.Contains("Verificado / Aprobado", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentStatusUpdateAsync_Rejected_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@verifinca.test";
        string userName = "John Doe";
        string projectName = "My Estate";
        string docType = "Title";
        string reason = "Missing signature";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendDocumentStatusUpdateAsync(to, userName, projectName, docType, "rechazado", reason);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Contains(capturedMsg!.To, addr => addr.Email == to);
        Assert.Equal("notificaciones@handymansolutionrd.lat", capturedMsg.From.Email);
        Assert.Contains("Estatus de Documento Actualizado", capturedMsg.Subject);
        Assert.Contains("badge-rejected", capturedMsg.HtmlBody);
        Assert.Contains("Missing signature", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendProjectCreatedAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@verifinca.test";
        string userName = "John Doe";
        string projectName = "My Estate";
        string id = "proj-123";

        EmailMessage? capturedMsg = null;
        _ = _fakeResend.EmailSendAsync(
            Arg.Do<EmailMessage>(msg => capturedMsg = msg),
            Arg.Any<CancellationToken>()
        );

        // Act
        await _sut.SendProjectCreatedAsync(to, userName, projectName, id);

        // Assert
        Assert.NotNull(capturedMsg);
        Assert.Contains(capturedMsg!.To, addr => addr.Email == to);
        Assert.Equal("notificaciones@handymansolutionrd.lat", capturedMsg.From.Email);
        Assert.Contains("¡Tu Proyecto ha sido Creado!", capturedMsg.Subject);
        Assert.Contains("My Estate", capturedMsg.HtmlBody);
        Assert.Contains("proj-123", capturedMsg.HtmlBody);
    }

    // ──────────────────────────────────────────────
    // TDD RED: Error handling tests (these MUST fail before implementation)
    // ──────────────────────────────────────────────

    [Fact]
    public async Task SendEmailAsync_WhenResendThrows_LogsErrorWithStructuredContext()
    {
        // Arrange
        var (sut, logger) = CreateSutWithLogger();
        var fakeResend = Substitute.For<IResend>();
        _ = fakeResend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));

        // Override _resend via reflection to inject the throwing mock
        var resendField = typeof(ResendEmailService).GetField("_resend",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
        var originalResend = resendField.GetValue(sut);

        // Make Resend throw a simulated ResendException
        var resendEx = new Exception("API key is invalid");
        resendField.SetValue(sut, ThrowingResend(resendEx));

        try
        {
            // Act
            await sut.SendEmailAsync("user@realdomain.com", "Test Subject", "<p>Body</p>");

            // Assert: LogError was called
            Assert.True(logger.Errors.Count > 0, "Expected at least one LogError call when Resend throws");

            var errorEntry = logger.Errors[0];

            // FAILING assertions — these will fail until structured logging is implemented
            Assert.Contains("CorrelationId", errorEntry.State?.ToString() ?? "",
                "Error log MUST include CorrelationId for tracing");
            Assert.Contains("StatusCode", errorEntry.State?.ToString() ?? "",
                "Error log MUST include HTTP status code from Resend");
            Assert.Contains("RecipientHash", errorEntry.State?.ToString() ?? "",
                "Error log MUST include recipient hash (Ley 172-13)");
            Assert.Contains("[RESEND_FAILURE]", errorEntry.Message ?? "",
                "Error log MUST include [RESEND_FAILURE] marker");
        }
        finally
        {
            resendField.SetValue(sut, originalResend);
        }
    }

    [Fact]
    public async Task SendEmailAsync_WhenResendThrows_SurfacesFailureInsteadOfSwallowing()
    {
        // Arrange
        var (sut, logger) = CreateSutWithLogger();
        var resendEx = new Exception("Simulated provider failure");

        var resendField = typeof(ResendEmailService).GetField("_resend",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
        var originalResend = resendField.GetValue(sut);
        resendField.SetValue(sut, ThrowingResend(resendEx));

        bool exceptionSurfaced = false;
        try
        {
            // Act: this should NOT silently swallow — it should either throw or return a typed failure
            await sut.SendEmailAsync("user@realdomain.com", "Test", "<p>Body</p>");
        }
        catch
        {
            exceptionSurfaced = true;
        }
        finally
        {
            resendField.SetValue(sut, originalResend);
        }

        // Assert: exception surfaced OR typed error result was returned
        // FAILING: current code swallows all exceptions silently
        Assert.True(
            exceptionSurfaced || logger.Errors.Any(e =>
                (e.Message ?? "").Contains("[RESEND_FAILURE]") &&
                (e.State?.ToString() ?? "").Contains("Success") &&
                (e.State?.ToString() ?? "").Contains("False")),
            "Resend failure MUST surface as either an exception OR a typed failure result. Current code swallows silently."
        );
    }

    [Fact]
    public async Task SendEmailAsync_WhenSuccessful_LogsAtInformationWithCorrelationId()
    {
        // Arrange
        var (sut, logger) = CreateSutWithLogger();
        var resendField = typeof(ResendEmailService).GetField("_resend",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
        var originalResend = resendField.GetValue(sut);

        var successFake = Substitute.For<IResend>();
        _ = successFake.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));
        resendField.SetValue(sut, successFake);

        try
        {
            // Act
            await sut.SendEmailAsync("user@realdomain.com", "Subject", "<p>Body</p>");

            // Assert: success is logged
            var infoLogs = logger.InformationEntries
                .Where(e => (e.Message ?? "").Contains("successfully") ||
                            (e.Message ?? "").Contains("sent"))
                .ToList();

            Assert.True(infoLogs.Count > 0, "Expected at least one success log entry");

            // FAILING: correlationId not yet implemented on success path either
            var successEntry = infoLogs[0];
            Assert.Contains("CorrelationId", successEntry.State?.ToString() ?? "",
                "Success log MUST include CorrelationId for traceability");
        }
        finally
        {
            resendField.SetValue(sut, originalResend);
        }
    }

    [Fact]
    public async Task SendEmailOtpAsync_WhenResendThrows_DoesNotSwallow()
    {
        // Arrange
        var (sut, logger) = CreateSutWithLogger();
        var resendEx = new Exception("OTP provider failure");

        var resendField = typeof(ResendEmailService).GetField("_resend",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
        var originalResend = resendField.GetValue(sut);
        resendField.SetValue(sut, ThrowingResend(resendEx));

        bool exceptionSurfaced = false;
        try
        {
            // Act
            await sut.SendEmailOtpAsync("user@realdomain.com", "John", "123456");
        }
        catch
        {
            exceptionSurfaced = true;
        }
        finally
        {
            resendField.SetValue(sut, originalResend);
        }

        // Assert: OTP send MUST NOT swallow — it already bubbles per the contract
        Assert.True(exceptionSurfaced,
            "SendEmailOtpAsync MUST surface provider failures. This test exists to prevent regression.");
    }

    private static IResend ThrowingResend(Exception ex)
    {
        var fake = Substitute.For<IResend>();
        _ = fake.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<ResendResponse<Guid>>(ex));
        return fake;
    }
}

internal sealed class TestLogger<T> : ILogger<T>
{
    public readonly List<LogEntry> Errors = new();
    public readonly List<LogEntry> InformationEntries = new();
    public readonly List<LogEntry> All = new();

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
    public bool IsEnabled(LogLevel logLevel) => true;
    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        var entry = new LogEntry(logLevel, formatter(state, exception), state?.ToString(), exception);
        All.Add(entry);
        if (logLevel == LogLevel.Error)
            Errors.Add(entry);
        if (logLevel == LogLevel.Information)
            InformationEntries.Add(entry);
    }

    public sealed record LogEntry(LogLevel Level, string Message, string? State, Exception? Exception);
}
