import React, { useState } from "react";
import { X, Download, FileSpreadsheet } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { useAuth } from "../../shared/context/AuthContext";

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
  intereses,
}) => {
  const { user } = useAuth();
  const [exportType, setExportType] = useState<"Todos" | "Interesados" | "Mis Intereses">("Todos");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Filter records according to the selection
      const filtered = exportType === "Todos" 
        ? intereses 
        : intereses.filter(i => i.tipo === exportType);

      // Create sheet
      const wb = XLSX.utils.book_new();
      const rows: any[][] = [];

      // Row 1 (empty)
      rows.push([]);

      // Row 2: Title in E2 (which is index 4: empty string, empty string, etc.)
      // Todos: "Reporte de Solicitud de interesado y mis interes"
      // Interesados: "Reporte de Solicitud de interesado"
      // Mis Intereses: "Reporte de mis interes"
      let titleText = "";
      if (exportType === "Todos") {
        titleText = "Reporte de Solicitud de interesado y mis interes";
      } else if (exportType === "Interesados") {
        titleText = "Reporte de Solicitud de interesado";
      } else {
        titleText = "Reporte de mis interes";
      }

      rows.push(["", "", "", "", titleText]);

      // Row 3 (empty)
      rows.push([]);

      // Row 4: Column Headers starting at Column C
      const headers = [
        "No.",
        "Usuario",
        "Nombre del Proyecto",
        "Provincia(Proyecto)",
        "Fecha solicitud",
        exportType === "Todos"
          ? "Tipo de Interés"
          : (exportType === "Interesados" ? "Nombre de usuario interesado" : "Nombre de usuario que publica el proyecto"),
        "RNC",
        "Dirreción", // matching spelling of template "Dirreción"
        "Teléfono",
        "Correo electrónico"
      ];
      rows.push(["", "", ...headers]);

      // Data Rows
      filtered.forEach((item, index) => {
        // Date format: D/M/Y H:M
        const dateObj = new Date(item.fecha);
        const formattedDate = !isNaN(dateObj.getTime())
          ? `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
          : item.fecha;

        const row = [
          "", // A
          "", // B
          index + 1, // C: No.
          user?.nombreCompleto || "", // D: Usuario
          item.nombreProyecto, // E: Nombre del Proyecto
          item.provincia || "", // F: Provincia(Proyecto)
          formattedDate, // G: Fecha solicitud
          exportType === "Todos" 
            ? `${item.tipo} - ${item.nombreUsuario}`
            : item.nombreUsuario, // H: related user name
          item.rnc || "", // I: RNC
          item.direccion || "", // J: Dirreción
          item.telefono || "", // K: Teléfono
          item.email || "" // L: Correo electrónico
        ];
        rows.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Set column widths
      ws["!cols"] = [
        { wch: 3 }, // A
        { wch: 3 }, // B
        { wch: 6 }, // C: No.
        { wch: 25 }, // D: Usuario
        { wch: 30 }, // E: Nombre del Proyecto
        { wch: 25 }, // F: Provincia(Proyecto)
        { wch: 20 }, // G: Fecha solicitud
        { wch: 35 }, // H: User relation
        { wch: 15 }, // I: RNC
        { wch: 30 }, // J: Dirreción
        { wch: 15 }, // K: Teléfono
        { wch: 25 }  // L: Correo electrónico
      ];

      XLSX.utils.book_append_sheet(wb, ws, exportType === "Todos" ? "General" : exportType);

      // Filename date suffix format: D-M-Y H-Min
      const now = new Date();
      const d = now.getDate();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const fileTypeLabel = exportType === "Todos"
        ? "Todos"
        : (exportType === "Interesados" ? "Interesados" : "Mis_Intereses");
      const filename = `Reporte_${fileTypeLabel}_${d}-${m}-${y} ${h}_${min}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error al exportar:", error);
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
