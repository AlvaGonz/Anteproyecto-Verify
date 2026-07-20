using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using Xunit;

namespace Api.Tests;

public class ApiStatusTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ApiStatusTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Get_ApiStatus_ReturnsSuccessStatusCode()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/status");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
