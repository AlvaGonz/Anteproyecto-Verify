import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../infrastructure/api/dashboard.api";
import { useAuth } from "../../../shared/context/AuthContext";

export const useDashboardStats = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  return useQuery({
    queryKey: ["dashboardStats", isAdmin ? "admin" : "user"],
    queryFn: isAdmin ? adminDashboardApi.getStats : adminDashboardApi.getUserStats,
    staleTime: 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!user,
  });
};
