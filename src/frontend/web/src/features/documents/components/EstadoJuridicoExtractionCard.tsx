import React, { useEffect, useState } from "react";
import { 
  EstadoJuridicoRdExtractionV1, 
  ExtractionStatus, 
  FieldStatus, 
  ExtractedField,
  GeographicResolutionResult
} from "../types";
import { ResolutionAction } from "../schemas/estadoJuridico.schema";
import { AlertTriangle, FileText, Loader2, Info, Pencil, Check, X, BadgeCheck, AlertCircle, MinusCircle } from "lucide-react";

interface EstadoJuridicoExtractionCardProps {
  extraction: EstadoJuridicoRdExtractionV1;
  onEditField?: (fieldName: string, value: string) => Promise<void>;
  onAutoSelectField?: (fieldName: string, resolvedId: string, action: ResolutionAction) => void;
}

interface Province {
  id: string;
  nombre: string;
}

interface Municipality {
  id: string;
  nombre: string;
}

const ResolutionBadge: React.FC<{ resolution: GeographicResolutionResult | null | undefined }> = ({ resolution }) => {
  if (!resolution || resolution.resolutionMethod === 'unresolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-text-secondary/70 bg-text-secondary/10 border border-text-secondary/20">
        <MinusCircle className="w-2.5 h-2.5" />
        No resuelto
      </span>
    );
  }

  const { resolutionMethod, confidence, suggestedAction } = resolution;
  
  if (resolutionMethod === 'exact') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-success bg-success/10 border border-success/20" title="Coincidencia exacta">
        <BadgeCheck className="w-2.5 h-2.5" />
        Exacto ({Math.round(confidence * 100)}%)
      </span>
    );
  }
  
  if (resolutionMethod === 'alias') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-info bg-info/10 border border-info/20" title="Coincidencia por alias">
        <Info className="w-2.5 h-2.5" />
        Alias ({Math.round(confidence * 100)}%)
      </span>
    );
  }
  
  if (resolutionMethod === 'fuzzy') {
    const isReview = suggestedAction === ResolutionAction.Review;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${isReview ? 'text-warning bg-warning/10 border border-warning/20' : 'text-success bg-success/10 border border-success/20'}`} 
            title={isReview ? `Coincidencia aproximada - requiere revisión (${Math.round(confidence * 100)}%)` : `Coincidencia aproximada (${Math.round(confidence * 100)}%)`}>
        <AlertCircle className="w-2.5 h-2.5" />
        {isReview ? 'Revisar' : 'Fuzzy'} ({Math.round(confidence * 100)}%)
      </span>
    );
  }
  
  return null;
};

export const EstadoJuridicoExtractionCard: React.FC<EstadoJuridicoExtractionCardProps> = ({ extraction, onEditField, onAutoSelectField }) => {
  const isProcessing = extraction.extractionStatus === ExtractionStatus.Queued || extraction.extractionStatus === ExtractionStatus.Processing;
  const isError = extraction.extractionStatus === ExtractionStatus.Failed;
  
  // State for dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [provinceError, setProvinceError] = useState<string | null>(null);
  const [municipalityError, setMunicipalityError] = useState<string | null>(null);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      setProvinceError(null);
      try {
        const response = await fetch('/api/geo/provincias');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        const data = await response.json();
        setProvinces(data);
        
        // If there's a province resolution, select it
        if (extraction.provinceResolution?.resolvedId) {
          setSelectedProvinceId(extraction.provinceResolution.resolvedId);
        }
      } catch (error) {
        setProvinceError('Error al cargar provincias');
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch municipalities when province is selected
  useEffect(() => {
    if (!selectedProvinceId) {
      setMunicipalities([]);
      setSelectedMunicipalityId(null);
      return;
    }

    const fetchMunicipalities = async () => {
      setLoadingMunicipalities(true);
      setMunicipalityError(null);
      try {
        const response = await fetch(`/api/geo/municipios?provinciaId=${selectedProvinceId}`);
        if (!response.ok) throw new Error('Failed to fetch municipalities');
        const data = await response.json();
        setMunicipalities(data);
        
        // If there's a municipality resolution, select it
        if (extraction.municipalityResolution?.resolvedId) {
          setSelectedMunicipalityId(extraction.municipalityResolution.resolvedId);
        }
      } catch (error) {
        setMunicipalityError('Error al cargar municipios');
        console.error('Error fetching municipalities:', error);
      } finally {
        setLoadingMunicipalities(false);
      }
    };
    fetchMunicipalities();
  }, [selectedProvinceId]);

  // Auto-emit suggestion when resolution is ready and action is AutoApply
  useEffect(() => {
    if (!onAutoSelectField) return;
    
    // Check province resolution
    if (extraction.provinceResolution?.suggestedAction === ResolutionAction.AutoApply && extraction.provinceResolution?.resolvedId) {
      onAutoSelectField('provincia', extraction.provinceResolution.resolvedId, ResolutionAction.AutoApply);
    }
    
    // Check municipality resolution
    if (extraction.municipalityResolution?.suggestedAction === ResolutionAction.AutoApply && extraction.municipalityResolution?.resolvedId) {
      onAutoSelectField('municipio', extraction.municipalityResolution.resolvedId, ResolutionAction.AutoApply);
    }
  }, [extraction.provinceResolution, extraction.municipalityResolution, onAutoSelectField]);
   
  if (isProcessing) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 animate-pulse" data-testid="estado-juridico-extraction-card">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Procesando IA OCR...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3" data-testid="estado-juridico-extraction-card">
        <AlertTriangle className="w-5 h-5 text-error mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-error uppercase">Error de Extracción OCR</h4>
          <p className="text-xs text-error/80 mt-1">No se pudieron extraer los datos del documento con la claridad requerida. Verifique la calidad de la imagen.</p>
        </div>
      </div>
    );
  }

  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setEditValue(currentValue);
  };

  const handleSave = async (fieldName: string) => {
    if (!onEditField) return;
    try {
      setIsSaving(true);
      await onEditField(fieldName, editValue);
      setEditingField(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProvinceId(value || null);
    setSelectedMunicipalityId(null); // Reset municipality when province changes
  };

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMunicipalityId(e.target.value || null);
  };

  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false, testId?: string) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const isMissing = safeField.status === FieldStatus.Missing;
    const isLowConfidence = safeField.status === FieldStatus.LowConfidence || safeField.confidence < 0.8;
    const isEditing = editingField === fieldKey;
    const displayValue = safeField.normalizedValue || safeField.rawValue || '';
    
    // Get resolution for this field
    const resolution = fieldKey === 'provincia' ? extraction.provinceResolution : 
                       fieldKey === 'municipio' ? extraction.municipalityResolution : null;

    // Render dropdown for provincia
    if (fieldKey === 'provincia') {
      return (
        <div className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group" data-testid={testId}>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1">
            {label}
          </span>
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedProvinceId || ''}
              onChange={handleProvinceChange}
              disabled={loadingProvinces || isSaving}
              className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent"
              data-testid="provincia-select"
            >
              <option value="">-- Seleccionar Provincia --</option>
              {provinces.map(prov => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              {!isMissing && (
                <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
              )}
              {resolution && <ResolutionBadge resolution={resolution} />}
              {provinceError && <span className="text-xs text-error">{provinceError}</span>}
              {loadingProvinces && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            </div>
          </div>
        </div>
      );
    }
    
    // Render dropdown for municipio
    if (fieldKey === 'municipio') {
      return (
        <div className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1">
            {label}
          </span>
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedMunicipalityId || ''}
              onChange={handleMunicipalityChange}
              disabled={loadingMunicipalities || !selectedProvinceId || isSaving}
              className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent"
              data-testid="municipio-select"
            >
              <option value="">-- Seleccionar Municipio --</option>
              {municipalities.map(mun => (
                <option key={mun.id} value={mun.id}>{mun.nombre}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              {!isMissing && (
                <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
              )}
              {resolution && <ResolutionBadge resolution={resolution} />}
              {municipalityError && <span className="text-xs text-error">{municipalityError}</span>}
              {loadingMunicipalities && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group" data-testid={testId}>
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1">
          {label}
        </span>
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1 w-full">
               <input 
                 type="text" 
                 className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent" 
                 value={editValue} 
                 onChange={(e) => setEditValue(e.target.value)}
                 autoFocus
                 disabled={isSaving}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(fieldKey);
                    if (e.key === 'Escape') handleCancel();
                 }}
               />
               <button onClick={() => handleSave(fieldKey)} disabled={isSaving} className="text-success hover:bg-success/10 p-1 rounded transition-colors"><Check className="w-3 h-3" /></button>
               <button onClick={handleCancel} disabled={isSaving} className="text-error hover:bg-error/10 p-1 rounded transition-colors"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <>
              <span className={`text-sm font-bold ${isMissing ? 'text-error/60 italic' : isPrimary ? 'text-primary font-mono' : 'text-text-primary'}`}>
                {isMissing ? 'NO DETECTADO' : displayValue}
              </span>
              <div className="flex items-center gap-2">
                 {!isMissing && (
                   <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
                 )}
                 {resolution && <ResolutionBadge resolution={resolution} />}
                 {onEditField && (
                   <button onClick={() => handleEditClick(fieldKey, displayValue)} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary transition-opacity p-0.5" title="Editar campo">
                     <Pencil className="w-3 h-3" />
                   </button>
                 )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const filteredWarnings = (extraction.warnings || []).filter(w => {
    if (w.includes("VieneDe") || w.includes("Viene de")) {
      const vieneDe = extraction.vieneDe;
      const hasValue = vieneDe && (vieneDe.rawValue || vieneDe.normalizedValue);
      const isNotMissing = vieneDe && vieneDe.status !== FieldStatus.Missing;
      if (hasValue || isNotMissing) {
        return false; // Hide warning if field has a value now
      }
    }
    return true;
  });

  return (
    <div className="w-full mt-2 p-4 sm:p-5 rounded-xl border border-border/50 bg-surface-container-low shadow-sm" data-testid="estado-juridico-extraction-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-secondary tracking-tight">Extracción de Estado Jurídico</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{extraction.processorName} {extraction.processorVersion}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {renderField("Matrícula", "matricula", extraction.matricula, true, "field-matricula")}
        {renderField("Desig. Catastral", "designacionCatastral", extraction.designacionCatastral, true, "field-designacionCatastral")}
        {renderField("Viene De", "vieneDe", extraction.vieneDe, false, "field-vieneDe")}
        {renderField("Fecha de Emisión", "fechaHoraInscripcion", extraction.fechaHoraInscripcion, false, "field-fechaEmision")}
        {renderField("Oficina", "oficina", extraction.oficina, false, "field-oficina")}
        {renderField("Provincia", "provincia", extraction.provincia, false, "field-provincia")}
        {renderField("Municipio", "municipio", extraction.municipio, false, "field-municipio")}
        {renderField("Superficie M²", "superficieMetrosCuadrados", extraction.superficieMetrosCuadrados, true, "field-superficie")}
      </div>
      
      {filteredWarnings.length > 0 && (
         <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2 text-warning text-xs">
           <Info className="w-4 h-4 shrink-0 mt-0.5" />
           <ul className="list-disc list-inside space-y-1">
             {filteredWarnings.map((w, i) => <li key={i}>{w}</li>)}
           </ul>
         </div>
      )}
    </div>
  );
};