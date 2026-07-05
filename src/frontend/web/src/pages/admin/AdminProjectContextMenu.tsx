import React from "react";
import { Link } from "react-router-dom";
import { ProjectStatus } from "../../features/projects/types";
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Activity,
  FileCheck,
  Trash2,
} from "lucide-react";

interface AdminProjectContextMenuProps {
  project: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  updateStatus: (params: { id: string; status: ProjectStatus }) => void;
  deleteProject: (id: string) => void;
}

export const AdminProjectContextMenu: React.FC<AdminProjectContextMenuProps> = ({
  project,
  isOpen,
  onToggle,
  onClose,
  updateStatus,
  deleteProject,
}) => (
  <>
    <button type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
      title="Opciones"
    >
      <MoreVertical className="w-5 h-5" />
    </button>

    {isOpen && (
      <>
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default"
          aria-label="Cerrar menú"
          onClick={(e) => { e.preventDefault(); onClose(); }}
        />
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2">
          <Link
            to={`/admin/projects/${project.id}/edit`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-gray-400" />
            Validaciones
          </Link>
          <Link
            to={`/admin/projects/${project.id}/documents`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FolderKanban className="w-4 h-4 text-gray-400" />
            Documentos
          </Link>
          <Link
            to={`/admin/projects/${project.id}/audit`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Activity className="w-4 h-4 text-gray-400" />
            Auditoría
          </Link>

          <div className="my-1 border-t border-gray-100"></div>

          {project.estadoProyecto === ProjectStatus.Draft && (
            <button type="button"
              onClick={(e) => {
                e.preventDefault();
                updateStatus({ id: project.id, status: ProjectStatus.InReview });
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors w-full"
            >
              <Activity className="w-4 h-4" />
              Enviar a Revisión
            </button>
          )}

          {project.estadoProyecto === ProjectStatus.InReview && (
            <>
              <button type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updateStatus({ id: project.id, status: ProjectStatus.Validated });
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar (Validado)
              </button>
              <button type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updateStatus({ id: project.id, status: ProjectStatus.Observed });
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors w-full"
              >
                <AlertTriangle className="w-4 h-4" />
                Observar
              </button>
            </>
          )}

          {project.estadoProyecto === ProjectStatus.Validated && (
            <button type="button"
              onClick={(e) => {
                e.preventDefault();
                updateStatus({ id: project.id, status: ProjectStatus.Published });
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors w-full"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publicar (Terminado)
            </button>
          )}

          <div className="my-1 border-t border-gray-100"></div>
          <button type="button"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm(`¿Eliminar "${project.nombre}"? Esta acción no se puede deshacer.`)) {
                deleteProject(project.id);
              }
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </>
    )}
  </>
);
