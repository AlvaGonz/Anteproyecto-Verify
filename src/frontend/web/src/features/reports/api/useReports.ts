import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { ReporteDto } from "./types";
import { PublicProjectReportDto } from "../types";

export const useReports = (projectId: string) =>
  useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => apiClient.get<ReporteDto[]>(`/projects/${projectId}/reports`).then(res => res.data),
    enabled: false,
  });

export const useGeneratePdf = () =>
  useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await apiClient.get(`/projects/${projectId}/reports/pdf`, { responseType: 'blob' }).then(res => res.data);
      return response as Blob;
    },
  });

export const useGenerateExcel = () =>
  useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await apiClient.get(`/projects/${projectId}/reports/excel`, { responseType: 'blob' }).then(res => res.data);
      return response as Blob;
    },
  });

export const useQueryGeminiProxy = () =>
  useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await apiClient.post<{ summary: string }>(`/projects/${projectId}/reports/ai-summary`).then(res => res.data);
      return response.summary;
    },
  });

export const usePublicReport = (projectId: string | number) =>
  useQuery({
    queryKey: ["publicReport", projectId],
    queryFn: () => apiClient.get<PublicProjectReportDto>(`/projects/${projectId}/reports/public`).then(res => res.data),
    enabled: !!projectId,
  });
