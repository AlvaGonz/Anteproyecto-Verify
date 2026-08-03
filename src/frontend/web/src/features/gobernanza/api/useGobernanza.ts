import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { GobernanzaVerificationResponse, DocumentTypeGobernanza, VerificationPayload } from "../types";

interface VerifyDocumentParams {
  documentType: DocumentTypeGobernanza;
  payload: VerificationPayload;
}

export const useVerifyDocument = () => {
  return useMutation({
    mutationKey: ['verifyDocumentGobernanza'],
    mutationFn: async ({ documentType, payload }: VerifyDocumentParams) => {
      const res = await apiClient.post<GobernanzaVerificationResponse>(
        `/gobernanzadedatos/verificar/${documentType}`, 
        payload
      );
      return res.data;
    },
  });
};
