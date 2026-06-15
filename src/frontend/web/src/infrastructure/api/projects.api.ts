// @deprecated — Use features/projects/api/projectsApi.ts. This file will be deleted in the next cleanup sprint.
import apiClient from "./client";

export interface ProjectSummary {
  id: string;
  name: string;
  rnc: string;
  matricula: string;
  validationStatus: "PENDING" | "COMPLETE" | "FAILED" | "SEALED";
  createdAt: string;
}

export const projectsApi = {
  list: () => apiClient.get<ProjectSummary[]>("/projects").then((r: { data: ProjectSummary[] }) => r.data),
  getById: (id: string) =>
    apiClient.get<ProjectSummary>(`/projects/${id}`).then((r: { data: ProjectSummary }) => r.data),
};
