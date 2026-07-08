import { useState, useCallback } from "react";
import { apiClient } from "../../infrastructure/api/client";

export interface DgiiData {
  rnc: string;
  nombreRazonSocial: string | null;
  nombreComercial: string | null;
  actividadEconomica: string | null;
}

export function useDgiiLookup() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRnc = useCallback(async (rncValue: string): Promise<DgiiData | null> => {
    const cleaned = rncValue.replace(/[- ]/g, "").trim();
    if (!cleaned) return null;

    setIsSearching(true);
    setError(null);

    try {
      const response = await apiClient.get(`/dgii/rnc/${cleaned}`);
      return response.data as DgiiData;
    } catch (err: any) {
      console.error("Error fetching RNC:", err);
      setError("RNC/Cédula no registrado o inválido");
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { searchRnc, isSearching, error, setError };
}
