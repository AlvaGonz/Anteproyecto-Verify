using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tests.Integration.Infrastructure;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;
using Xunit;

namespace Tests.Integration;

[Collection("Database")]
public class ExternalApiMockingTests : IntegrationTestBase, IAsyncLifetime
{
    private WireMockServer _wireMockServer = default!;

    public ExternalApiMockingTests(SqlServerFixture fixture) : base(fixture)
    {
    }

    public new Task InitializeAsync()
    {
        _wireMockServer = WireMockServer.Start();
        // Override the external API base URL to point to our WireMock server
        Environment.SetEnvironmentVariable("NvidiaAi__BaseUrl", _wireMockServer.Url);
        return Task.CompletedTask;
    }

    public new Task DisposeAsync()
    {
        _wireMockServer.Stop();
        _wireMockServer.Dispose();
        Environment.SetEnvironmentVariable("NvidiaAi__BaseUrl", null);
        return Task.CompletedTask;
    }

    [Fact]
    public async Task GetDocumentDiagnosis_UsesExternalNvidiaAiApi_ReturnsMockedResponse()
    {
        // Arrange
        // 1. Setup WireMock to return a specific JSON response when Nvidia API is called
        _wireMockServer
            .Given(Request.Create().WithPath("/chat/completions").UsingPost())
            .RespondWith(
                Response.Create()
                    .WithStatusCode(200)
                    .WithHeader("Content-Type", "application/json")
                    .WithBody(@"{
                        ""id"": ""chatcmpl-123"",
                        ""choices"": [{
                            ""message"": {
                                ""content"": ""{\""score\"": 85, \""summary\"": \""WireMock Test Summary\"", \""missingDocuments\"": [\""PlanoTest\""], \""recommendations\"": [\""Recommendation 1\""]}""
                            }
                        }]
                    }")
            );

        var token = await RegisterAndGetTokenAsync("wiremock.user@test.com", "Password123!");
        SetBearerToken(token);

        Guid projectId = Guid.NewGuid();
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == "wiremock.user@test.com");
            
            var project = new Proyecto(
                "WireMock Project", 
                "Location", 
                user.Id, 
                ProjectCategory.Residencial, 
                "Dev Data", 
                "CAT-WIREMOCK");
            var projIdProp = typeof(Domain.Common.EntityBase).GetProperty("Id");
            projIdProp?.SetValue(project, projectId);
            
            db.Proyectos.Add(project);
            await db.SaveChangesAsync();
        }

        // Act
        var response = await Client.GetAsync($"/api/proyectos/{projectId}/documentos/diagnosis");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        int score = content.GetProperty("score").GetInt32();
        string summary = content.GetProperty("summary").GetString()!;

        score.Should().Be(85);
        summary.Should().Be("WireMock Test Summary");
    }
}
