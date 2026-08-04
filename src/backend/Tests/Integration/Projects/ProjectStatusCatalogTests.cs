namespace Tests.Integration.Projects;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using global::Infrastructure.Persistence;

/// <summary>
/// RED: ProyectosEstados debe ser la única fuente de verdad del estado.
/// Estos tests fallan hasta que el DTO exponga los campos del catálogo
/// (EstadoId, CodigoUnico, Nombre, ColorHex, Activo) y exista el endpoint
/// GET /api/projects/estados.
/// </summary>
[Collection("Database")]
public class ProjectStatusCatalogTests : IntegrationTestBase
{
    public ProjectStatusCatalogTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task GET_ProjectById_ExposesCatalogEstadoFields()
    {
        var token = await RegisterAndGetTokenAsync(
            "estado.catalogo@test.com", "Test123!");
        SetBearerToken(token);

        var userId = GetUserIdFromToken(token);
        await AssignPlanToUserAsync(userId, "Profesional");

        var create = await Client.PostAsJsonAsync(
            "/api/projects", new
            {
                nombre = "Estado Catalogo Test",
                ubicacionTexto = "Santo Domingo, DN",
                categoriaId = 16,
                usuarioCreadorId = userId
            });
        create.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await create.Content.ReadFromJsonAsync<ProyectoCatalogDto>();
        created!.Id.Should().NotBeEmpty();

        var get = await Client.GetAsync($"/api/projects/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var project = await get.Content.ReadFromJsonAsync<ProyectoCatalogDto>();

        // El estado leído proviene de ProyectosEstados (catálogo), no de un hardcode local
        project!.EstadoId.Should().NotBeEmpty();
        project.EstadoProyecto.Should().Be("CREADO");
        project.EstadoNombre.Should().Be("Creado");
        project.EstadoColorHex.Should().Be("#9BACD8");
        project.EstadoActivo.Should().BeTrue();
    }

    [Fact]
    public async Task GET_Estados_ReturnsFullCatalogFromProyectosEstados()
    {
        ClearAuth();

        var response = await Client.GetAsync("/api/projects/estados");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var estados = await response.Content
            .ReadFromJsonAsync<List<ProyectoEstadoCatalogoDto>>();

        estados.Should().HaveCount(5);
        var revision = estados!.Single(e => e.CodigoUnico == "REVISION");
        revision.Nombre.Should().Be("En Revisión");
        revision.ColorHex.Should().Be("#EAB308");
        revision.Activo.Should().BeTrue();
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

public record ProyectoCatalogDto(
    Guid Id,
    Guid? EstadoId = null,
    string? EstadoProyecto = null,
    string? EstadoNombre = null,
    string? EstadoColorHex = null,
    bool? EstadoActivo = null);

public record ProyectoEstadoCatalogoDto(
    Guid EstadoId,
    string CodigoUnico,
    string Nombre,
    string ColorHex,
    bool Activo);
