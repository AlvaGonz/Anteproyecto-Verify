namespace Tests.Integration.Projects;

using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using Tests.Integration.Helpers;
using Application.Features.Projects;
using Application.DTOs;
using Domain.Enums;
using System.Net.Http.Headers;
using System.Collections.Generic;
using System.Linq;
using Application.Common.Exceptions;
using System;
using System.Text.Json;

public class QuotaIntegrationTests : IntegrationTestBase
{
    public QuotaIntegrationTests(VeriFincaWebFactory factory) : base(factory)
    {
    }

    private static CreateProyectoDto ValidCreateProjectDto(Guid userId) => new(
        "Test Project Int", "Santo Domingo", userId,
        16, "Developer SA", RncDesarrollador: null, DesignacionCatastral: "CAT-001");

    [Fact]
    public async Task POST_CreateProject_ConsultorAlreadyHas1_Returns402()
    {
        var (token, userId) = await RegisterAndLoginAsync("Consultor");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var dto = ValidCreateProjectDto(userId);

        var firstResponse = await _client.PostAsJsonAsync("/api/projects", dto);
        
        if (!firstResponse.IsSuccessStatusCode) {
            var error = await firstResponse.Content.ReadAsStringAsync();
            throw new Exception($"First creation failed with {firstResponse.StatusCode}: {error}");
        }

        var secondResponse = await _client.PostAsJsonAsync(
            "/api/projects", dto); 

        if (!secondResponse.IsSuccessStatusCode && secondResponse.StatusCode != HttpStatusCode.PaymentRequired) {
            var error = await secondResponse.Content.ReadAsStringAsync();
            throw new Exception($"Second creation failed with {secondResponse.StatusCode}: {error}");
        }

        Assert.Equal(HttpStatusCode.PaymentRequired, secondResponse.StatusCode);

        var errorStr = await secondResponse.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(errorStr);
        var root = jsonDoc.RootElement;
        
        var errorCode = root.GetProperty("error").GetString();
        var tier = root.GetProperty("tier").GetString();
        
        Assert.Equal("QUOTA_EXCEEDED", errorCode);
        Assert.Equal("Consultor", tier);
    }
}
