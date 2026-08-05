import React, { useEffect, useState } from "react";
import {
  PlanoMensuraCatastralRdExtractionV1,
  ExtractionStatus,
  FieldStatus,
  ExtractedField
} from "../types";
import { ResolutionAction } from "../schemas/planoMensura.schema";
import { fetchMunicipalities } from "../api/geo";
import { Loader2 } from "lucide-react";
import { DocumentExtractionPanel } from "./reusable/DocumentExtractionPanel";
import { ExtractionFieldCard } from "./reusable/ExtractionFieldCard";
import { useVerifyDocument } from "../../gobernanza/api/useGobernanza";
import { VerificationFeedbackCard } from "../../gobernanza/components/VerificationFeedbackCard";
import { ShieldCheck } from "lucide-react";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

const matchesCatalogId = (value: string | null | undefined, options: Array<{ id: string; nombre: string }>): string | null => {
  if (!value) return null;
  // ponytail: 1-char OCR noise tolerance (e.g. "CONCEPCION DE LA VEGS" -> "Concepcion de La Vega").
  // Upgrade path: server-side fuzzy via GeoToleranceMatcher when an HTTP endpoint exists.
  if (UUID_REGEX.test(value)) {
    return options.some(o => o.id === value) ? value : null;
  }
  const target = norm(value);
  const match = options.find(o => {
    const n = norm(o.nombre);
    if (n === target) return true;
    if (Math.abs(n.length - target.length) <= 1) {
      let diffs = 0;
      const len = Math.min(n.length, target.length);
      for (let i = 0; i < len; i++) {
        if (n[i] !== target[i]) {
          diffs++;
          if (diffs > 1) return false;
        }
      }
      return diffs <= 1;
    }
    return false;
  });
  return match?.id ?? null;
};

interface PlanoMensuraExtractionCardProps {
  extraction: PlanoMensuraCatastralRdExtractionV1;
  proyectoId?: string;
  documentoId?: string;
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

export const PlanoMensuraExtractionCard: React.FC<PlanoMensuraExtractionCardProps> = ({ 
  extraction, 
  proyectoId,
  documentoId,
  onEditField, 
  onAutoSelectField 
}) => {
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
        const data: Province[] = await response.json();
        setProvinces(data);

        // Prefer persisted normalizedValue (user-selected UUID or explicitly cleared "") over OCR-derived provinceResolution
        const resolvedFromOcr = extraction.provinceResolution?.resolvedId ?? null;
        const resolvedFromRaw = matchesCatalogId(extraction.provincia?.rawValue, data);
        
        let initialProvinceId = resolvedFromOcr ?? resolvedFromRaw;
        if (extraction.provincia?.normalizedValue) {
          const matched = matchesCatalogId(extraction.provincia.normalizedValue, data);
          if (matched) initialProvinceId = matched;
        }
        
        setSelectedProvinceId(initialProvinceId);

        // Auto-apply if we found a local match from OCR raw text and it hasn't been saved yet
        if (!resolvedFromOcr && resolvedFromRaw && !extraction.provincia?.normalizedValue && onAutoSelectField) {
          onAutoSelectField('provincia', resolvedFromRaw, ResolutionAction.AutoApply);
        }
      } catch (error) {
        setProvinceError('Error al cargar provincias');
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [extraction.provinceResolution?.resolvedId, extraction.provincia?.normalizedValue, extraction.provincia?.rawValue]);

