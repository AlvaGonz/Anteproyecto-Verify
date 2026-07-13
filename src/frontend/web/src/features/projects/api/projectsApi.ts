import { apiClient } from "../../../infrastructure/api/client";
import { 
  ProyectoDto, 
  CreateProyectoDto, 
  UpdateProyectoDto, 
  ProjectStatus, 
  IntegrityStatus,
  ProjectError,
  DocumentDiagnosisDto,
  CatastroLookupDto,
  StatusEligibility,
} from "../types";
import { success, failure, Result } from "../../../shared/utils/functional";

const mapError = (error: any, id?: string): ProjectError => {
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message || "API error";
    if (status === 404) {
      return { _tag: "NotFound", id: id || "" };
    }
    if (status === 401 || status === 403) {
      return { _tag: "Unauthorized" };
    }
    if (status === 400) {
      return { _tag: "ValidationError", errors: error.response.data?.errors || [message] };
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
    if (!Object.values(ProjectStatus).includes(status) || typeof status !== "number") {
      throw new Error("Invalid project status");
    }
    try {
      const response = await apiClient.patch<ProyectoDto>(`/projects/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      });
      return success(response.data);
    } catch (error: any) {
      return failure(mapError(error, id));
    }
  },

  async getProjectDiagnosis(id: string): Promise<Result<DocumentDiagnosisDto, ProjectError>> {
    try {
      // The backend route is /api/projects/{projectId}/documents/diagnosis
      const response = await apiClient.get<DocumentDiagnosisDto>(`/projects/${id}/documents/diagnosis`);
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
      const response = await apiClient.post<{ url: string }>("/projects/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return success(response.data.url);
    } catch (error: any) {
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
  }
};
