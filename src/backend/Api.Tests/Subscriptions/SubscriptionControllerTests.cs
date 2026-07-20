using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Stripe;
using Xunit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Application.Abstractions.Notifications;
using Api.Controllers;
using Infrastructure.Persistence;
using System.Collections.Generic;
using MediatR;
using Application.Contracts.Subscriptions;

namespace Api.Tests.Subscriptions;

public class SubscriptionControllerTests
{
    private SubscriptionController CreateController(out ISubscriptionService subscriptionService)
    {
        var sender = Substitute.For<ISender>();
        subscriptionService = Substitute.For<ISubscriptionService>();
        var logger = Substitute.For<ILogger<SubscriptionController>>();
        var config = Substitute.For<IConfiguration>();
        var emailService = Substitute.For<IEmailService>();

        config["Stripe:SecretKey"].Returns("sk_test_mock");
        var pricePlanMapSection = Substitute.For<IConfigurationSection>();
        var childSection = Substitute.For<IConfigurationSection>();
        childSection.Key.Returns("price_1TouQgIlzw9mY1SEz7GoFFQU");
        childSection.Value.Returns("Profesional");
        pricePlanMapSection.GetChildren().Returns(new List<IConfigurationSection> { childSection });
        config.GetSection("Stripe:PricePlanMap").Returns(pricePlanMapSection);

        var controller = new SubscriptionController(sender, subscriptionService, config, logger);
        
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        return controller;
    }

    [Fact]
    public async Task GetSessionStatus_WithCamelCaseSessionId_Returns200()
    {
        // Arrange
        var controller = CreateController(out var subscriptionService);
        var expectedStatus = new Application.DTOs.Subscriptions.SessionStatusDto { Status = "complete" };
        subscriptionService.GetSessionStatusAsync(Arg.Any<Guid>(), "cs_test_xxx", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(expectedStatus));

        // Act
        var result = await controller.GetSessionStatus(sessionId: "cs_test_xxx", session_id: null, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetSessionStatus_WithSnakeCaseSessionId_Returns200()
    {
        // Arrange
        var controller = CreateController(out var subscriptionService);
        var expectedStatus = new Application.DTOs.Subscriptions.SessionStatusDto { Status = "complete" };
        subscriptionService.GetSessionStatusAsync(Arg.Any<Guid>(), "cs_test_xxx", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(expectedStatus));

        // Act
        var result = await controller.GetSessionStatus(sessionId: null, session_id: "cs_test_xxx", CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetSessionStatus_ReturnsPlanName_WhenConfigured()
    {
        // Arrange
        var controller = CreateController(out var subscriptionService);
        var expectedStatus = new Application.DTOs.Subscriptions.SessionStatusDto { Status = "complete", Plan = "Profesional" };
        subscriptionService.GetSessionStatusAsync(Arg.Any<Guid>(), "cs_test_xxx", Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(expectedStatus));

        // Act
        var result = await controller.GetSessionStatus(sessionId: "cs_test_xxx", session_id: null, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = System.Text.Json.JsonSerializer.Serialize(okResult.Value);
        Assert.Contains("\"Plan\":\"Profesional\"", json);
    }
}
