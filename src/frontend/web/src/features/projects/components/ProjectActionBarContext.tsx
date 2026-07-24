import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeleteProject } from "../api/useProjects";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

interface ProjectActionBarValue {
  onSave?: () => Promise<void>;
  isSaving: boolean;
  isSaveDisabled: boolean;
  showDelete: boolean;
}

interface ProjectActionBarCtx extends ProjectActionBarValue {
  onDelete: () => void;
  setOnSave: (fn: (() => Promise<void>) | undefined) => void;
  setIsSaving: (v: boolean) => void;
  setIsSaveDisabled: (v: boolean) => void;
}

const Ctx = createContext<ProjectActionBarCtx | null>(null);

export const useProjectActionBar = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjectActionBar must be used within a ProjectActionBarProvider");
  return ctx;
};

export const useOptionalProjectActionBar = () => useContext(Ctx);

export const ProjectActionBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteMutation = useDeleteProject();
  const { addToast } = useToast();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [onSave, setOnSave] = useState<(() => Promise<void>) | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const showDelete = !!id && id !== "new";

  const onDelete = useCallback(() => {
    deleteDialogRef.current?.showModal();
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    deleteDialogRef.current?.close();
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast("Proyecto eliminado exitosamente", "success");
      navigate("/admin/projects");
    } catch {
      addToast("Error al eliminar el proyecto", "error");
    }
  }, [id, deleteMutation, addToast, navigate]);

  return (
    <Ctx.Provider value={{ onSave, onDelete, isSaving, isSaveDisabled, showDelete, setOnSave, setIsSaving, setIsSaveDisabled }}>
      {children}
      <dialog
        ref={deleteDialogRef}
        className="fixed inset-0 m-auto rounded-2xl shadow-2xl max-w-md w-[90vw] p-0 border-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-8 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <div>
              <h2 id="delete-dialog-title" className="text-lg font-black text-gray-900">Eliminar Proyecto</h2>
              <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            ¿Está seguro de que desea eliminar este proyecto permanentemente? Todos los datos asociados serán borrados.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => deleteDialogRef.current?.close()}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </dialog>
    </Ctx.Provider>
  );
};

const submitProjectForm = () => {
  const form = document.getElementById("project-form") as HTMLFormElement;
  if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
};

export const ProjectActionBar: React.FC = () => {
  const ctx = useContext(Ctx);
  const navigate = useNavigate();

  const isSaving = ctx?.isSaving ?? false;
  const isSaveDisabled = ctx?.isSaveDisabled ?? true;
  const showDelete = ctx?.showDelete ?? false;

  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]/20">
      {showDelete && (
        <button type="button" onClick={ctx?.onDelete} className="vf-btn-danger mr-auto">
          Eliminar Expediente
        </button>
      )}
      <button type="button" onClick={() => navigate("/admin/projects")} className="vf-btn-secondary">
        Cancelar
      </button>
      <button
        type="button"
        onClick={submitProjectForm}
        disabled={isSaveDisabled}
        className={`vf-btn-primary min-w-[140px] ${
          isSaveDisabled ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 hover:shadow-none" : ""
        }`}
      >
        {isSaving ? "Guardando..." : "Guardar Proyecto"}
      </button>
    </div>
  );
};
