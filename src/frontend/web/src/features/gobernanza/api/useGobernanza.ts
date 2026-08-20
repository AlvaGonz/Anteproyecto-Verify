import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { GobernanzaVerificationResponse, DocumentTypeGobernanza, VerificationPayload } from "../types";

interface VerifyDocumentParams {
  documentType: DocumentTypeGobernanza;
  payload: VerificationPayload;
  proyectoId?: string;
  documentoId?: string;
}

export const useDocumentValidationResult = (documentoId?: string) => {
  return useQuery<GobernanzaVerificationResponse | null>({
    queryKey: ["gobernanza", "resultado", documentoId],
    queryFn: async () => {
      if (!documentoId) return null;
      try {
        const res = await apiClient.get<GobernanzaVerificationResponse>(
          `/gobernanzadedatos/resultado/${documentoId}`
        );
        if (res.data) {
          try {
            localStorage.setItem(`vf_val_${documentoId}`, JSON.stringify(res.data));
          } catch {}
        }
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const local = localStorage.getItem(`vf_val_${documentoId}`);
          if (local) {
            try { return JSON.parse(local); } catch {}
          }
          return null;
        }
        const local = localStorage.getItem(`vf_val_${documentoId}`);
        if (local) {
          try { return JSON.parse(local); } catch {}
        }
        return null;
      }
    },
    enabled: !!documentoId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['verifyDocumentGobernanza'],
    mutationFn: async ({ documentType, payload, proyectoId, documentoId }: VerifyDocumentParams) => {
      // Add context ids to payload so backend can save DatoValidado
      const enrichedPayload = {
        ...payload,
        proyectoId,
        documentoId,
        tipoDocumento: documentType
      };

      const res = await apiClient.post<GobernanzaVerificationResponse>(
        `/gobernanzadedatos/verificar/${documentType}`, 
        enrichedPayload
      );

      if (documentoId && res.data) {
        try {
          localStorage.setItem(`vf_val_${documentoId}`, JSON.stringify(res.data));
        } catch {}
      }

      return res.data;
    },
    onSuccess: (data, variables) => {
      const pId = variables.proyectoId || variables.payload.proyectoId;
      if (pId) {
        queryClient.invalidateQueries({ queryKey: ["findings", pId] });
      }
      if (variables.documentoId) {
        queryClient.setQueryData(["gobernanza", "resultado", variables.documentoId], data);
        queryClient.invalidateQueries({ queryKey: ["gobernanza", "resultado", variables.documentoId] });
      }
    }
  });
};
