using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Notifications;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers
{
    public class SubscriptionControllerTests
    {
        private readonly SubscriptionController _controller;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AppDbContext _dbContext;

        public SubscriptionControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new AppDbContext(options);

            _mockConfig = new Mock<IConfiguration>();
            var mockLogger = new Mock<ILogger<SubscriptionController>>();
            var mockEmailService = new Mock<IEmailService>();

            _controller = new SubscriptionController(_dbContext, _mockConfig.Object, mockLogger.Object, mockEmailService.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetSessionStatus_WithMissingStripeKey_Returns500InternalServerError()
        {
            // Arrange
            _mockConfig.Setup(c => c["Stripe:SecretKey"]).Returns(string.Empty);
            
            // Act
            var result = await _controller.GetSessionStatus("cs_test_123", null, CancellationToken.None);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
        }
    }
}
