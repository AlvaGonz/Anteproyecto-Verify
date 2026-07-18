import React from "react";
import { Outlet, NavLink, useParams, useLocation } from "react-router-dom";
import { PenTool, FileText, ShieldCheck, ClipboardList } from "lucide-react";
import { ProjectActionBarProvider, ProjectActionBar } from "../../features/projects/components/ProjectActionBarContext";

export const ProjectManageLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditing = !!id && id !== "new";

  const getPageContext = () => {
    if (!isEditing) {
      return {
        title: "Crear Nuevo Proyecto",
        description: "Ingresa los datos básicos para registrar un nuevo proyecto."
      };
    }
    
    if (location.pathname.includes("/documents")) {
      return {
        title: "Expediente Documental",
        description: "Gestiona los documentos asociados a este proyecto."
      };
    }
    
    if (location.pathname.includes("/validations")) {
      return {
        title: "Validación Integral",
        description: "Revisa el estado de validación del expediente."
      };
    }
    
    if (location.pathname.includes("/reports")) {
      return {
        title: "Reportes y Auditoría",
        description: "Consulta el historial operativo y reportes."
      };
    }
    
    if (location.pathname.includes("/audit")) {
      return {
        title: "Auditoría",
        description: "Historial de acciones de los usuarios."
      };
    }

    // Default to Edit / Project Details
    return {
      title: "Editar Proyecto",
      description: "Modifica los datos del proyecto existente y gestiona sus dependencias."
    };
  };

  const { title, description } = getPageContext();

  return (
    <div className="max-w-6xl mx-auto p-4 w-full animate-fade-in">
      {/* Title section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#223382] tracking-tight">
          {title}
        </h1>
        <p className="text-base mt-2 text-text-secondary">
          {description}
        </p>
      </div>

      {/* Navigation tabs - Only shown if editing an existing project */}
      {isEditing && (
        <div className="flex flex-wrap border-b border-border mb-8 overflow-x-auto">
          <NavLink
            to={`/admin/projects/${id}/edit`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <PenTool className="w-4 h-4" />
            Detalles del Proyecto
          </NavLink>

          <NavLink
            to={`/admin/projects/${id}/documents`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <FileText className="w-4 h-4" />
            Expediente Documental
          </NavLink>

          <NavLink
            to={`/admin/projects/${id}/validations`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <ShieldCheck className="w-4 h-4" />
            Validación Integral
          </NavLink>

          <NavLink
            to={`/admin/projects/${id}/reports`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <ClipboardList className="w-4 h-4" />
            Reportes y Auditoría
          </NavLink>
        </div>
      )}

      {/* Nested Route Content */}
      <div className="w-full">
        <ProjectActionBarProvider>
          <Outlet />
          <ProjectActionBar />
        </ProjectActionBarProvider>
      </div>
    </div>
  );
};
