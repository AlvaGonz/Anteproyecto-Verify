import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "./projectsApi";
import { CategoriaProyectoDto } from "../types";
import { isSuccess } from "@/shared/utils/functional";

export const useCategories = () => {
  return useQuery<CategoriaProyectoDto[], Error>({
    queryKey: ["project-categories"],
    queryFn: async () => {
      const result = await projectsApi.getCategories();
      if (isSuccess(result)) {
        return result.value;
      }
      throw new Error(result.error._tag);
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (rarely changes)
  });
};
