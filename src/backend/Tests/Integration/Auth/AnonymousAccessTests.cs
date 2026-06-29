namespace Tests.Integration.Auth;

using Tests.Integration.Infrastructure;
using System.Net;
using FluentAssertions;

[Collection("Database")]
public class AnonymousAccessTests : IntegrationTestBase
{
    public AnonymousAccessTests(SqlServerFixture fixture) : base(fixture) { }

    [Theory]
    [InlineData("POST", "/api/projects")]
    [InlineData("PUT", "/api/projects/00000000-0000-0000-0000-000000000000")]
    public async Task ConsultaEndpoints_WithoutJWT_Return401(
        string method, string path)
    {
        ClearAuth(); // ensure no Bearer token

        var request = new HttpRequestMessage(new HttpMethod(method), path);
        var response = await Client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_PublicVerify_WithoutJWT_IsNotUnauthorized()
    {
        ClearAuth();

        var response = await Client.GetAsync(
            $"/api/public/verificar/{Guid.NewGuid()}");

        // 404 = seal not found — acceptable. 401 = fail.
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }
}
