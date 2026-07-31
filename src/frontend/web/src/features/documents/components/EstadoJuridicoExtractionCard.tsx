import React, { useEffect, useState } from "react";
import { 
  EstadoJuridicoRdExtractionV1, 
  ExtractionStatus, 
  FieldStatus, 
  ExtractedField
} from "../types";
import { ResolutionAction } from "../schemas/estadoJuridico.schema";
import { Loader2 } from "lucide-react";
import { DocumentExtractionPanel } from "./reusable/DocumentExtractionPanel";
import { ExtractionFieldCard } from "./reusable/ExtractionFieldCard";

interface EstadoJuridicoExtractionCardProps {
  extraction: EstadoJuridicoRdExtractionV1;
  onEditField?: (fieldName: string, value: string) => Promise<void>;
  onAutoSelectField?: (fieldName: string, resolvedId: string, action: ResolutionAction) => void;
}

// Helper to find a catalog item by name (useful when OCR provides a name but we need the UUID)
const matchesCatalogId = (value: string | undefined, catalog: { id: string; nombre: string }[]) => {
  if (!value) return null;
  const match = catalog.find(item => item.id === value || item.nombre.toLowerCase() === value.toLowerCase());
  return match ? match.id : null;
};

interface Province {
  id: string;
  nombre: string;
}

interface Municipality {
  id: string;
  nombre: string;
}

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
  }, [extraction.provinceResolution?.resolvedId]);

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
        
        const resolvedFromOcr = extraction.municipalityResolution?.resolvedId ?? null;
        const resolvedFromRaw = matchesCatalogId(extraction.municipio?.rawValue, data);
        
        let initialMunicipalityId = resolvedFromOcr ?? resolvedFromRaw;
        if (extraction.municipio?.normalizedValue === '') {
          initialMunicipalityId = null;
        } else if (extraction.municipio?.normalizedValue) {
          const matched = matchesCatalogId(extraction.municipio.normalizedValue, data);
          if (matched) initialMunicipalityId = matched;
        }
        
        setSelectedMunicipalityId(initialMunicipalityId);

        // Auto-apply if we found a local match from OCR raw text and it hasn't been saved yet
        if (!resolvedFromOcr && resolvedFromRaw && !extraction.municipio?.normalizedValue && onAutoSelectField) {
          onAutoSelectField('municipio', resolvedFromRaw, ResolutionAction.AutoApply);
        }
      } catch (error) {
        setMunicipalityError('Error al cargar municipios');
        console.error('Error fetching municipalities:', error);
      } finally {
        setLoadingMunicipalities(false);
      }
    };
    fetchMunicipalities();
  }, [selectedProvinceId, extraction.municipalityResolution?.resolvedId]);

  // Auto-emit suggestion when resolution is ready and action is AutoApply
  useEffect(() => {
    if (!onAutoSelectField) return;
    
    // Check province resolution
    if (
      extraction.provinceResolution?.suggestedAction === ResolutionAction.AutoApply && 
      extraction.provinceResolution?.resolvedId &&
      extraction.provincia?.normalizedValue !== extraction.provinceResolution.resolvedId
    ) {
      onAutoSelectField('provincia', extraction.provinceResolution.resolvedId, ResolutionAction.AutoApply);
      return; // Wait for refetch to avoid backend race condition
    }
    
    // Check municipality resolution
    if (
      extraction.municipalityResolution?.suggestedAction === ResolutionAction.AutoApply && 
      extraction.municipalityResolution?.resolvedId &&
      extraction.municipio?.normalizedValue !== extraction.municipalityResolution.resolvedId
    ) {
      onAutoSelectField('municipio', extraction.municipalityResolution.resolvedId, ResolutionAction.AutoApply);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraction.provinceResolution, extraction.municipalityResolution, extraction.provincia, extraction.municipio]);
   
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
    const isEditing = editingField === fieldKey;
    const displayValue = safeField.normalizedValue || safeField.rawValue || '';
    
    // Get resolution for this field
    const resolution = fieldKey === 'provincia' ? extraction.provinceResolution : 
                       fieldKey === 'municipio' ? extraction.municipalityResolution : null;

    // Render dropdown for provincia and municipio
    if (fieldKey === 'provincia' || fieldKey === 'municipio') {
      const isProvincia = fieldKey === 'provincia';
      const selectedId = isProvincia ? selectedProvinceId : selectedMunicipalityId;
      const loading = isProvincia ? loadingProvinces : loadingMunicipalities;
      const errorMsg = isProvincia ? provinceError : municipalityError;
      const options = isProvincia ? provinces : municipalities;
      const onChange = isProvincia ? handleProvinceChange : handleMunicipalityChange;
      const disabled = isSaving || loading || (!isProvincia && !selectedProvinceId);
      const defaultOptionText = isProvincia ? "-- Seleccionar Provincia --" : "-- Seleccionar Municipio --";
      
      return (
        <ExtractionFieldCard
          key={fieldKey}
          label={label}
          fieldKey={fieldKey}
          field={safeField}
          resolution={resolution}
          isCustomContent={true}
          testId={testId}
        >
          <div className="flex-1 flex items-center min-w-0 pr-2">
            <select
              value={selectedId || ''}
              onChange={onChange}
              disabled={disabled}
              className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent min-w-0"
              data-testid={`${fieldKey}-select`}
            >
              <option value="">{defaultOptionText}</option>
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nombre}</option>
              ))}
            </select>
            {errorMsg && <span className="text-[10px] text-error ml-2 shrink-0">{errorMsg}</span>}
            {loading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin ml-2 shrink-0" />}
          </div>
        </ExtractionFieldCard>
      );
    }

    return (
      <ExtractionFieldCard
        key={fieldKey}
        label={label}
        fieldKey={fieldKey}
        field={safeField}
        isPrimary={isPrimary}
        displayValue={displayValue}
        resolution={resolution}
        isEditing={isEditing}
        editValue={editValue}
        isSaving={isSaving}
        isNumeric={fieldKey === 'superficieMetrosCuadrados'}
        step={fieldKey === 'superficieMetrosCuadrados' ? "0.01" : undefined}
        onEditClick={() => handleEditClick(fieldKey, displayValue)}
        onEditValueChange={setEditValue}
        onSave={() => handleSave(fieldKey)}
        onCancel={handleCancel}
        onEditAllowed={!!onEditField}
        testId={testId}
      />
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
    <DocumentExtractionPanel
      title="Extracción de Estado Jurídico"
      processorName={extraction.processorName}
      processorVersion={extraction.processorVersion}
      isProcessing={isProcessing}
      isError={isError}
      testId="estado-juridico-extraction-card"
      warnings={filteredWarnings}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {renderField("Matrícula", "matricula", extraction.matricula, true, "field-matricula")}
      {renderField("Desig. Catastral", "designacionCatastral", extraction.designacionCatastral, true, "field-designacionCatastral")}
      {renderField("Viene De", "vieneDe", extraction.vieneDe, false, "field-vieneDe")}
      {renderField("Fecha de Emisión", "fechaHoraInscripcion", extraction.fechaHoraInscripcion, false, "field-fechaEmision")}
      {renderField("Oficina", "oficina", extraction.oficina, false, "field-oficina")}
      {renderField("Provincia", "provincia", extraction.provincia, false, "field-provincia")}
      {renderField("Municipio", "municipio", extraction.municipio, false, "field-municipio")}
      {renderField("Superficie M²", "superficieMetrosCuadrados", extraction.superficieMetrosCuadrados, true, "field-superficie")}
    </DocumentExtractionPanel>
  );
};