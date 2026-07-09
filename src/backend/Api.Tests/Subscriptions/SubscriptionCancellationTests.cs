using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions;
using Application.Abstractions.Notifications;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Api.Tests.Subscriptions;

public class SubscriptionCancellationTests
{
    private (SubscriptionController, AppDbContext, IStripeService) CreateControllerAndMocks(Guid userId, Usuario user)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        var dbContext = new AppDbContext(options);
        dbContext.Usuarios.Add(user);
        dbContext.SaveChanges();

        var logger = Substitute.For<ILogger<SubscriptionController>>();
        var config = Substitute.For<IConfiguration>();
        var emailService = Substitute.For<IEmailService>();
        var stripeService = Substitute.For<IStripeService>();

        config["Stripe:SecretKey"].Returns("sk_test_mock");

        var controller = new SubscriptionController(dbContext, config, logger, emailService);

        var claimsUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsUser }
        };

        return (controller, dbContext, stripeService);
    }

    [Fact]
    public async Task CancelSubscription_WithValidSub_ReturnsOkAndCallsStripe()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@example.com", "hash", UserRole.User, "123", "123");
        user.UpdateStripeSubscription("sub_123", "active", DateTime.UtcNow.AddDays(10));
        // Using reflection to set ID since it's typically set by EF
        typeof(Usuario).BaseType?.GetProperty("Id")?.SetValue(user, userId);

        var (controller, dbContext, stripeService) = CreateControllerAndMocks(userId, user);

        // Act
        var result = await controller.CancelSubscription(stripeService, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        await stripeService.Received(1).CancelAtPeriodEndAsync("sub_123", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ReactivateSubscription_WithCancelPending_ReturnsOkAndCallsStripe()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@example.com", "hash", UserRole.User, "123", "123");
        user.UpdateStripeSubscription("sub_123", "active", DateTime.UtcNow.AddDays(10));
        typeof(Usuario).BaseType?.GetProperty("Id")?.SetValue(user, userId);

        var (controller, dbContext, stripeService) = CreateControllerAndMocks(userId, user);

        // Act
        var result = await controller.ReactivateSubscription(stripeService, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        await stripeService.Received(1).ReactivateSubscriptionAsync("sub_123", Arg.Any<CancellationToken>());
    }
}
