using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Common.Exceptions;
using Application.DTOs.Subscriptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Tests.Unit.Subscriptions;

public class SubscriptionServiceExceptionTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration(string? secretKey = "sk_test_mock")
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Stripe:SecretKey", secretKey }
            })
            .Build();
    }

    private static SubscriptionService CreateService(AppDbContext db, IConfiguration? config = null)
    {
        return new SubscriptionService(
            db,
            config ?? CreateConfiguration(),
            new Mock<ILogger<SubscriptionService>>().Object,
            new Mock<IEmailService>().Object,
            new Mock<INotificationFactory>().Object,
            new Mock<INotificacionRepository>().Object);
    }

    private static Usuario CreateUser(AppDbContext db, string? stripeSubscriptionId = null)
    {
        var user = new Usuario("Test", "User", $"{Guid.NewGuid()}@test.com", "hashedpw", UserRole.User, "8091234567", "001-0000001-1");
        if (stripeSubscriptionId != null)
        {
            user.UpdateStripeSubscription(stripeSubscriptionId, "active", DateTime.UtcNow.AddMonths(1));
        }
        db.Usuarios.Add(user);
        db.SaveChanges();
        return user;
    }

    [Fact]
    public async Task CreateSessionAsync_UnknownUser_ThrowsNotFoundException()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CreateSessionAsync(Guid.NewGuid(), new CreateSessionRequest("price_x", null, null, new SubscriptionConsentDto(null, "test")), "http://localhost:3000", CancellationToken.None));
    }

    [Fact]
    public async Task CreateSessionAsync_MissingStripeSecretKey_ThrowsBadRequestException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db, CreateConfiguration(null));

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateSessionAsync(user.Id, new CreateSessionRequest("price_x", null, null, new SubscriptionConsentDto(null, "test")), "http://localhost:3000", CancellationToken.None));
    }

    [Fact]
    public async Task GetMySubscriptionStatusAsync_UnknownUser_ThrowsNotFoundException()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.GetMySubscriptionStatusAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task GetSessionStatusAsync_MissingStripeSecretKey_ThrowsBadRequestException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db, CreateConfiguration(null));

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.GetSessionStatusAsync(user.Id, "cs_test_xxx", CancellationToken.None));
    }

    [Fact]
    public async Task CreatePortalSessionAsync_NoStripeCustomerId_ThrowsBadRequestException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreatePortalSessionAsync(user.Id, "http://localhost:3000", CancellationToken.None));
    }

    [Fact]
    public async Task SyncSubscriptionAsync_NoStripeCustomerId_ThrowsBadRequestException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.SyncSubscriptionAsync(user.Id, CancellationToken.None));
    }

    [Fact]
    public async Task ReconcileSubscriptionAsync_UnknownCustomer_ThrowsNotFoundException()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.ReconcileSubscriptionAsync("cus_unknown", CancellationToken.None));
    }

    [Fact]
    public async Task CancelSubscriptionAsync_NoStripeSubscription_ThrowsNotFoundException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CancelSubscriptionAsync(user.Id, CancellationToken.None));
    }

    [Fact]
    public async Task ReactivateSubscriptionAsync_NoStripeSubscription_ThrowsNotFoundException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.ReactivateSubscriptionAsync(user.Id, CancellationToken.None));
    }

    [Fact]
    public async Task ReactivateSubscriptionAsync_NotInCancellation_ThrowsBadRequestException()
    {
        using var db = CreateDbContext();
        var user = CreateUser(db, stripeSubscriptionId: "sub_test");
        var service = CreateService(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.ReactivateSubscriptionAsync(user.Id, CancellationToken.None));
    }
}
