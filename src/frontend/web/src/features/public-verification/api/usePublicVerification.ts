import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { PublicVerificationDto } from "../../certifications/types";

export const usePublicVerification = (codigoVerificacion: string) =>
  useQuery({
    queryKey: ["publicVerification", codigoVerificacion],
    queryFn: () =>
      apiClient.get<PublicVerificationDto>(`/public/verifications/${codigoVerificacion}`).then(res => res.data),
    enabled: !!codigoVerificacion,
    staleTime: 1000 * 60 * 30, // public data, 30 min cache
    retry: false,
  });
