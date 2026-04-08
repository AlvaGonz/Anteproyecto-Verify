import { NotificationDto } from "../../features/notifications/types";

export const mockNotifications: NotificationDto[] = [
  {
    id: "notif-001",
    mensaje: "El proyecto Torre Bella Vista Piantini ha sido publicado.",
    tipo: "ProjectPublished",
    leida: false,
    fechaUtc: "2026-01-25T10:05:00Z",
    enlaceRelacionado: "/admin/projects/proj-001"
  },
  {
    id: "notif-002",
    mensaje: "Validación fallida para Proyecto Costero La Romana.",
    tipo: "ValidationFailed",
    leida: true,
    fechaUtc: "2026-02-12T10:05:00Z",
    enlaceRelacionado: "/admin/projects/proj-003"
  }
];
