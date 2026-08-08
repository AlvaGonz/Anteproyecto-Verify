import { ProjectStatus } from "../types";

export const getStatusLabel = (status: ProjectStatus, ): string => {
  switch (status) {
    case ProjectStatus.Draft: return "Creado";
    case ProjectStatus.Edited: return "Editado";
    case ProjectStatus.Published: return "Publicado";
    case ProjectStatus.InReview: return "En Revisión";
    case ProjectStatus.Observed: return "Con Observaciones";
    case ProjectStatus.Validated: return "Validado";
    case ProjectStatus.Rejected: return "Rechazado";
    default: return "Desconocido";
  }
};

