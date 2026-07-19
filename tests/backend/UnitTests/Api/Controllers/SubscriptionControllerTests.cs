using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Contracts.Subscriptions;
using Application.DTOs.Subscriptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers
{
    public class SubscriptionControllerTests
    {
        private readonly SubscriptionController _controller;
        private readonly Mock<ISender> _mockSender;
        private readonly Mock<ISubscriptionService> _mockSubscriptionService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<ILogger<SubscriptionController>> _mockLogger;

        public SubscriptionControllerTests()
        {
            _mockSender = new Mock<ISender>();
            _mockSubscriptionService = new Mock<ISubscriptionService>();
            _mockConfig = new Mock<IConfiguration>();
            _mockLogger = new Mock<ILogger<SubscriptionController>>();

            _controller = new SubscriptionController(_mockSender.Object, _mockSubscriptionService.Object, _mockConfig.Object, _mockLogger.Object);

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

