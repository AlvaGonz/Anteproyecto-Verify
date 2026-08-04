import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCertification, useIssueSeal } from "../useCertifications";

vi.mock("../../../../infrastructure/api/client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: null }),
    post: vi.fn().mockResolvedValue({ data: { isSuccess: true, codigoSello: "VERIFINCA-X" } }),
  },
}));

import { apiClient } from "../../../../infrastructure/api/client";

describe("useCertifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(apiClient.get).mockClear();
    vi.mocked(apiClient.post).mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("consulta el sello en el endpoint del backend", async () => {
    renderHook(() => useCertification("proj-123"), { wrapper });
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(apiClient.get).toHaveBeenCalledWith("/proyectos/proj-123/sello-integridad");
  });

  it("emite el sello en el endpoint del backend", async () => {
    const { result } = renderHook(() => useIssueSeal("proj-123"), { wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });
    expect(apiClient.post).toHaveBeenCalledWith("/proyectos/proj-123/sello-integridad");
  });
});
