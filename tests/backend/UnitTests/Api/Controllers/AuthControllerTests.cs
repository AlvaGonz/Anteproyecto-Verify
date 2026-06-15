using System;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.RegisterUser;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        var registerHandler = new RegisterUserCommandHandler(
            _usuarioRepositoryMock.Object, 
            _passwordHasherMock.Object, 
            uowMock.Object, 
            validatorMock.Object);

        _controller = new AuthController(
            registerHandler, 
            _usuarioRepositoryMock.Object, 
            _passwordHasherMock.Object);

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
        var request = new LoginRequest { Email = "test@example.com", Password = "password123" };
        var user = new Usuario("Test", "User", "test@example.com", "hashed_password", UserRole.Professional, "12345678", "12345678");
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(hasher => hasher.VerifyPassword(request.Password, user.ContrasenaHash))
            .Returns(true);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest { Email = "test@example.com", Password = "wrong_password" };
        var user = new Usuario("Test", "User", "test@example.com", "hashed_password", UserRole.Professional, "12345678", "12345678");
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(hasher => hasher.VerifyPassword(request.Password, user.ContrasenaHash))
            .Returns(false);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest { Email = "unknown@example.com", Password = "password123" };
        
        _usuarioRepositoryMock.Setup(repo => repo.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        // Act
        var result = await _controller.Login(request, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
