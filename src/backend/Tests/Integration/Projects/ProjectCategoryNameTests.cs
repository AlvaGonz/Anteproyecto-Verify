namespace Tests.Integration.Projects;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

[Collection("Database")]
public class ProjectCategoryNameTests : IntegrationTestBase
{
    public ProjectCategoryNameTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task GET_ProjectDetail_ReturnsCategoriaNombre()
    {
        var token = await RegisterAndGetTokenAsync(
            "categoria.test@test.com", "Test123!");
        SetBearerToken(token);

        var userId = GetUserIdFromToken(token);
        await AssignPlanToUserAsync(userId, "Profesional");

        var create = await Client.PostAsJsonAsync("/api/projects", new
        {
            nombre = "Categoria Name Probe",
            ubicacionTexto = "Santo Domingo, DN",
            categoriaId = 16,
            datosDesarrollador = "Dev SA",
            designacionCatastral = "CAT-CATNAME",
            usuarioCreadorId = userId
        });
        create.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetGuid();

        var detail = await Client.GetAsync($"/api/projects/{id}");
        detail.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await detail.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("categoriaId").GetInt32().Should().Be(16);
        body.GetProperty("categoriaNombre").GetString().Should().Be("VIVIENDAS");
    }

    private Guid GetUserIdFromToken(string jwt)
    {
        var parts = jwt.Split('.');
        var payload = System.Text.Json.JsonDocument.Parse(
            System.Convert.FromBase64String(
                parts[1].PadRight(parts[1].Length +
                    (4 - parts[1].Length % 4) % 4, '=')));

        return Guid.Parse(
            payload.RootElement.GetProperty("sub").GetString()!);
    }
}
