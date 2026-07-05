import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";

export interface DeleteAccountRequest {
  confirmation: string;
  password: string;
  deletionReason?: string;
}

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useDeleteAccount"],
    mutationFn: (data: DeleteAccountRequest) =>
      apiClient.post<{ message: string }>("/account/delete", data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

const useRecoverAccount = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationKey: ["useRecoverAccount"],
    mutationFn: () =>
      apiClient.post<{ message: string }>("/account/recover").then((res) => res.data),
  });
