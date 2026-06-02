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

  generatePdf: async (projectId: string): Promise<Blob> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Blob(["Mock PDF Content"], { type: "application/pdf" }));
        }, 800);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/reports/pdf`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.Mensaje || 'Error al generar el reporte PDF.');
    }

    return response.blob();
  },

  generateExcel: async (projectId: string): Promise<Blob> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Blob(["Mock Excel Content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
        }, 800);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/reports/excel`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.Mensaje || 'Error al generar el reporte Excel.');
    }

    return response.blob();
  },

  queryGeminiProxy: async (projectId: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/gemini/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generar un resumen ejecutivo y diagnóstico de cumplimiento de validación para el proyecto ${projectId}.`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) throw new Error("Failed to consult AI Diagnosis proxy");
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI feedback generated.";
  }
};
