using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
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

        // Set up the mocked call return value using default/null as the value is ignored by our service anyway
        _ = _fakeResend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));

        var inMemorySettings = new Dictionary<string, string?> {
            {"Resend:ApiToken", "fake-token"},
            {"Resend:FromEmail", "noreply@verifinca.com"},
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

    [Fact]
    public async Task SendEmailAsync_SendsMessageWithCorrectValues()
    {
        // Arrange
        string to = "test@example.com";
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
        Assert.Equal("noreply@verifinca.com", capturedMsg!.From.Email);
        Assert.Equal("VeriFinca Test", capturedMsg.From.DisplayName);
        Assert.Equal(subject, capturedMsg.Subject);
        Assert.Equal(body, capturedMsg.HtmlBody);
        Assert.Contains(capturedMsg.To, addr => addr.Email == to);
    }

    [Fact]
    public async Task SendAccountVerificationAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@example.com";
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
        Assert.Contains("Verificación de Cuenta", capturedMsg.Subject);
        Assert.Contains("John Doe", capturedMsg.HtmlBody);
        Assert.Contains("token123", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentUploadConfirmationAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@example.com";
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
        Assert.Contains("Confirmación de Recepción de Documento", capturedMsg.Subject);
        Assert.Contains("My Estate", capturedMsg.HtmlBody);
        Assert.Contains("Title", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentStatusUpdateAsync_Approved_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@example.com";
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
        Assert.Contains("Estatus de Documento Actualizado", capturedMsg.Subject);
        Assert.Contains("badge-verified", capturedMsg.HtmlBody);
        Assert.Contains("Verificado / Aprobado", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendDocumentStatusUpdateAsync_Rejected_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@example.com";
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
        Assert.Contains("Estatus de Documento Actualizado", capturedMsg.Subject);
        Assert.Contains("badge-rejected", capturedMsg.HtmlBody);
        Assert.Contains("Missing signature", capturedMsg.HtmlBody);
    }

    [Fact]
    public async Task SendProjectCreatedAsync_UsesCorrectTemplate()
    {
        // Arrange
        string to = "user@example.com";
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
        Assert.Contains("¡Tu Proyecto ha sido Creado!", capturedMsg.Subject);
        Assert.Contains("My Estate", capturedMsg.HtmlBody);
        Assert.Contains("proj-123", capturedMsg.HtmlBody);
    }
}
