using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Tests.Integration.Infrastructure;
using Xunit;

namespace Tests.Integration;

[Collection("Database")]
public class StatusHistoryAnonymousTests : IntegrationTestBase
{
    public StatusHistoryAnonymousTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task GetStatusHistory_WithoutAuthentication_ReturnsOk()
    {
        // Act: sin registro/sesión (consumidor del QR del sello)
        ClearAuth();
        var response = await Client.GetAsync($"/api/projects/{Guid.NewGuid()}/status-history");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
