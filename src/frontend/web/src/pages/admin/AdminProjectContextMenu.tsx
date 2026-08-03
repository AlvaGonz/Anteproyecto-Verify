import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProjectStatus } from "../../features/projects/types";
import {
  FolderKanban,
  CheckCircle2,
  MoreVertical,
  Activity,
  FileCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface AdminProjectContextMenuProps {
  project: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  updateStatus: (params: { id: string; status: ProjectStatus }) => void;
  deleteProject: (id: string) => void;
}

export const AdminProjectContextMenu: React.FC<AdminProjectContextMenuProps> = React.memo(({
  project,
  isOpen,
  onToggle,
  onClose,
  updateStatus,
  deleteProject,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDeleteModalOpen) {
      cancelButtonRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsDeleteModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener("keydown", handleKey);
      };
    }
  }, [isDeleteModalOpen]);

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = () => {
    deleteProject(project.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  return (
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
              data-testid="delete-trigger"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleteModalOpen(true);
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

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={closeDeleteModal}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-body"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
             </div>
              <div className="flex-1 min-w-0">
                <h2
                  id="delete-project-title"
                  className="text-lg font-bold text-secondary leading-tight"
                >
                  Eliminar proyecto
               </h2>
                <p
                  id="delete-project-body"
                  className="mt-2 text-sm text-gray-600 leading-relaxed"
                >
                  Estás a punto de eliminar{" "}
                  <span className="font-semibold text-secondary break-words">
                    «{project.nombre}»
                 </span>
                  . Esta acción es irreversible y no se puede deshacer.
               </p>
             </div>
           </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
              >
                Cancelar
             </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-colors"
              >
                Eliminar
             </button>
           </div>
         </div>
       </div>
      )}
    </>
  );
});
