import React, { useState } from "react";
import { X, Download, FileSpreadsheet } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { apiClient } from "../../infrastructure/api/client";
import { ProjectStatus } from "../../features/projects/types";
import ExcelJS from "exceljs";

interface ExportProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILTER_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: ProjectStatus.Published, label: "Publicados" },
  { id: ProjectStatus.InReview, label: "En Revisión" },
  { id: ProjectStatus.Draft, label: "Creado" },
  { id: ProjectStatus.Edited, label: "Editado" },
  { id: ProjectStatus.Observed, label: "Con Observaciones" },
];

export const ExportProjectsModal: React.FC<ExportProjectsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterToggle = (id: string) => {
    if (id === "all") {
      setSelectedFilters(["all"]);
      return;
    }
    
    let next = selectedFilters.filter(f => f !== "all");
    if (next.includes(id)) {
      next = next.filter(f => f !== id);
      if (next.length === 0) next = ["all"];
    } else {
      next.push(id);
    }
    setSelectedFilters(next);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let estadosParam: string | undefined = undefined;
      if (!selectedFilters.includes("all") && selectedFilters.length > 0) {
        estadosParam = selectedFilters.join(",");
      }

      const res = await apiClient.get("/projects", {
        params: { page: 1, pageSize: 99999, estados: estadosParam },
      });
      
      const data = res.data as any;
      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else {
        items = data?.items || data?.Items || data?.data || [];
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Expedientes");

      // Title row
      worksheet.mergeCells('B1:J1');
      const titleCell = worksheet.getCell('B1');
      titleCell.value = "Reporte de Expedientes";
      titleCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: "FF9CA3AF" } 
      };
      
      // Header row starts at 3
      worksheet.getRow(3).values = [
        "No. Registros",
        "Fecha Creación",
        "Nombre del Proyecto",
        "Usuario Creador",
        "Provincia",
        "RNC / Cédula del Desarrollador",
        "Desarrollador / Constructora",
        "Matrícula del Inmueble",
        "Coordenadas GPS (Lat, Lng)",
        "Valor Estimado (DOP)",
        "Superficie (m²)"
      ];

      const headerRow = worksheet.getRow(3);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: "FFF97316" } 
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Data rows
      items.forEach((p: any, index: number) => {
        worksheet.addRow([
          index + 1,
          new Date(p.createdAtUtc).toLocaleDateString(),
          p.nombre,
          p.registradoPor?.nombreCompleto || p.usuarioCreadorId,
          p.ubicacionTexto || "",
          p.rncDesarrollador || "",
          p.datosDesarrollador || "",
          p.matricula || "",
          p.ubicacionGps || "",
          p.valorEstimado || 0,
          p.superficieM2 || 0
        ]);
      });

      // Auto-filter
      worksheet.autoFilter = {
        from: 'A3',
        to: 'K3'
      };

      // Column widths
      worksheet.columns = [
        { width: 8 },  // No.
        { width: 15 }, // Fecha
        { width: 40 }, // Nombre
        { width: 25 }, // Usuario
        { width: 20 }, // Provincia
        { width: 30 }, // RNC
        { width: 30 }, // Desarrollador
        { width: 20 }, // Matrícula
        { width: 25 }, // Coordenadas
        { width: 20 }, // Valor
        { width: 15 }  // Superficie
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Expedientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al exportar proyectos:", error);
      alert("Ocurrió un error al intentar exportar los expedientes.");
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
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
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
                  <h3 className="text-lg font-bold text-slate-900">Exportar Expedientes</h3>
                  <p className="text-xs text-slate-500">Selecciona los estados a incluir en el Excel</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {FILTER_OPTIONS.map((f) => (
                  <label
                    key={f.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFilters.includes(f.id)
                        ? "border-amber-500 bg-amber-50/30 text-amber-900"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(f.id)}
                      onChange={() => handleFilterToggle(f.id)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span className="text-sm font-bold">{f.label}</span>
                  </label>
                ))}
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
