namespace Application.DTOs.Projects;

public record CatastroLookupDto(
    string DesignacionCatastral,
    string Matricula,
    decimal SuperficieM2,
    string? Propietario,
    string? CedulaRncPropietario,
    string? Ipi,
    string? EstatusIpi
);
