import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { NotificacionDto } from "./types";

export const useNotifications = (unreadOnly: boolean = false) =>
  useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: () => apiClient.get<NotificacionDto[]>("/notifications", { params: { unreadOnly } }).then(res => res.data),
    refetchInterval: 30_000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/notifications/${id}/read`).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

