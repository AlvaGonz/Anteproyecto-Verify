import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useProjectStatusBar } from "../useProjectStatusBar";

// Mock projectsApi
vi.mock("../../api/projectsApi", () => ({
  projectsApi: {
    getProjectStatusEligibility: vi.fn().mockResolvedValue({
      _tag: "Success",
      value: { currentStatus: "CREADO", documentCount: 1 },
    }),
    updateProjectStatus: vi.fn().mockResolvedValue({ _tag: "Success", value: { id: "1" } }),
  },
}));

// Mock useToast
vi.mock("../../../../shared/components/ui/Toast/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe("useProjectStatusBar", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("invalidates detail after status update", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useProjectStatusBar("proj-123"), { wrapper });

    await act(async () => {
      await result.current.handleStatusChange("REVISION" as any);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["projects", "proj-123"] })
    );
  });

  it("invalidates audit after status update", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useProjectStatusBar("proj-123"), { wrapper });

    await act(async () => {
      await result.current.handleStatusChange("REVISION" as any);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["audit", "proj-123"] })
    );
  });
});
