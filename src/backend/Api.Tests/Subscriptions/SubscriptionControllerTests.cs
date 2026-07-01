using System;
using System.Collections.Generic;
using System.Linq;
using Api.Controllers;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Api.Tests.Subscriptions;

public class SubscriptionControllerTests
{
    private readonly AppDbContext _dbContext;
    private readonly SubscriptionController _controller;

    public SubscriptionControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _dbContext = new AppDbContext(options);
        
        var mockConfig = Substitute.For<IConfiguration>();
        var mockLogger = Substitute.For<ILogger<SubscriptionController>>();
        
        _controller = new SubscriptionController(_dbContext, mockConfig, mockLogger);
    }

    [Fact]
    public void ProcessSubscriptionNotification_WhenIsNewPlan_CreatesNotification()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario(
            "Test", 
            "User",
            "test@test.com", 
            "hashedpwd", 
            Domain.Enums.UserRole.User,
            "8095551234",
            "40200000000");
        
        // Use reflection to set Id since it's private set
        typeof(Usuario).GetProperty("Id")?.SetValue(user, userId);

        var plan = PlanSuscripcion.Create(
            Guid.NewGuid(), 
            "Premium", 
            99.99m, 
            100, 
            10, 
            true, 
            true, 
            true, 
            true);

        // Act
        _controller.ProcessSubscriptionNotification(user, plan, isNewPlan: true);
        _dbContext.SaveChanges();

        // Assert
        var notification = _dbContext.Notificaciones.FirstOrDefault(n => n.UsuarioId == userId);
        Assert.NotNull(notification);
        Assert.Equal(userId, notification.UsuarioId);
        Assert.Contains(plan.NombrePlan, notification.Mensaje);
        Assert.Equal("Success", notification.Tipo);
    }

    [Fact]
    public void ProcessSubscriptionNotification_WhenIsNotNewPlan_DoesNotCreateNotification()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario(
            "Test", 
            "User",
            "test@test.com", 
            "hashedpwd", 
            Domain.Enums.UserRole.User,
            "8095551234",
            "40200000000");
        
        // Use reflection to set Id since it's private set
        typeof(Usuario).GetProperty("Id")?.SetValue(user, userId);

        var plan = PlanSuscripcion.Create(
            Guid.NewGuid(), 
            "Premium", 
            99.99m, 
            100, 
            10, 
            true, 
            true, 
            true, 
            true);

        // Act
        _controller.ProcessSubscriptionNotification(user, plan, isNewPlan: false);

        // Assert
        var notification = _dbContext.Notificaciones.FirstOrDefault(n => n.UsuarioId == userId);
        Assert.Null(notification);
    }
}
