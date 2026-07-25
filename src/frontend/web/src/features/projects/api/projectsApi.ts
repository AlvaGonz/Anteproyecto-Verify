import { apiClient } from "../../../infrastructure/api/client";
import { 
  ProyectoDto, 
  CreateProyectoDto, 
  UpdateProyectoDto, 
  ProjectStatus, 
  IntegrityStatus,
  ProjectError,
  CatastroLookupDto,
  StatusEligibility,
} from "../types";
import { Result, success, failure } from "@/shared/utils/functional";

const mapError = (error: any, id?: string): ProjectError => {
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message = data?.detail || data?.message || error.message || "API error";
    if (status === 404) {
      return { _tag: "NotFound", id: id || "" };
    }
    if (status === 401 || status === 403) {
      return { _tag: "Unauthorized" };
    }
    if (status === 400 || status === 422) {
      // API might return standard ProblemDetails or validation errors
      return { _tag: "ValidationError", errors: data?.errors ? Object.values(data.errors).flat() : [message] };
    }
    if (status === 402) {
      return { _tag: "LimitReached", message };
    }
    return { _tag: "ServerError", message };
  }
  return { _tag: "UnknownError", original: error };
};

export const projectsApi = {
  async getProjects(): Promise<Result<ProyectoDto[], ProjectError>> {
    try {
      const response = await apiClient.get<ProyectoDto[]>("/projects");
      return success(response.data);
    } catch (error: any) {
      const mapped = mapError(error);
      if (mapped._tag === "UnknownError") {
        return failure(mapped);
      }
      return failure({ _tag: "ServerError", message: error.message || "Server Error" });
    }
  },

  async getProjectById(id: string): Promise<Result<ProyectoDto, ProjectError>> {
    try {
      const response = await apiClient.get<ProyectoDto>(`/projects/${id}`);
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async createProject(data: CreateProyectoDto & { fotosNuevas?: File[] }): Promise<Result<ProyectoDto, ProjectError>> {
    try {
      const { fotosNuevas: _, ...payload } = data as any;
      const enriched = { ...payload, estadoProyecto: ProjectStatus.Draft, estadoIntegridad: IntegrityStatus.Pending };
      const response = await apiClient.post<ProyectoDto>("/projects", enriched);
      return success(response.data);
    } catch (error: any) {
      const mapped = mapError(error);
      if (mapped._tag === "ServerError") return failure(mapped);
      return failure({ _tag: "ServerError", message: error.message || "Server Error" });
    }
  },

  async updateProject(id: string, data: UpdateProyectoDto & { fotosNuevas?: File[] }): Promise<Result<ProyectoDto, ProjectError>> {
    try {
      const { fotosNuevas: _, ...payload } = data;
      const response = await apiClient.put<ProyectoDto>(`/projects/${id}`, payload);
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async updateProjectStatus(id: string, status: ProjectStatus): Promise<Result<ProyectoDto, ProjectError>> {
    if (!Object.values(ProjectStatus).includes(status)) {
      throw new Error("Invalid project status");
    }
    try {
      const response = await apiClient.patch<ProyectoDto>(`/projects/${id}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
      });
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },



  async lookupCatastroByGps(lat: string, lon: string): Promise<Result<CatastroLookupDto, ProjectError>> {
    try {
      const response = await apiClient.get<CatastroLookupDto>(`/projects/catastro/lookup?latitud=${lat}&longitud=${lon}`);
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error));
    }
  },

  async uploadProjectImage(file: File): Promise<Result<string, ProjectError>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<{ url: string }>("/projects/upload-image", formData);
      return success(response.data.url);
    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      return failure(mapError(error));
    }
  },

  async getProjectStatusEligibility(id: string): Promise<Result<StatusEligibility, ProjectError>> {
    try {
      const response = await apiClient.get<StatusEligibility>(`/projects/${id}/status-eligibility`);
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async registerInterest(id: string): Promise<Result<void, ProjectError>> {
    try {
      await apiClient.post(`/projects/${id}/interest`);
      return success(undefined);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async saveProject(id: string): Promise<Result<void, ProjectError>> {
    try {
      await apiClient.post(`/projects/${id}/save`);
      return success(undefined);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async unsaveProject(id: string): Promise<Result<void, ProjectError>> {
    try {
      await apiClient.delete(`/projects/${id}/save`);
      return success(undefined);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async getInterests(): Promise<Result<any[], ProjectError>> {
    try {
      const response = await apiClient.get<any[]>("/projects/interests");
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error));
    }
  },

  async getSavedProjects(): Promise<Result<ProyectoDto[], ProjectError>> {
    try {
      const response = await apiClient.get<ProyectoDto[]>("/projects/saved");
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error));
    }
  }
};