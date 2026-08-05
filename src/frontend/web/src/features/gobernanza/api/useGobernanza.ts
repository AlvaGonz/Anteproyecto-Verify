import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { GobernanzaVerificationResponse, DocumentTypeGobernanza, VerificationPayload } from "../types";

interface VerifyDocumentParams {
  documentType: DocumentTypeGobernanza;
  payload: VerificationPayload;
  proyectoId?: string;
  documentoId?: string;
}

export const useVerifyDocument = () => {
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
      return res.data;
    },
  });
};
