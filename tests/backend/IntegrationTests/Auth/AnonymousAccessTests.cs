namespace Tests.Integration.Auth;

using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Tests.Integration.Helpers;

public class AnonymousAccessTests : IntegrationTestBase
{
    public AnonymousAccessTests(VeriFincaWebFactory factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("GET", "/api/proyectos/{id}/validacion/alertas")]
    [InlineData("POST", "/api/proyectos/{id}/consulta-crediticia")]
    public async Task ConsultaEndpoints_WithoutJWT_Return401(
        string method, string path)
    {
        // _client has NO Authorization header
        var request = new HttpRequestMessage(
            new HttpMethod(method),
            path.Replace("{id}", Guid.NewGuid().ToString()));

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GET_PublicVerify_WithoutJWT_Returns200Or404()
    {
        // ONLY this endpoint must remain public
        var response = await _client.GetAsync(
            $"/api/public/verificar/{Guid.NewGuid()}");

        // 404 is acceptable (seal not found), but NOT 401
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
