import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useDocumentValidationResult, useVerifyDocument } from "../useGobernanza";

vi.mock("@/infrastructure/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "@/infrastructure/api/client";

describe("useGobernanza - Persistence & Verification", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("recupera el resultado de validación guardado desde el backend", async () => {
    const mockResult = {
      isValid: true,
      matchPercentage: 100,
      message: "Validación Exitosa (100% coincidencia)",
      matchedData: { matricula: "12345" },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResult });

    const { result } = renderHook(() => useDocumentValidationResult("doc-abc"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResult);
    expect(apiClient.get).toHaveBeenCalledWith("/gobernanzadedatos/resultado/doc-abc");
    expect(localStorage.getItem("vf_val_doc-abc")).toBe(JSON.stringify(mockResult));
  });

  it("utiliza fallback de localStorage si el backend retorna 404", async () => {
    const cachedResult = {
      isValid: true,
      matchPercentage: 90,
      message: "Coincidencia Parcial",
      matchedData: { matricula: "12345" },
    };
    localStorage.setItem("vf_val_doc-cached", JSON.stringify(cachedResult));

    vi.mocked(apiClient.get).mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useDocumentValidationResult("doc-cached"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(cachedResult);
  });

  it("persiste en localStorage y queryClient al ejecutar verifyDocument", async () => {
    const mockVerification = {
      isValid: true,
      matchPercentage: 100,
      message: "Validación Exitosa",
      matchedData: { superficialM2: "500" },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockVerification });

    const { result } = renderHook(() => useVerifyDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        documentType: "catastro",
        payload: { matricula: "12345" },
        proyectoId: "proj-1",
        documentoId: "doc-99",
      });
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/gobernanzadedatos/verificar/catastro",
      expect.objectContaining({
        matricula: "12345",
        proyectoId: "proj-1",
        documentoId: "doc-99",
        tipoDocumento: "catastro",
      })
    );

    expect(localStorage.getItem("vf_val_doc-99")).toBe(JSON.stringify(mockVerification));
    expect(queryClient.getQueryData(["gobernanza", "resultado", "doc-99"])).toEqual(mockVerification);
  });
});
