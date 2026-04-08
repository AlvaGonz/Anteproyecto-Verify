import {
  ProyectoDto,
  CreateProyectoDto,
  UpdateProyectoDto,
  ProjectStatus,
  IntegrityStatus,
} from "../types";
import { mockProjects } from "../../../infrastructure/mock/mockProjects";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

// Local state for mocks to allow updates during the session
let localMockProjects = [...mockProjects];

export const projectsApi = {
  getProjects: async (): Promise<ProyectoDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve([...localMockProjects]), 500));
    }
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
  },

  getProjectById: async (id: string): Promise<ProyectoDto> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const project = localMockProjects.find((p) => p.id === id);
          if (project) resolve({ ...project });
          else reject(new Error("Project not found"));
        }, 300);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error("Failed to fetch project");
    return response.json();
  },

  createProject: async (data: CreateProyectoDto): Promise<ProyectoDto> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProject: ProyectoDto = {
            id: `proj-${Math.random().toString(36).substr(2, 9)}`,
            codigoInterno: `VF-NEW-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            nombre: data.nombre,
            ubicacionTexto: data.ubicacionTexto,
            estadoProyecto: ProjectStatus.Draft,
            estadoIntegridad: IntegrityStatus.Pending,
            usuarioCreadorId: data.usuarioCreadorId,
            createdAtUtc: new Date().toISOString(),
          };
          localMockProjects.push(newProject);
          resolve({ ...newProject });
        }, 500);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  },

  updateProject: async (
    id: string,
    data: UpdateProyectoDto,
  ): Promise<ProyectoDto> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = localMockProjects.findIndex((p) => p.id === id);
          if (index !== -1) {
            localMockProjects[index] = {
              ...localMockProjects[index],
              ...data,
              updatedAtUtc: new Date().toISOString(),
            };
            resolve({ ...localMockProjects[index] });
          } else {
            reject(new Error("Project not found"));
          }
        }, 500);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update project");
    return response.json();
  },

  updateProjectStatus: async (
    id: string,
    status: ProjectStatus,
  ): Promise<ProyectoDto> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = localMockProjects.findIndex((p) => p.id === id);
          if (index !== -1) {
            localMockProjects[index] = {
              ...localMockProjects[index],
              estadoProyecto: status,
              updatedAtUtc: new Date().toISOString(),
            };
            resolve({ ...localMockProjects[index] });
          } else {
            reject(new Error("Project not found"));
          }
        }, 500);
      });
    }
    const response = await fetch(`${API_BASE_URL}/projects/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
      },
      body: JSON.stringify(status),
    });
    if (!response.ok) throw new Error("Failed to update project status");
    return response.json();
  },
};
