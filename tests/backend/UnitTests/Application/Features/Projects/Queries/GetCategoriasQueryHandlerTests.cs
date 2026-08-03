namespace Tests.Unit.Application.Features.Projects.Queries;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Projects.Queries.GetCategorias;
using global::Domain.Entities;
using Moq;
using Xunit;

/// <summary>
/// Guard test: the category catalog endpoint must expose exactly the 16
/// seeded CategoriaProyecto rows with their official display names.
/// </summary>
public class GetCategoriasQueryHandlerTests
{
    private static readonly (int Id, string Nombre)[] SeedRows =
    {
        (1, "ALBERGUES"),
        (2, "ALMACENES"),
        (3, "APARTAMENTOS"),
        (4, "CENTROS DE RECREACIÓN Y DEPORTES"),
        (5, "CENTROS DE SALUD"),
        (6, "COLEGIOS Y CENTROS EDUCATIVOS"),
        (7, "COMBINADOS"),
        (8, "COMERCIAL Y OFICINAS"),
        (9, "DEPÓSITOS"),
        (10, "ESTACIÓN DE COMBUSTIBLE"),
        (11, "ESTRUCTURAS ESPECIALES"),
        (12, "HOSPEDAJE"),
        (13, "OBRAS DE ORDEN SOCIAL"),
        (14, "PARQUEOS"),
        (15, "SERVICIOS DE TRANSPORTE"),
        (16, "VIVIENDAS"),
    };

    private static List<CategoriaProyecto> SeedCatalog() =>
        SeedRows.Select(r => new CategoriaProyecto
        {
            Id = r.Id,
            Nombre = r.Nombre,
            Activo = true,
        }).ToList();

    [Fact]
    public async Task Handle_ReturnsAllSixteenCategoriesInSeedOrder()
    {
        var repo = new Mock<IProyectoRepository>();
        repo.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(SeedCatalog());

        var handler = new GetCategoriasQueryHandler(repo.Object);
        var result = await handler.Handle(new GetCategoriasQuery(), default);

        Assert.Equal(16, result.Count);
        Assert.Equal(SeedRows.Select(r => r.Id), result.Select(c => c.Id));
        Assert.Equal(SeedRows.Select(r => r.Nombre), result.Select(c => c.Nombre));
    }

    [Fact]
    public async Task Handle_KeepsDescriptionField()
    {
        var repo = new Mock<IProyectoRepository>();
        repo.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto>
            {
                new CategoriaProyecto { Id = 16, Nombre = "VIVIENDAS", Descripcion = "D1", Activo = true },
            });

        var handler = new GetCategoriasQueryHandler(repo.Object);
        var result = await handler.Handle(new GetCategoriasQuery(), default);

        var dto = Assert.Single(result);
        Assert.Equal(16, dto.Id);
        Assert.Equal("VIVIENDAS", dto.Nombre);
        Assert.Equal("D1", dto.Descripcion);
    }
}
