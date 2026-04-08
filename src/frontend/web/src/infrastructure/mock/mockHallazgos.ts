import { FindingDto, FindingSeverity } from "../../features/validations/types";

export const mockHallazgos: FindingDto[] = [
  {
    id: "find-001",
    proyectoId: "proj-003",
    validacionId: "val-002",
    severidad: FindingSeverity.High,
    codigo: "PER-002-FAIL",
    titulo: "Permiso de Ayuntamiento Rechazado",
    descripcion: "El permiso de construcción emitido por el Ayuntamiento de La Romana fue rechazado por falta de firma del director de planeamiento urbano.",
    recomendacion: "Solicitar la firma faltante y volver a someter el documento.",
    resuelto: false,
    createdAtUtc: "2026-02-12T10:05:00Z"
  },
  {
    id: "find-002",
    proyectoId: "proj-003",
    validacionId: "val-002",
    severidad: FindingSeverity.Medium,
    codigo: "DOC-002-WARN",
    titulo: "Documentos próximos a vencer",
    descripcion: "La certificación de no objeción de Turismo vence en 15 días.",
    recomendacion: "Iniciar proceso de renovación de la certificación.",
    resuelto: false,
    createdAtUtc: "2026-02-12T10:05:00Z"
  },
  {
    id: "find-003",
    proyectoId: "proj-001",
    validacionId: "val-001",
    severidad: FindingSeverity.Low,
    codigo: "DOC-005-INFO",
    titulo: "Falta de documento opcional",
    descripcion: "No se ha adjuntado el render 3D del proyecto.",
    recomendacion: "Adjuntar render para mejorar la visibilidad pública.",
    resuelto: true,
    createdAtUtc: "2026-01-20T10:05:00Z"
  }
];