  // Fetch municipalities: scoped to selectedProvinceId when known, otherwise
  // load the whole catalog if municipio data exists (orphan municipio case:
  // OCR picked up "MUNICIPIO: ..." but could not find the PROVINCIA label).
  useEffect(() => {
    const municipioData =
      extraction.municipio?.rawValue || extraction.municipalityResolution?.resolvedId || extraction.municipio?.normalizedValue;

    if (selectedProvinceId) {
      const loadMunicipalities = async () => {
        setLoadingMunicipalities(true);
        setMunicipalityError(null);
        try {
          const data: Municipality[] = await fetchMunicipalities(selectedProvinceId);
          setMunicipalities(data);

          const resolvedFromOcr = extraction.municipalityResolution?.resolvedId ?? null;
          const resolvedFromRaw = matchesCatalogId(extraction.municipio?.rawValue, data);
          
          let initialMunicipalityId = resolvedFromOcr ?? resolvedFromRaw;
          if (extraction.municipio?.normalizedValue) {
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
      loadMunicipalities();
      return;
    }

    if (municipioData) {
      const loadAllMunicipalities = async () => {
        setLoadingMunicipalities(true);
        setMunicipalityError(null);
        try {
          const data: Municipality[] = await fetchMunicipalities();
          setMunicipalities(data);

          const resolvedFromOcr = extraction.municipalityResolution?.resolvedId ?? null;
          const resolvedFromRaw = matchesCatalogId(extraction.municipio?.rawValue, data);
          
          let initialMunicipalityId = resolvedFromOcr ?? resolvedFromRaw;
          if (extraction.municipio?.normalizedValue) {
            const matched = matchesCatalogId(extraction.municipio.normalizedValue, data);
            if (matched) initialMunicipalityId = matched;
          }
          
          setSelectedMunicipalityId(initialMunicipalityId);
        } catch (error) {
          setMunicipalityError('Error al cargar municipios');
          console.error('Error fetching municipalities:', error);
        } finally {
          setLoadingMunicipalities(false);
        }
      };
      loadAllMunicipalities();
      return;
    }

    setMunicipalities([]);
    setSelectedMunicipalityId(null);
  }, [selectedProvinceId, extraction.municipalityResolution?.resolvedId, extraction.municipio?.normalizedValue, extraction.municipio?.rawValue]);

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

  const { mutate: verifyDocument, data: verificationResponse, isPending: isVerifying, error: verificationError } = useVerifyDocument();

  const handleVerifyGobernanza = () => {
    verifyDocument({
      documentType: 'catastro',
      proyectoId,
      documentoId,
      payload: {
        numeroPermiso: '', // Depending on where it's stored
        numeroExpediente: '', 
        rnc: '', 
        departamento: extraction.departamento?.normalizedValue || extraction.departamento?.rawValue,
        operacion: extraction.operacion?.normalizedValue || extraction.operacion?.rawValue,
        seccion: extraction.seccion?.normalizedValue || extraction.seccion?.rawValue,
        lugar: extraction.lugar?.normalizedValue || extraction.lugar?.rawValue
      }
    });
  };

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
    if (onEditField) {
      void onEditField('provincia', value || '');
    }
  };

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMunicipalityId(value || null);
    if (onEditField) {
      void onEditField('municipio', value || '');
    }
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
      const disabled = isSaving || loading || (!isProvincia && options.length === 0);
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
        isNumeric={fieldKey === 'superficieARegistrarParcelaM2'}
        step={fieldKey === 'superficieARegistrarParcelaM2' ? "0.01" : undefined}
        onEditClick={() => handleEditClick(fieldKey, displayValue)}
        onEditValueChange={setEditValue}
        onSave={() => handleSave(fieldKey)}
        onCancel={handleCancel}
        onEditAllowed={!!onEditField}
        testId={testId}
      />
    );
  };

  return (
    <DocumentExtractionPanel
      title="Extracción de Plano de Mensura"
      processorName={extraction.processorName}
      processorVersion={extraction.processorVersion}
      isProcessing={isProcessing}
      isError={isError}
      testId="plano-mensura-extraction-card"
      warnings={extraction.warnings || []}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {renderField("Departamento", "departamento", extraction.departamento, false, "field-departamento")}
      {renderField("Operación", "operacion", extraction.operacion, false, "field-operacion")}
      {renderField("Desig. Catastral Posicional", "designacionCatastralPosicional", extraction.designacionCatastralPosicional, true, "field-dcp")}
      {renderField("Desig. Catastral Origen", "designacionCatastralOrigen", extraction.designacionCatastralOrigen, false, "field-dco")}
      {renderField("Provincia", "provincia", extraction.provincia, false, "field-provincia")}
      {renderField("Municipio", "municipio", extraction.municipio, false, "field-municipio")}
      {renderField("Sección", "seccion", extraction.seccion, false, "field-seccion")}
      {renderField("Lugar", "lugar", extraction.lugar, false, "field-lugar")}
      {renderField("Superficie A. Regist.", "superficieARegistrarParcelaM2", extraction.superficieARegistrarParcelaM2, true, "field-superficie")}

      <div className="mt-6 pt-6 border-t border-[var(--color-border)]/10 col-span-full">
        <div className="flex justify-end">
          <button
            onClick={handleVerifyGobernanza}
            disabled={isVerifying}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold tracking-wide shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-5 h-5" />
            {isVerifying ? "Verificando..." : "Validar contra Estado/Gobernanza"}
          </button>
        </div>
        
        <VerificationFeedbackCard 
          response={verificationResponse || null} 
          isLoading={isVerifying} 
          error={verificationError}
        />
      </div>
    </DocumentExtractionPanel>
  );
};