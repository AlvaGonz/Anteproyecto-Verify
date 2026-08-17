import React, { useState } from "react";
import { CertificacionIPIExtraction, ExtractionStatus, FieldStatus, ExtractedField } from "../types";
import { DocumentExtractionPanel } from "./reusable/DocumentExtractionPanel";
import { ExtractionFieldCard } from "./reusable/ExtractionFieldCard";
import { useVerifyDocument } from "../../gobernanza/api/useGobernanza";
import { VerificationFeedbackCard } from "../../gobernanza/components/VerificationFeedbackCard";
import { getValidationStatus } from "../../gobernanza/utils/mapper";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useDiscrepancyCheck, Discrepancy } from "../../validations/hooks/useDiscrepancyCheck";
import { DiscrepancyAlertDialog } from "../../validations/components/DiscrepancyAlertDialog";

const isIpiNoPagado = (response: any) => {
  if (!response?.matchedData) return false;
  const estatus = response.matchedData.Estatus || response.matchedData.estatus || "";
  return estatus.toUpperCase().includes("NO PAGADO") || estatus === "PAGO_PENDIENTE";
};

interface CertificacionIPIExtractionCardProps {
  extraction: CertificacionIPIExtraction;
  proyectoId?: string;
  documentoId?: string;
  onEditField?: (fieldName: string, value: string) => Promise<void>;
}

export const CertificacionIPIExtractionCard: React.FC<CertificacionIPIExtractionCardProps> = ({ 
  extraction, 
  proyectoId,
  documentoId,
  onEditField 
}) => {
  const isProcessing = extraction.extractionStatus === ExtractionStatus.Queued || extraction.extractionStatus === ExtractionStatus.Processing;
  const isError = extraction.extractionStatus === ExtractionStatus.Failed;

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isDiscrepancyDialogOpen, setIsDiscrepancyDialogOpen] = React.useState(false);
  const [discrepancies, setDiscrepancies] = React.useState<Discrepancy[]>([]);

  const { checkDiscrepancies } = useDiscrepancyCheck(proyectoId);
  const { mutate: verifyDocument, data: verificationResponse, isPending: isVerifying, error: verificationError } = useVerifyDocument();

  const getStatus = (fieldVal: string | undefined | null, fieldKey: string) => 
    getValidationStatus(fieldVal, verificationResponse?.matchedData, fieldKey, verificationResponse?.failedFields);

  const getPayload = () => ({
    rnc: "", // Depending on where it's stored, maybe empty for IPI
    noCertificacion: extraction.numeroCertificacion?.normalizedValue || extraction.numeroCertificacion?.rawValue || "",
    numeroInmueble: extraction.numeroInmueble?.normalizedValue || extraction.numeroInmueble?.rawValue || "",
    noInmueble: extraction.numeroInmueble?.normalizedValue || extraction.numeroInmueble?.rawValue || "",
    parcelaNo: extraction.parcelaNumero?.normalizedValue || extraction.parcelaNumero?.rawValue || ""
  });

  const handleVerifyGobernanza = () => {
    const payload = getPayload();
    const foundDiscrepancies = checkDiscrepancies('certificacion-ipi', payload);

    if (foundDiscrepancies.length > 0) {
      setDiscrepancies(foundDiscrepancies);
      setIsDiscrepancyDialogOpen(true);
      return;
    }

    proceedWithValidation();
  };

  const proceedWithValidation = () => {
    setIsDiscrepancyDialogOpen(false);
    verifyDocument({
      documentType: 'pagoipi',
      proyectoId,
      documentoId,
      payload: {
        rnc: "", 
        noCertificacion: extraction.numeroCertificacion?.normalizedValue || extraction.numeroCertificacion?.rawValue || "",
        noInmueble: extraction.numeroInmueble?.normalizedValue || extraction.numeroInmueble?.rawValue || "",
        parcelaNo: extraction.parcelaNumero?.normalizedValue || extraction.parcelaNumero?.rawValue || ""
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

  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false, testId?: string, placeholder?: string) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const isEditing = editingField === fieldKey;
    const displayValue = safeField.normalizedValue || safeField.rawValue || '';
    
    const validation = getStatus(displayValue, fieldKey);

    return (
      <ExtractionFieldCard
        key={fieldKey}
        label={label}
        fieldKey={fieldKey}
        placeholder={placeholder}
        field={safeField}
        isPrimary={isPrimary}
        displayValue={displayValue}
        isEditing={isEditing}
        editValue={editValue}
        isSaving={isSaving}
        onEditClick={() => handleEditClick(fieldKey, displayValue)}
        onEditValueChange={setEditValue}
        onSave={() => handleSave(fieldKey)}
        onCancel={handleCancel}
        onEditAllowed={!!onEditField}
        validationStatus={validation.status}
        validationMessage={validation.message}
        testId={testId}
      />
    );
  };

  const generateUserFriendlyWarnings = () => {
    const warnings: string[] = [];
    
    // Check specific missing fields
    if (extraction.numeroCertificacion?.status === FieldStatus.Missing) {
      warnings.push("Falta ingresar el No. de Certificación. Por favor, agregue este valor manualmente.");
    }
    if (extraction.numeroInmueble?.status === FieldStatus.Missing) {
      warnings.push("Falta ingresar el No. de Inmueble. Por favor, agregue este valor manualmente.");
    }
    if (extraction.parcelaNumero?.status === FieldStatus.Missing) {
      warnings.push("Falta ingresar la Parcela No. Por favor, agregue este valor manualmente.");
    }

    // Combine with backend warnings, filtering out technical messages
    if (extraction.warnings && Array.isArray(extraction.warnings)) {
      extraction.warnings.forEach(w => {
        // Filter out the technical message that the user complained about
        if (!w.includes("Required field") && 
            !w.includes("is missing") && 
            !w.includes("Falta el No. de Inmueble") && 
            !w.includes("Falta el número de parcela") &&
            !w.includes("No se pudo detectar el No. de Certificación")) {
          warnings.push(w);
        }
      });
    }

    return warnings;
  };

  return (
    <DocumentExtractionPanel
      title="Extracción de Certificación IPI"
      processorName={extraction.processorName}
      processorVersion={extraction.processorVersion}
      isProcessing={isProcessing}
      isError={isError}
      testId="certificacion-ipi-extraction-card"
      warnings={generateUserFriendlyWarnings()}
      gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {renderField("No. de Certificación", "numeroCertificacion", extraction.numeroCertificacion, true, "field-numeroCertificacion", "Ej: C0121952878225")}
      {renderField("No. Inmueble", "numeroInmueble", extraction.numeroInmueble, true, "field-numeroInmueble", "Ej: 136400513193")}
      {renderField("Parcela No.", "parcelaNumero", extraction.parcelaNumero, true, "field-parcelaNumero", "Ej: 309466754512:4-A")}
      
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]/10 col-span-full">
        {isIpiNoPagado(verificationResponse) && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Estado del IPI no pagado</span>
          </div>
        )}
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

      <DiscrepancyAlertDialog
        isOpen={isDiscrepancyDialogOpen}
        discrepancies={discrepancies}
        onCancel={() => setIsDiscrepancyDialogOpen(false)}
        onProceed={proceedWithValidation}
      />
    </DocumentExtractionPanel>
  );
};