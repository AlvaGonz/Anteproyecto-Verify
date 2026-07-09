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
    mutationKey: ['useNotifications'],
    mutationFn: (id: string) =>
      apiClient.post(`/notifications/${id}/read`).then(res => res.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = qc.getQueryData(["notifications", true]);
      qc.setQueryData(["notifications", true], (old: any) => {
        if (!old) return [];
        return old.filter((n: any) => {
          const nId = n.idNotificacion || n.id || n.Id || n.ID;
          return nId !== id;
        });
      });
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        qc.setQueryData(["notifications", true], context.previousNotifications);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useNotifications_markAll'],
    mutationFn: () =>
      apiClient.post(`/notifications/read-all`).then(res => res.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = qc.getQueryData(["notifications", true]);
      qc.setQueryData(["notifications", true], []);
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        qc.setQueryData(["notifications", true], context.previousNotifications);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

