import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../infrastructure/api/dashboard.api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminDashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
