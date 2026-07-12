import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../infrastructure/api/dashboard.api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminDashboardApi.getStats,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
