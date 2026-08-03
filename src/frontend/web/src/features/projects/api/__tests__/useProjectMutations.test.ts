import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useUpdateProject } from "../useProjectMutations";

// Mock projectsApi
vi.mock("../projectsApi", () => ({
  projectsApi: {
    updateProject: vi.fn().mockResolvedValue({ _tag: "Success", value: { id: "1" } }),
  },
}));

describe("useUpdateProject", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("invalidates statusEligibility after save", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateProject("proj-123"), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ nombre: "Test", ubicacionTexto: "", categoria: "Residencial" as any });
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["projectStatusEligibility", "proj-123"] })
    );
  });

  it("invalidates detail after save", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateProject("proj-123"), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ nombre: "Test", ubicacionTexto: "", categoria: "Residencial" as any });
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["projects", "proj-123"] })
    );
  });
});
