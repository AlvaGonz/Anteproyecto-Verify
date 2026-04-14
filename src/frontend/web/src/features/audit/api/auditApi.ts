import { AuditDto, AuditFilters } from "../types";
import { mockAudit } from "../../../infrastructure/mock/mockAudit";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const auditApi = {
  getProjectAuditTrail: async (
    projectId: string,
    filters?: AuditFilters,
  ): Promise<AuditDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results = mockAudit.filter(a => a.proyectoId === projectId);
          if (filters?.tipoEvento) {
            results = results.filter(a => a.tipoEvento === filters.tipoEvento);
          }
          if (filters?.fromDate) {
            results = results.filter(a => new Date(a.fechaEventoUtc) >= new Date(filters.fromDate!));
          }
          if (filters?.toDate) {
            results = results.filter(a => new Date(a.fechaEventoUtc) <= new Date(filters.toDate!));
          }
          resolve(results);
        }, 300);
      });
    }

    const params = new URLSearchParams();
    if (filters?.tipoEvento) params.append("tipoEvento", filters.tipoEvento);
    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);

    const queryStr = params.toString();
    const url = `${API_BASE_URL}/projects/${projectId}/audit${queryStr ? `?${queryStr}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch audit trail");
    return response.json();
  },

  exportAuditTrailUrl: (projectId: string): string => {
    if (USE_MOCK) {
      return "#";
    }
    return `${API_BASE_URL}/projects/${projectId}/audit/export`;
  },

  getGlobalAuditTrail: async (
    filters?: AuditFilters,
  ): Promise<AuditDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results = [...mockAudit];
          if (filters?.tipoEvento) {
            results = results.filter(a => a.tipoEvento === filters.tipoEvento);
          }
          if (filters?.fromDate) {
            results = results.filter(a => new Date(a.fechaEventoUtc) >= new Date(filters.fromDate!));
          }
          if (filters?.toDate) {
            results = results.filter(a => new Date(a.fechaEventoUtc) <= new Date(filters.toDate!));
          }
          resolve(results);
        }, 300);
      });
    }

    const params = new URLSearchParams();
    if (filters?.tipoEvento) params.append("tipoEvento", filters.tipoEvento);
    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);

    const queryStr = params.toString();
    const url = `${API_BASE_URL}/audit${queryStr ? `?${queryStr}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch global audit trail");
    return response.json();
  },
};
