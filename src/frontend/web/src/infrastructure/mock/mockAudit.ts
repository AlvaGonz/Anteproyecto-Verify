import { AuditDto } from "../../features/audit/types";

export const mockAudit: AuditDto[] = [
  {
    id: "audit-001",
    proyectoId: "proj-001",
    usuarioId: "user-dev-001",
    tipoEvento: "ProjectCreated",
    accion: "Create",
    entidad: "Proyecto",
    entidadId: "proj-001",
    detalle: "Proyecto Torre Bella Vista Piantini creado",
    ipOrigen: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    fechaEventoUtc: "2026-01-15T10:00:00Z"
  },
  {
    id: "audit-002",
    proyectoId: "proj-001",
    usuarioId: "user-dev-001",
    tipoEvento: "DocumentUploaded",
    accion: "Create",
    entidad: "Documento",
    entidadId: "doc-001",
    detalle: "Documento Certificado_Titulo_BellaVista.pdf subido",
    ipOrigen: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    fechaEventoUtc: "2026-01-16T10:00:00Z"
  },
  {
    id: "audit-003",
    proyectoId: "proj-001",
    usuarioId: "user-admin-001",
    tipoEvento: "ValidationExecuted",
    accion: "Execute",
    entidad: "Validacion",
    entidadId: "val-001",
    detalle: "Validación interna ejecutada con resultado: Completado",
    ipOrigen: "10.0.0.5",
    userAgent: "Mozilla/5.0",
    fechaEventoUtc: "2026-01-20T10:00:00Z"
  },
  {
    id: "audit-004",
    proyectoId: "proj-003",
    usuarioId: "user-dev-001",
    tipoEvento: "ProjectCreated",
    accion: "Create",
    entidad: "Proyecto",
    entidadId: "proj-003",
    detalle: "Proyecto Costero La Romana creado",
    ipOrigen: "192.168.1.105",
    userAgent: "Mozilla/5.0",
    fechaEventoUtc: "2026-02-10T11:45:00Z"
  },
  {
    id: "audit-005",
    proyectoId: "proj-003",
    usuarioId: "user-admin-001",
    tipoEvento: "ValidationExecuted",
    accion: "Execute",
    entidad: "Validacion",
    entidadId: "val-002",
    detalle: "Validación interna ejecutada con resultado: Fallido",
    ipOrigen: "10.0.0.5",
    userAgent: "Mozilla/5.0",
    fechaEventoUtc: "2026-02-12T10:00:00Z"
  }
];
