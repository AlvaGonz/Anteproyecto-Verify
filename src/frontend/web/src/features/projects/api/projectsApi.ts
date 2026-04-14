import {
  ProyectoDto,
  CreateProyectoDto,
  UpdateProyectoDto,
  ProjectStatus,
  IntegrityStatus,
} from "../types";
import { mockProjects } from "../../../infrastructure/mock";
import { Result, success, failure } from "../../../shared/utils/functional";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

// Local state for mocks to allow updates during the session
let localMockProjects = [...mockProjects];

export type ProjectError = 
  | { _tag: "NotFound"; id: string }
  | { _tag: "Unauthorized" }
  | { _tag: "ValidationError"; errors: string[] }
  | { _tag: "ServerError"; message: string }
  | { _tag: "UnknownError"; original: unknown };

export const projectsApi = {
  getProjects: async (): Promise<Result<ProyectoDto[], ProjectError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => 
          setTimeout(() => resolve(success([...localMockProjects])), 500)
        );
      }
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) return failure({ _tag: "ServerError", message: "Failed to fetch projects" });
      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  getProjectById: async (id: string): Promise<Result<ProyectoDto, ProjectError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const project = localMockProjects.find((p) => p.id === id);
            if (project) resolve(success({ ...project }));
            else resolve(failure({ _tag: "NotFound", id }));
          }, 300);
        });
      }
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (response.status === 404) return failure({ _tag: "NotFound", id });
      if (!response.ok) return failure({ _tag: "ServerError", message: "Failed to fetch project" });
      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  createProject: async (data: CreateProyectoDto): Promise<Result<ProyectoDto, ProjectError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newProject: ProyectoDto = {
              id: `proj-${Math.random().toString(36).substr(2, 9)}`,
              codigoInterno: `VF-NEW-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
              nombre: data.nombre,
              ubicacionTexto: data.ubicacionTexto,
              categoria: data.categoria || 1, // Default to Residencial
              datosDesarrollador: data.datosDesarrollador,
              designacionCatastral: data.designacionCatastral,
              estadoProyecto: ProjectStatus.Draft,
              estadoIntegridad: IntegrityStatus.Pending,
              usuarioCreadorId: data.usuarioCreadorId,
              createdAtUtc: new Date().toISOString(),
            };
            localMockProjects.push(newProject);
            resolve(success({ ...newProject }));
          }, 500);
        });
      }
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) return failure({ _tag: "ServerError", message: "Failed to create project" });
      const result = await response.json();
      return success(result);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  updateProject: async (
    id: string,
    data: UpdateProyectoDto,
  ): Promise<Result<ProyectoDto, ProjectError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const index = localMockProjects.findIndex((p) => p.id === id);
            if (index !== -1) {
              localMockProjects[index] = {
                ...localMockProjects[index],
                ...data,
                updatedAtUtc: new Date().toISOString(),
              };
              resolve(success({ ...localMockProjects[index] }));
            } else {
              resolve(failure({ _tag: "NotFound", id }));
            }
          }, 500);
        });
      }
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) return failure({ _tag: "ServerError", message: "Failed to update project" });
      const result = await response.json();
      return success(result);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  updateProjectStatus: async (
    id: string,
    status: ProjectStatus,
  ): Promise<Result<ProyectoDto, ProjectError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const index = localMockProjects.findIndex((p) => p.id === id);
            if (index !== -1) {
              localMockProjects[index] = {
                ...localMockProjects[index],
                estadoProyecto: status,
                updatedAtUtc: new Date().toISOString(),
              };
              resolve(success({ ...localMockProjects[index] }));
            } else {
              resolve(failure({ _tag: "NotFound", id }));
            }
          }, 500);
        });
      }
      const response = await fetch(`${API_BASE_URL}/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      });
      if (!response.ok) return failure({ _tag: "ServerError", message: "Failed to update status" });
      const result = await response.json();
      return success(result);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },
};
