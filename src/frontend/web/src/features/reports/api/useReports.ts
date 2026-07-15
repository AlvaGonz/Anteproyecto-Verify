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
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationKey: ['useReports'],
    mutationFn: async (projectId: string | number) => {
      const response = await apiClient.post(`/projects/${projectId}/reports/pdf`, {}, { responseType: 'blob' }).then(res => res.data);
      return response as Blob;
    },
  });

export const useGenerateExcel = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationKey: ['useGenerateExcel'],
    mutationFn: async (projectId: string | number) => {
      const response = await apiClient.post(`/projects/${projectId}/reports/excel`, {}, { responseType: 'blob' }).then(res => res.data);
      return response as Blob;
    },
  });

export const useQueryGeminiProxy = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationKey: ['useQueryGeminiProxy'],
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
    retry: (failureCount: number, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
