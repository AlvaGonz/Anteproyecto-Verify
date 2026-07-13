using System;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Microsoft.Extensions.Configuration;
using Application.Abstractions.Notifications;
using Application.Features.Auth.Commands.LoginUser;
using Application.Features.Auth.Commands.UpdateProfile;
using Application.Features.Auth.Commands.VerifyEmail;
using Application.Features.Auth.Commands.RegisterUser;
using Domain.Entities;
using Domain.Enums;
using Application.Features.Auth.Commands.UploadAvatar;
using Application.Features.Auth.Commands.ResendVerificationEmail;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        
        var validatorMock = new Mock<IValidator<RegisterUserCommand>>();
        var uowMock = new Mock<IUnitOfWork>();
        var mockPlanRepo = new Mock<IPlanSuscripcionRepository>();
        var mockEmailService = new Mock<IEmailService>();
        var mockConfig = new Mock<IConfiguration>();
        var mockJwtTokenGenerator = new Mock<global::Application.Abstractions.Security.IJwtTokenGenerator>();
        mockJwtTokenGenerator.Setup(j => j.GenerateToken(It.IsAny<Usuario>())).Returns("test-jwt-token");
        var verifyHandler = new VerifyEmailCommandHandler(_usuarioRepositoryMock.Object, uowMock.Object);
        var loginHandler = new LoginUserCommandHandler(_usuarioRepositoryMock.Object, _passwordHasherMock.Object, mockJwtTokenGenerator.Object, uowMock.Object);
        var updateProfileHandler = new UpdateProfileCommandHandler(_usuarioRepositoryMock.Object, _passwordHasherMock.Object, uowMock.Object);

        var registerHandler = new RegisterUserCommandHandler(
            _usuarioRepositoryMock.Object, 
            _passwordHasherMock.Object, 
            uowMock.Object, 
            validatorMock.Object,
            mockEmailService.Object,
            mockPlanRepo.Object);

        var uploadAvatarHandler = new UploadAvatarCommandHandler(_usuarioRepositoryMock.Object, uowMock.Object);
        var mockValidatorResend = new Mock<FluentValidation.IValidator<ResendVerificationEmailCommand>>();
        var resendEmailHandler = new ResendVerificationEmailCommandHandler(_usuarioRepositoryMock.Object, uowMock.Object, mockValidatorResend.Object, mockEmailService.Object);
        var cache = new Microsoft.Extensions.Caching.Memory.MemoryCache(new Microsoft.Extensions.Caching.Memory.MemoryCacheOptions());

        _controller = new AuthController(
            registerHandler, 
            verifyHandler,
            loginHandler,
            updateProfileHandler,
            uploadAvatarHandler,
            resendEmailHandler,
            null!, // forgotPasswordHandler
            null!, // resetPasswordHandler
            _usuarioRepositoryMock.Object, 
            mockConfig.Object,
            mockJwtTokenGenerator.Object,
            cache,
            null! // AppDbContext is not directly used in the mocked handlers' tests
        );

        var httpContext = new DefaultHttpContext();
        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = httpContext
        };
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var request = new LoginUserCommand("test@example.com", "password123");
        var user = new Usuario("Test", "User", "test@example.com", "hashed_password", UserRole.User, "12345678", "12345678");
        user.GetType().GetProperty("EmailVerificado")?.SetValue(user, true);
        user.GetType().GetProperty("Activo")?.SetValue(user, true);
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(hasher => hasher.VerifyPassword(request.Password, user.ContrasenaHash))
            .Returns(true);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var valueType = okResult.Value.GetType();
        var userProp = valueType.GetProperty("user");
        Assert.NotNull(userProp);
        var userObj = userProp.GetValue(okResult.Value);
        Assert.NotNull(userObj);

        var avatarUrlProp = userObj.GetType().GetProperty("avatarUrl");
        Assert.NotNull(avatarUrlProp);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new LoginUserCommand("test@example.com", "wrong_password");
        var user = new Usuario("Test", "User", "test@example.com", "hashed_password", UserRole.User, "12345678", "12345678");
        user.GetType().GetProperty("EmailVerificado")?.SetValue(user, true);
        user.GetType().GetProperty("Activo")?.SetValue(user, true);
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(hasher => hasher.VerifyPassword(request.Password, user.ContrasenaHash))
            .Returns(false);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsBadRequest()
    {
        // Arrange
        var request = new LoginUserCommand("unknown@example.com", "password123");
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<BadRequestObjectResult>(result);
    }
}
