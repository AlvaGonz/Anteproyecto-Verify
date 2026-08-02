using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using MediatR;

namespace Application.Features.Projects.Queries.GetCategorias;

public record CategoriaProyectoDto(int Id, string Nombre, string? Descripcion);

public record GetCategoriasQuery : IRequest<List<CategoriaProyectoDto>>;

public class GetCategoriasQueryHandler : IRequestHandler<GetCategoriasQuery, List<CategoriaProyectoDto>>
{
    private readonly IProyectoRepository _repository;

    public GetCategoriasQueryHandler(IProyectoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CategoriaProyectoDto>> Handle(GetCategoriasQuery request, CancellationToken cancellationToken)
    {
        var categorias = await _repository.GetCategoriasAsync(cancellationToken);
        return categorias.Select(c => new CategoriaProyectoDto(c.Id, c.Nombre, c.Descripcion)).ToList();
    }
}
