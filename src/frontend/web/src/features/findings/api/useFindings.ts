import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { HallazgoDto } from "./types";

export const findingKeys = {
  byProject: (projectId: number) => ["findings", projectId] as const,
};

export const useFindings = (projectId: number) =>
  useQuery({
    queryKey: findingKeys.byProject(projectId),
    queryFn: () =>
      apiClient.get<HallazgoDto[]>(`/projects/${projectId}/findings`).then(res => res.data),
    enabled: !!projectId,
  });

