import { PublicProjectReportDto, ProjectReportDto } from "../types";
import { mockPublicReports, mockProjectReports } from "../../../infrastructure/mock/mockReports";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const reportsApi = {
  getPublicReport: async (
    projectId: string,
  ): Promise<PublicProjectReportDto | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const report = mockPublicReports.find(r => r.proyectoId === projectId);
          resolve(report ? { ...report } : null);
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/public/projects/${projectId}/report`,
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch public report");
    return response.json();
  },

  getProjectReports: async (projectId: string): Promise<ProjectReportDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockProjectReports.filter(r => r.proyectoId === projectId));
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/reports`,
    );
    if (!response.ok) throw new Error("Failed to fetch project reports");
    return response.json();
  },
};
