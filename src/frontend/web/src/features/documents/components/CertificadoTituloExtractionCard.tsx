import React, { useEffect, useState } from "react";
import { 
  CertificadoTituloRdExtractionV1, 
  ExtractionStatus, 
  FieldStatus, 
  ExtractedField
} from "../types";
import { ResolutionAction } from "../schemas/certificadoTitulo.schema";
import { Loader2 } from "lucide-react";
import { formatMatricula, formatSuperficieM2 } from "../utils/numericFormatter";
import { DocumentExtractionPanel } from "./reusable/DocumentExtractionPanel";
import { ExtractionFieldCard } from "./reusable/ExtractionFieldCard";

type NumericKind = "matricula" | "superficieM2";

const NUMERIC_FIELDS: Record<string, NumericKind> = {
  matricula: "matricula",
  superficieM2: "superficieM2",
};

const formatNumeric = (fieldKey: string, raw: string): string => {
  switch (NUMERIC_FIELDS[fieldKey]) {
    case "matricula":
      return formatMatricula(raw);
    case "superficieM2":
      return formatSuperficieM2(raw);
    default:
      return raw;
  }
};

interface CertificadoTituloExtractionCardProps {
  extraction: CertificadoTituloRdExtractionV1;
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

export const CertificadoTituloExtractionCard: React.FC<CertificadoTituloExtractionCardProps> = ({ extraction, onEditField, onAutoSelectField }) => {
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
  }, [selectedProvinceId, extraction.municipalityResolution?.resolvedId]);

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
  
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

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

  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const rawValue = safeField.normalizedValue || safeField.rawValue || '';
    const displayValue = NUMERIC_FIELDS[fieldKey] ? formatNumeric(fieldKey, rawValue) : rawValue;
    const isEditing = editingField === fieldKey;
    const isNumeric = !!NUMERIC_FIELDS[fieldKey];
    
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
        isNumeric={isNumeric}
        step={fieldKey === "superficieM2" ? "0.01" : undefined}
        onEditClick={() => handleEditClick(fieldKey, rawValue)}
        onEditValueChange={setEditValue}
        onSave={() => handleSave(fieldKey)}
        onCancel={handleCancel}
        onEditAllowed={!!onEditField}
      />
    );
  };

  const filteredWarnings = (extraction.warnings || []).filter(w => {
    // Hide VieneDe missing warnings if the field now has a value
    if (w.includes("VieneDe") || w.includes("Viene de")) {
      const vieneDe = extraction.vieneDe;
      const hasValue = vieneDe && (vieneDe.rawValue || vieneDe.normalizedValue);
      const isNotMissing = vieneDe && vieneDe.status !== FieldStatus.Missing;
      if (hasValue || isNotMissing) {
        return false;
      }
    }
    return true;
  });

  return (
    <DocumentExtractionPanel
      title="Extracción de Certificado de Título"
      processorName={extraction.processorName}
      processorVersion={extraction.processorVersion}
      isProcessing={isProcessing}
      isError={isError}
      testId="certificado-titulo-extraction-card"
      warnings={filteredWarnings}
    >
      {renderField("Designación Catastral", "designacionCatastral", extraction.designacionCatastral, true)}
      {renderField("Oficina", "oficina", extraction.oficina)}
      {renderField("Matrícula", "matricula", extraction.matricula)}
      {renderField("Fecha de Inscripción", "fechaYHoraInscripcion", extraction.fechaYHoraInscripcion)}
      {renderField("Viene De", "vieneDe", extraction.vieneDe)}
      {renderField("Municipio", "municipio", extraction.municipio)}
      {renderField("Provincia", "provincia", extraction.provincia)}
      {renderField("Superficie M2", "superficieM2", extraction.superficieM2)}
    </DocumentExtractionPanel>
  );
};

