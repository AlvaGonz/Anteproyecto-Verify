import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProjects } from "../useProjects";
import { apiClient } from "../../../../infrastructure/api/client";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

vi.mock("../../../../infrastructure/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("useProjects", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("passes startDate and endDate to apiClient", async () => {
    const mockData = { items: [], totalCount: 0, page: 1, pageSize: 50 };
    (apiClient.get as any).mockResolvedValue({ data: mockData });

    const { result } = renderHook(
      () => useProjects(1, 50, undefined, undefined, "2026-08-01", "2026-08-31"),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/projects", {
      params: {
        page: 1,
        pageSize: 50,
        q: undefined,
        estados: undefined,
        startDate: "2026-08-01",
        endDate: "2026-08-31",
      },
    });
  });
});
