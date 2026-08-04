import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

const fetchDisclaimerStatus = async (projectId: string): Promise<{ accepted: boolean }> => {
  const { data } = await apiClient.get(`/projects/${projectId}/validations/disclaimer`);
  return data;
};

const postAcceptDisclaimer = async (projectId: string): Promise<void> => {
  await apiClient.post(`/projects/${projectId}/validations/disclaimer`);
};

export function useValidationDisclaimer(projectId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["validationDisclaimer", projectId],
    queryFn: () => fetchDisclaimerStatus(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
  });

  const acceptMutation = useMutation({
    mutationFn: () => postAcceptDisclaimer(projectId),
    onSuccess: () => {
      queryClient.setQueryData(["validationDisclaimer", projectId], { accepted: true });
    },
  });

  return {
    accepted: data?.accepted ?? false,
    isLoading,
    accept: acceptMutation.mutateAsync,
  };
}
