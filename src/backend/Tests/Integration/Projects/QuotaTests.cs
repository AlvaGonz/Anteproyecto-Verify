namespace Tests.Integration.Projects;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

[Collection("Database")]
public class QuotaTests : IntegrationTestBase
{
    public QuotaTests(SqlServerFixture fixture) : base(fixture) { }

    private object ValidProjectPayload(string nombre = "Mi Proyecto") => new
    {
        nombre,
        ubicacionTexto = "Santo Domingo, DN",
        categoria = 1,
        datosDesarrollador = "Dev SA",
        designacionCatastral = "CAT-001"
    };

    [Fact]
    public async Task POST_CreateProject_ConsultorAlreadyAt1_Returns402()
    {
        // Register new user (gets Consultor plan by default)
        var token = await RegisterAndGetTokenAsync(
            "quota.test@test.com", "Test123!");
        SetBearerToken(token);

        // First project — should succeed
        var first = await Client.PostAsJsonAsync(
            "/api/proyectos", ValidProjectPayload("Proyecto 1"));
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        // Second project — should be blocked by quota
        var second = await Client.PostAsJsonAsync(
            "/api/proyectos", ValidProjectPayload("Proyecto 2"));

        second.StatusCode.Should().Be(HttpStatusCode.PaymentRequired); // 402

        var error = await second.Content
            .ReadFromJsonAsync<ErrorDto>();
        error!.Error.Should().Be("QUOTA_EXCEEDED");
        error.Tier.Should().Be("Consultor");
        error.Limit.Should().Be(1);
    }

    [Fact]
    public async Task POST_CreateProject_ProfesionalPlan_AllowsUpTo5()
    {
        var token = await RegisterAndGetTokenAsync(
            "profesional.test@test.com", "Test123!");
        SetBearerToken(token);

        // Get userId from JWT claims
        var userId = GetUserIdFromToken(token);

        // Upgrade plan to Profesional
        await AssignPlanToUserAsync(userId, "Profesional");

        // Create 5 projects — all should succeed
        for (int i = 1; i <= 5; i++)
        {
            var resp = await Client.PostAsJsonAsync(
                "/api/proyectos",
                ValidProjectPayload($"Proyecto Profesional {i}"));
            resp.StatusCode.Should()
                .Be(HttpStatusCode.Created,
                    because: $"project {i} should be within Profesional quota");
        }

        // 6th should fail
        var sixth = await Client.PostAsJsonAsync(
            "/api/proyectos",
            ValidProjectPayload("Proyecto 6"));
        sixth.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
    }

    private Guid GetUserIdFromToken(string jwt)
    {
        // Decode JWT payload (base64url) to extract sub claim
        var parts = jwt.Split('.');
        var payload = System.Text.Json.JsonDocument.Parse(
            System.Convert.FromBase64String(
                parts[1].PadRight(parts[1].Length + 
                    (4 - parts[1].Length % 4) % 4, '=')));

        return Guid.Parse(
            payload.RootElement.GetProperty("sub").GetString()!);
    }
}
