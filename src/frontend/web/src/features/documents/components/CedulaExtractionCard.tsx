import React from "react";
import { CedulaRdExtractionV1, ExtractionStatus, ExtractedField } from "../types";
import { Fingerprint } from "lucide-react";
import { DocumentExtractionPanel } from "./reusable/DocumentExtractionPanel";
import { ExtractionFieldCard } from "./reusable/ExtractionFieldCard";
import { useVerifyDocument } from "../../gobernanza/api/useGobernanza";
import { VerificationFeedbackCard } from "../../gobernanza/components/VerificationFeedbackCard";
import { getValidationStatus } from "../../gobernanza/utils/mapper";
import { ShieldCheck } from "lucide-react";

interface CedulaExtractionCardProps {
  extraction: CedulaRdExtractionV1;
  proyectoId?: string;
  documentoId?: string;
  onEditField?: (fieldName: string, value: string) => Promise<void>;
}

export const CedulaExtractionCard: React.FC<CedulaExtractionCardProps> = ({ 
  extraction, 
  proyectoId,
  documentoId,
  onEditField 
}) => {
  const isProcessing = extraction.extractionStatus === ExtractionStatus.Queued || extraction.extractionStatus === ExtractionStatus.Processing;
  const isError = extraction.extractionStatus === ExtractionStatus.Failed;
  
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const { mutate: verifyDocument, data: verificationResponse, isPending: isVerifying, error: verificationError } = useVerifyDocument();
  
  const getStatus = (fieldVal: string | undefined | null) => 
    getValidationStatus(fieldVal, verificationResponse?.matchedData);

  const handleVerifyGobernanza = () => {
    verifyDocument({
      documentType: 'jce',
      proyectoId,
      documentoId,
      payload: {
        cedula: extraction.cedulaNumber?.normalizedValue || extraction.cedulaNumber?.rawValue,
        nombres: extraction.firstNames?.normalizedValue || extraction.firstNames?.rawValue,
        apellidos: extraction.lastNames?.normalizedValue || extraction.lastNames?.rawValue,
        fechaNacimiento: extraction.birthDate?.normalizedValue || extraction.birthDate?.rawValue,
        fechaExpiracion: extraction.expiryDate?.normalizedValue || extraction.expiryDate?.rawValue
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

  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isCedula = false) => {
    if (!field) return null;
    const isEditing = editingField === fieldKey;
    const displayValue = field.normalizedValue || field.rawValue || '';
    
    const validation = getStatus(displayValue);

    return (
      <ExtractionFieldCard
        key={fieldKey}
        label={label}
        fieldKey={fieldKey}
        field={field}
        isCedula={isCedula}
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
      />
    );
  };

  return (
    <DocumentExtractionPanel
      title="Extracción de Identidad"
      processorName={extraction.processorName}
      processorVersion={extraction.processorVersion}
      isProcessing={isProcessing}
      isError={isError}
      icon={<Fingerprint className="w-4 h-4 text-primary" />}
      warnings={extraction.warnings}
      testId="cedula-extraction-card"
      footer={
        <div className="mt-6 pt-6 border-t border-[var(--color-border)]/10">
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
      }
    >
      {renderField("Cédula / ID", "cedulaNumber", extraction.cedulaNumber, true)}
      {renderField("Nombres", "firstNames", extraction.firstNames)}
      {renderField("Apellidos", "lastNames", extraction.lastNames)}
      {renderField("Fecha Nacimiento", "birthDate", extraction.birthDate)}
      {renderField("Fecha Expiración", "expiryDate", extraction.expiryDate)}
    </DocumentExtractionPanel>
  );
};

