import { PublicProjectReportDto, ProjectReportDto } from "../../features/reports/types";

export const mockPublicReports: PublicProjectReportDto[] = [
  {
    id: "pub-rep-001",
    proyectoId: "proj-001",
    estadoReporte: "Published",
    resumenPublico: "El proyecto Torre Bella Vista Piantini ha superado exitosamente todas las validaciones de integridad. Los documentos legales y permisos ambientales se encuentran en orden y vigentes.",
    estadoProyectoVisible: "En Construcción",
    estadoExpedienteVisible: "Verificado",
    fechaGeneracionUtc: "2026-01-25T10:00:00Z",
    ultimaActualizacionUtc: "2026-02-20T14:30:00Z",
    version: 1,
    esPublico: true
  }
];

export const mockProjectReports: ProjectReportDto[] = [
  {
    id: "rep-001",
    proyectoId: "proj-001",
    estadoReporte: "Published",
    resumen: "Reporte interno de validación completado. Sin hallazgos críticos.",
    version: 1,
    generadoPorUsuarioId: "user-admin-001",
    createdAtUtc: "2026-01-25T10:00:00Z",
    updatedAtUtc: "2026-02-20T14:30:00Z"
  },
  {
    id: "rep-002",
    proyectoId: "proj-003",
    estadoReporte: "Draft",
    resumen: "Borrador de reporte. Se encontraron problemas con el permiso del ayuntamiento.",
    version: 1,
    generadoPorUsuarioId: "user-dev-001",
    createdAtUtc: "2026-02-15T10:00:00Z"
  }
];
