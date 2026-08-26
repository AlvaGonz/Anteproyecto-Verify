import { ProyectoDto } from "../types";

export const sortProjectsByRecentUpdate = (projects: ProyectoDto[]): ProyectoDto[] => {
  return [...projects].sort((a, b) => {
    const timeA = new Date(a.updatedAtUtc || a.createdAtUtc || 0).getTime();
    const timeB = new Date(b.updatedAtUtc || b.createdAtUtc || 0).getTime();
    return timeB - timeA;
  });
};
