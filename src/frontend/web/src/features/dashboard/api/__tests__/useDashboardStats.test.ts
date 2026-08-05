import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useDashboardStats } from "../useDashboardStats";
import { useAuth } from "../../../../shared/context/AuthContext";

vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockGetStats = vi.fn();

vi.mock("../../../../infrastructure/api/dashboard.api", () => ({
  adminDashboardApi: {
    getStats: (...args: any[]) => mockGetStats(...args),
    getUserStats: vi.fn().mockResolvedValue({}),
  },
}));

describe("useDashboardStats", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { role: "admin" } });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("refetches on remount when cache is populated", async () => {
    mockGetStats.mockResolvedValue({ totalProyectos: 5, proyectosPendientes: 1, proyectosAprobados: 4 });

    // first mount populates cache
    const { unmount } = renderHook(() => useDashboardStats(), { wrapper });
    await waitFor(() => { expect(mockGetStats).toHaveBeenCalledTimes(1); });

    unmount();

    // remount with populated cache
    mockGetStats.mockResolvedValue({ totalProyectos: 7, proyectosPendientes: 2, proyectosAprobados: 5 });
    renderHook(() => useDashboardStats(), { wrapper });

    // ponytail: should refetch even with populated cache, otherwise stats are stale after project creation
    await waitFor(() => { expect(mockGetStats).toHaveBeenCalledTimes(2); }, { timeout: 2000 });
  });
});
