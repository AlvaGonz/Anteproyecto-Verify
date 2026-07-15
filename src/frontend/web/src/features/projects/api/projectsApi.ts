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
} from "../types";

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

type ApiResult<T> = 
  | { _tag: "Success"; data: T }
  | { _tag: "Failure"; error: ProjectError };

export const projectsApi = {
  async getProjects(): Promise<ApiResult<ProyectoDto[]>> {
    try {
      const response = await apiClient.get<ProyectoDto[]>("/projects");
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      const mapped = mapError(error);
      if (mapped._tag === "UnknownError") {
        return { _tag: "Failure", error: mapped };
      }
      return { _tag: "Failure", error: { _tag: "ServerError", message: error.message || "Server Error" } };
    }
  },

  async getProjectById(id: string): Promise<ApiResult<ProyectoDto>> {
    try {
      const response = await apiClient.get<ProyectoDto>(`/projects/${id}`);
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      return { _tag: "Failure", error: mapError(error, id) };
    }
  },

  async createProject(data: CreateProyectoDto & { fotosNuevas?: File[] }): Promise<ApiResult<ProyectoDto>> {
    try {
      const { fotosNuevas: _, ...payload } = data as any;
      const enriched = { ...payload, estadoProyecto: ProjectStatus.Draft, estadoIntegridad: IntegrityStatus.Pending };
      const response = await apiClient.post<ProyectoDto>("/projects", enriched);
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      const mapped = mapError(error);
      if (mapped._tag === "ServerError") return { _tag: "Failure", error: mapped };
      return { _tag: "Failure", error: { _tag: "ServerError", message: error.message || "Server Error" } };
    }
  },

  async updateProject(id: string, data: UpdateProyectoDto & { fotosNuevas?: File[] }): Promise<ApiResult<ProyectoDto>> {
    try {
      const { fotosNuevas: _, ...payload } = data;
      const response = await apiClient.put<ProyectoDto>(`/projects/${id}`, payload);
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      return { _tag: "Failure", error: mapError(error, id) };
    }
  },

  async updateProjectStatus(id: string, status: ProjectStatus): Promise<ApiResult<ProyectoDto>> {
    if (!Object.values(ProjectStatus).includes(status) || typeof status !== "number") {
      throw new Error("Invalid project status");
    }
    try {
      const response = await apiClient.patch<ProyectoDto>(`/projects/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      });
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      return { _tag: "Failure", error: mapError(error, id) };
    }
  },

  async getProjectDiagnosis(id: string): Promise<ApiResult<DocumentDiagnosisDto>> {
    try {
      const response = await apiClient.get<DocumentDiagnosisDto>(`/projects/${id}/documents/diagnosis`);
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      return { _tag: "Failure", error: mapError(error, id) };
    }
  },

  async lookupCatastroByGps(lat: string, lon: string): Promise<ApiResult<CatastroLookupDto>> {
    try {
      const response = await apiClient.get<CatastroLookupDto>(`/projects/catastro/lookup?latitud=${lat}&longitud=${lon}`);
      return { _tag: "Success", data: response.data };
    } catch (error: any) {
      return { _tag: "Failure", error: mapError(error) };
    }
  }
};
