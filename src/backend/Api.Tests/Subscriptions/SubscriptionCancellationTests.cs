using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Contracts.Subscriptions;
using Application.Abstractions.Notifications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MediatR;
using NSubstitute;
using Xunit;

namespace Api.Tests.Subscriptions;

public class SubscriptionCancellationTests
{
    private (SubscriptionController, ISubscriptionService) CreateControllerAndMocks(Guid userId)
    {
        var sender = Substitute.For<ISender>();
        var subscriptionService = Substitute.For<ISubscriptionService>();
        var logger = Substitute.For<ILogger<SubscriptionController>>();
        var config = Substitute.For<IConfiguration>();
        var emailService = Substitute.For<IEmailService>();

        config["Stripe:SecretKey"].Returns("sk_test_mock");

        var controller = new SubscriptionController(sender, subscriptionService, config, logger);

        var claimsUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsUser }
        };

        return (controller, subscriptionService);
    }

    [Fact]
    public async Task CancelSubscription_ReturnsOkAndCallsSubscriptionService()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var (controller, subscriptionService) = CreateControllerAndMocks(userId);

        // Act
        var result = await controller.CancelSubscription(CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        await subscriptionService.Received(1).CancelSubscriptionAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ReactivateSubscription_ReturnsOkAndCallsSubscriptionService()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var (controller, subscriptionService) = CreateControllerAndMocks(userId);

        // Act
        var result = await controller.ReactivateSubscription(CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        await subscriptionService.Received(1).ReactivateSubscriptionAsync(userId, Arg.Any<CancellationToken>());
    }
}
