import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./projectsApi";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { isSuccess } from "@/shared/utils/functional";

export function useProjectsInteractions() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const registerInterestMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const result = await projectsApi.registerInterest(projectId);
      if (!isSuccess(result)) {
        const err = result.error as any;
        const msg = err?.message || err?.errors?.[0] || err?.original?.message || "Error al procesar la solicitud.";
        throw new Error(msg);
      }
      return result.value;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "interests"] });
      addToast(
        "El Proyecto ha sido agregado a su seccion de Intereses con exito!",
        "success"
      );
    },
    onError: (error) => {
      addToast(
        error.message || "Error al procesar la solicitud.",
        "error"
      );
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const result = await projectsApi.saveProject(projectId);
      if (!isSuccess(result)) {
        const err = result.error as any;
        const msg = err?.message || err?.errors?.[0] || err?.original?.message || "Error al procesar la solicitud.";
        throw new Error(msg);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "saved"] });
      addToast(
        "El Proyecto ha sido agregado a su seccion de Proy. Guardados con exito!",
        "success"
      );
    },
    onError: (error) => {
      addToast(
        error.message || "Error al procesar la solicitud.",
        "error"
      );
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const result = await projectsApi.unsaveProject(projectId);
      if (!isSuccess(result)) {
        const err = result.error as any;
        const msg = err?.message || err?.errors?.[0] || err?.original?.message || "Error al procesar la solicitud.";
        throw new Error(msg);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "saved"] });
      addToast(
        "El Proyecto ha sido removido de su sección de Proy. Guardados.",
        "info"
      );
    },
    onError: (error) => {
      addToast(
        error.message || "Error al procesar la solicitud.",
        "error"
      );
    }
  });

  return {
    registerInterest: (projectId: string, options?: any) => registerInterestMutation.mutate(projectId, options),
    isRegisteringInterest: registerInterestMutation.isPending,
    saveProject: (projectId: string, options?: any) => saveMutation.mutate(projectId, options),
    isSaving: saveMutation.isPending,
    unsaveProject: (projectId: string, options?: any) => unsaveMutation.mutate(projectId, options),
    isUnsaving: unsaveMutation.isPending,
  };
}

export function useInterests(enabled: boolean = true) {
  return useQuery({
    queryKey: ["projects", "interests"],
    queryFn: async () => {
      const result = await projectsApi.getInterests();
      if (!isSuccess(result)) {
        throw new Error(result.error?.message || "Error al cargar intereses");
      }
      return result.value;
    },
    enabled,
    retry: 1,
    staleTime: 0,
  });
}

export function useSavedProjects(enabled: boolean = true) {
  return useQuery({
    queryKey: ["projects", "saved"],
    queryFn: async () => {
      const result = await projectsApi.getSavedProjects();
      if (!isSuccess(result)) throw new Error(result.error?.message || "Error al cargar proyectos guardados");
      return result.value;
    },
    enabled,
    retry: 1,
    staleTime: 0,
  });
}
