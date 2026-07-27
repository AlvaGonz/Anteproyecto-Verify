import React, { useState } from "react";
import { X, Download, FileSpreadsheet } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { apiClient } from "../../infrastructure/api/client";

interface InterestRecord {
  tipo: string;
  proyectoId: string;
  nombreProyecto: string;
  usuarioId: string;
  nombreUsuario: string;
  avatarUrl?: string;
  fecha: string;
  rnc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  provincia?: string;
}

interface ExportInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intereses: InterestRecord[];
}

export const ExportInterestsModal: React.FC<ExportInterestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [exportType, setExportType] = useState<"Todos" | "Interesados" | "Mis Intereses">("Todos");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Call backend export endpoint which loads the real templates, populates data, and retains styles & logo
      const response = await apiClient.get("/projects/interests/export", {
        params: { type: exportType },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Construct filename to match requested: Reporte_{Tipo}_D-M-Y H_Min.xlsx
      const now = new Date();
      const d = now.getDate();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const h = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const fileTypeLabel = exportType === "Todos"
        ? "Todos"
        : (exportType === "Interesados" ? "Interesados" : "Mis_Intereses");
      
      a.download = `Reporte_${fileTypeLabel}_${d}-${m}-${y} ${h}_${min}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al exportar intereses:", error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="text-amber-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Exportar Reporte de Intereses</h3>
                  <p className="text-xs text-slate-500">Selecciona el tipo de datos que deseas exportar a Excel</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => setExportType("Todos")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    exportType === "Todos"
                      ? "border-amber-500 bg-amber-50/30 text-amber-900"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold">Todos (Ambos casos)</p>
                    <p className="text-xs opacity-75 mt-0.5">Exporta la lista completa de solicitudes y proyectos de interés</p>
                  </div>
                  <input
                    type="radio"
                    checked={exportType === "Todos"}
                    onChange={() => setExportType("Todos")}
                    className="accent-amber-500"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("Interesados")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    exportType === "Interesados"
                      ? "border-amber-500 bg-amber-50/30 text-amber-900"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold">Interesados</p>
                    <p className="text-xs opacity-75 mt-0.5">Exporta únicamente los usuarios interesados en tus proyectos</p>
                  </div>
                  <input
                    type="radio"
                    checked={exportType === "Interesados"}
                    onChange={() => setExportType("Interesados")}
                    className="accent-amber-500"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("Mis Intereses")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    exportType === "Mis Intereses"
                      ? "border-amber-500 bg-amber-50/30 text-amber-900"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold">Mis Intereses</p>
                    <p className="text-xs opacity-75 mt-0.5">Exporta los proyectos de terceros en los que mostraste interés</p>
                  </div>
                  <input
                    type="radio"
                    checked={exportType === "Mis Intereses"}
                    onChange={() => setExportType("Mis Intereses")}
                    className="accent-amber-500"
                  />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Download size={16} />
                  {isExporting ? "Exportando..." : "Descargar"}
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};
