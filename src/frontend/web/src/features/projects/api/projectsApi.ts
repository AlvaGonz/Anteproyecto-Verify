import { apiClient } from "../../../infrastructure/api/client";
import { 
  ProyectoDto, 
  CreateProyectoDto, 
  UpdateProyectoDto, 
  ProjectStatus, 
  IntegrityStatus,
  ProjectError,
  DocumentDiagnosisDto,
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
      let response;
      if (data.fotosNuevas?.length) {
        const form = new FormData();
        const { fotosNuevas, ...rest } = data;
        Object.entries(rest).forEach(([k, v]) => {
          if (v !== undefined) form.append(k, String(v));
        });
        fotosNuevas.forEach((f) => form.append("fotos", f));
        response = await apiClient.post<ProyectoDto>("/projects", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const { fotosNuevas: _, ...payload } = data as any;
        const enriched = { ...payload, estadoProyecto: ProjectStatus.Draft, estadoIntegridad: IntegrityStatus.Pending };
        response = await apiClient.post<ProyectoDto>("/projects", enriched);
      }
      return success(response.data);
    } catch (error: any) {
      const mapped = mapError(error);
      if (mapped._tag === "ServerError") return failure(mapped);
      return failure({ _tag: "ServerError", message: error.message || "Server Error" });
    }
  },

async updateProject(id: string, data: UpdateProyectoDto): Promise<Result<ProyectoDto, ProjectError>> {
     try {
       let response;
       if (data.fotosNuevas?.length) {
         const form = new FormData();
         // append all scalar fields
         Object.entries(data).forEach(([k, v]) => {
           if (k !== 'fotosNuevas' && v !== undefined) form.append(k, String(v));
         });
         data.fotosNuevas.forEach(f => form.append('fotos', f));
         response = await apiClient.put<ProyectoDto>(`/projects/${id}`, form, {
           headers: { 'Content-Type': 'multipart/form-data' },
         });
       } else {
         const { fotosNuevas: _, ...payload } = data;
         response = await apiClient.put<ProyectoDto>(`/projects/${id}`, payload);
       }
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
      const apiStatus = status === ProjectStatus.Published ? "Activo" : "Pendiente";
      const response = await apiClient.patch<ProyectoDto>(`/projects/${id}/status`, { status: apiStatus });
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
  }
};
