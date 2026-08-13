import React from "react";
import { Navigation, Globe, Search, AlertTriangle } from "lucide-react";
import { ProyectoDto } from "../types";
import { ProjectFormBasicFields } from "./ProjectFormBasicFields";
import { ProjectFormDetailsFields } from "./ProjectFormDetailsFields";
import { ProjectFormDocumentSection } from "./ProjectFormDocumentSection";
import { useOptionalProjectActionBar } from "./ProjectActionBarContext";

interface ProjectFormLayoutProps {
  error: string | null;
  activeMapTab: "leaflet" | "official";
  setActiveMapTab: (tab: "leaflet" | "official") => void;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  ubicacionTexto: string;
  isSubmitting: boolean;
  isSaveDisabled: boolean;
  initialData?: ProyectoDto;
  onCancel: () => void;
  onDelete?: () => void;
  handleSubmit: (e?: React.FormEvent | boolean) => Promise<void>;
  mapSearchText: string;
  setMapSearchText: (val: string) => void;
  handleSearchCoordinates: () => void;
  duplicateWarningOpen: boolean;
  setDuplicateWarningOpen: (val: boolean) => void;
  // ponytail: grouped to keep interface slim, spread into sub-components
  basicFields: React.ComponentProps<typeof ProjectFormBasicFields>;
  detailsFields: React.ComponentProps<typeof ProjectFormDetailsFields>;
  documentSection: React.ComponentProps<typeof ProjectFormDocumentSection>;
}

export const ProjectFormLayout: React.FC<ProjectFormLayoutProps> = ({
  error,
  activeMapTab,
  setActiveMapTab,
  mapContainerRef,
  iframeRef,
  ubicacionTexto,
  isSubmitting,
  isSaveDisabled,
  initialData,
  onCancel,
  onDelete,
  handleSubmit,
  mapSearchText,
  setMapSearchText,
  handleSearchCoordinates,
  duplicateWarningOpen,
  setDuplicateWarningOpen,
  basicFields,
  detailsFields,
  documentSection,
}) => {
  const actionBarCtx = useOptionalProjectActionBar();

  return (
  <form id="project-form" onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
    {error && (
      <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200 animate-fade-in">
        {error}
      </div>
    )}

    {/* ── TOP: Map Workspace Full-Width ── */}
    <div className="w-full rounded-xl overflow-hidden">
      <div className="vf-card p-6 flex flex-col space-y-4 bg-white/90 backdrop-blur-md w-full">

        {/* Tab Selectors */}
        <div className="flex flex-col sm:flex-row bg-[var(--color-surface-raised)] p-1 rounded-xl border border-[var(--color-border)]/20 shadow-inner gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setActiveMapTab("leaflet")}
            className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
              activeMapTab === "leaflet"
                ? "bg-primary text-white shadow-raised"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Mapa Interactivo
          </button>
          <button
            type="button"
            onClick={() => setActiveMapTab("official")}
            className={`hidden flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
              activeMapTab === "official"
                ? "bg-primary text-white shadow-raised"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Catastro Oficial RI
          </button>
        </div>

        {/* Instructions */}
        <p className="text-xs text-[var(--color-text-secondary)] italic">
          {activeMapTab === "leaflet"
            ? "Seleccione una provincia o haga clic en el mapa para posicionar el marcador, extraer coordenadas GPS y obtener la Designación Catastral."
            : ubicacionTexto
              ? `Portal Catastral RI — mostrando: ${ubicacionTexto}. El mapa se centra automáticamente en la provincia seleccionada.`
              : "Portal de Consulta Geográfica Oficial del Registro Inmobiliario. Seleccione una provincia para centrar el mapa automáticamente."}
        </p>

        {/* ── Leaflet Interactive Map ── */}
        <div className={activeMapTab === "leaflet" ? "block relative" : "hidden"}>
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] md:h-[500px] rounded-2xl border border-[var(--color-border)]/30 shadow-inner overflow-hidden"
            style={{ zIndex: 1 }}
          />
          <div className="absolute top-4 right-4 z-[1000] flex items-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-[var(--color-border)]/20 p-1">
            <input
              type="text"
              placeholder="Lat, Lng..."
              value={mapSearchText}
              onChange={(e) => setMapSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchCoordinates();
                }
              }}
              className="px-3 py-1.5 text-sm bg-transparent outline-none w-48 text-[var(--color-text-primary)]"
            />
            <button
              type="button"
              onClick={handleSearchCoordinates}
              className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-primary transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Official RI Cadastral Iframe (Cropped) ── */}
        <div
          className={activeMapTab === "official" ? "block relative overflow-hidden rounded-2xl border-b-[8px] border-[#0050dd] shadow-inner" : "hidden"}
          style={{ height: 500 }}
        >
          <iframe
            ref={iframeRef}
            src="https://servicios.ri.gob.do/ConsultaParcelario"
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
            className="border-none absolute"
            title="Consulta Parcelario Registro Inmobiliario"
            style={{
              top: "-340px",
              left: "-60px",
              width: "calc(100% + 120px)",
              height: "calc(100% + 450px)",
            }}
          />
        </div>
      </div>
    </div>

    {/* ── BOTTOM: Form Fields in 2-col grid ── */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProjectFormBasicFields {...basicFields} />
      <ProjectFormDetailsFields {...detailsFields} />
      <ProjectFormDocumentSection {...documentSection} />
    </div>

    {/* ── Action Buttons (hidden when ProjectActionBarProvider wraps us) ── */}
    {!actionBarCtx && (
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-[var(--color-border)]/20">
        {initialData && onDelete && (
          <button type="button" onClick={onDelete} className="vf-btn-danger w-full sm:w-auto sm:mr-auto">
            Eliminar Expediente
          </button>
        )}
        <button type="button" onClick={onCancel} className="vf-btn-secondary w-full sm:w-auto">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaveDisabled}
          className={`vf-btn-primary w-full sm:w-auto sm:min-w-[140px] ${
            isSaveDisabled ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 hover:shadow-none" : ""
          }`}
        >
          {isSubmitting ? "Guardando..." : "Guardar Proyecto"}
        </button>
      </div>
    )}

    {duplicateWarningOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="flex items-center gap-4 mb-4 text-[#223382]">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Posible Duplicado</h3>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Hemos detectado que ya existe un proyecto registrado con datos idénticos (Matrícula, Designación Catastral o Coordenadas GPS). 
            ¿Está seguro de que desea continuar registrando este expediente?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDuplicateWarningOpen(false)}
              className="vf-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setDuplicateWarningOpen(false);
                handleSubmit(true as any); // pass forceSubmit=true
              }}
              className="vf-btn-primary bg-red-600 hover:bg-red-700"
            >
              Sí, Registrar Duplicado
            </button>
          </div>
        </div>
      </div>
    )}
  </form>
  );
};
