namespace Application.DTOs.Projects;

using System.Collections.Generic;
using Application.DTOs.Documents;

public record ProjectDiagnosticDto(
    double PorcentajeCompletitud,
    string EstadoGeneral,
    IEnumerable<DocumentDiagnosticDto> Documentos
);
