using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Features.Auth.Commands.ResendVerificationEmail;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using Xunit;

namespace UnitTests.Application;

public class ResendVerificationEmailTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IValidator<ResendVerificationEmailCommand>> _validatorMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly ResendVerificationEmailCommandHandler _handler;

    public ResendVerificationEmailTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _validatorMock = new Mock<IValidator<ResendVerificationEmailCommand>>();
        _emailServiceMock = new Mock<IEmailService>();

        _handler = new ResendVerificationEmailCommandHandler(
            _usuarioRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _validatorMock.Object,
            _emailServiceMock.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldReturnSuccess_WhenEmailDoesNotExist_ToPreventEnumeration()
    {
        // Arrange
        var command = new ResendVerificationEmailCommand("notfound@example.com", "/checkout");
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _usuarioRepositoryMock.Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        _emailServiceMock.Verify(e => e.SendAccountVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldReturnError_WhenUserAlreadyVerified()
    {
        // Arrange
        var command = new ResendVerificationEmailCommand("verified@example.com", "/checkout");
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        
        var user = new Usuario("Juan", "Perez", "verified@example.com", "hash", UserRole.User, "8095550199", "40212345678");
        user.VerificarEmail(); // Make it verified

        _usuarioRepositoryMock.Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("ya está verificada", result.ErrorMessage);
    }

    [Fact]
    public async Task Handle_ShouldGenerateNewTokenAndSendEmail_WhenUserNotVerified()
    {
        // Arrange
        var command = new ResendVerificationEmailCommand("unverified@example.com", "/checkout");
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        
        var user = new Usuario("Juan", "Perez", "unverified@example.com", "hash", UserRole.User, "8095550199", "40212345678");
        user.GenerarTokenVerificacion();
        var oldToken = user.TokenVerificacion;

        _usuarioRepositoryMock.Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(user.TokenVerificacion);
        Assert.NotEqual(oldToken, user.TokenVerificacion); // Should be a new token
        _emailServiceMock.Verify(e => e.SendAccountVerificationAsync("unverified@example.com", "Juan", user.TokenVerificacion!, "/checkout", It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
