import { useProject } from "../../projects/api/useProjects";
import { VALIDATION_RULES, DocumentType } from "../../../lib/validation-rules";
import { useRules } from "../../rules/api/useRules";

export interface Discrepancy {
  field: string;
  projectValue: string;
  documentValue: string;
  message?: string;
}

export const useDiscrepancyCheck = (projectId?: string) => {
  const { data: project } = useProject(projectId || "");
  const { data: rulesData } = useRules();

  const checkDiscrepancies = (
    documentType: DocumentType,
    documentData: Record<string, string | number | undefined>
  ): Discrepancy[] => {
    if (!project) return [];

    const rules = VALIDATION_RULES[documentType];
    if (!rules) return [];

    const rule8 = rulesData?.find((r: any) => r.codigo === 'RULE-008-SUPERFICIE' || r.nombre?.includes('Tolerancia Superficie'));
    const isRule8Active = rule8 ? rule8.activa : true;
    const rule8Tolerance = rule8?.valorUmbral ?? rules.tolerance;

    const discrepancies: Discrepancy[] = [];

    // Map project fields if they differ in name
    const getProjectValue = (field: string) => {
      if (field === 'provincia') return project.ubicacionTexto;
      return project[field as keyof typeof project];
    };

    for (const field of rules.fieldsToValidate) {
      if (documentType === 'plano-mensura' && field === 'superficieM2' && !isRule8Active) {
        continue;
      }

      const projValue = getProjectValue(field);
      const docValue = documentData[field];

      const isProjEmpty = projValue === undefined || projValue === null || projValue === "";
      const isDocEmpty = docValue === undefined || docValue === null || docValue === "";

      if (isProjEmpty && isDocEmpty) {
        continue;
      }

      if (rules.matchStrategy === 'exact') {
        const projStr = String(projValue).trim();
        const docStr = String(docValue).trim();
        
        // Try numeric comparison first to avoid false positives like "1500.00" vs "1500"
        const pNum = Number(projStr);
        const dNum = Number(docStr);
        const isNumericCompare = !isNaN(pNum) && !isNaN(dNum) && projStr !== "" && docStr !== "";

        const isDiscrepant = isNumericCompare ? pNum !== dNum : projStr.toLowerCase() !== docStr.toLowerCase();

        if (isDiscrepant) {
          discrepancies.push({
            field,
            projectValue: projStr,
            documentValue: docStr,
            message: rules.alertMessage(projValue, docValue, field)
          });
        }
      } else if (rules.matchStrategy === 'range') {
        // Remove non-numeric characters for comparison
        const pStr = String(projValue).replace(/[^\d.-]/g, '');
        const dStr = String(docValue).replace(/[^\d.-]/g, '');
        
        const pNum = parseFloat(pStr);
        const dNum = parseFloat(dStr);

        const toleranceToUse = (documentType === 'plano-mensura' && field === 'superficieM2') ? rule8Tolerance : rules.tolerance;

        if (!isNaN(pNum) && !isNaN(dNum)) {
          // Numeric comparison with tolerance
          const diff = Math.abs(pNum - dNum) / (pNum === 0 ? 1 : pNum);
          if (diff > (toleranceToUse || 0)) {
            discrepancies.push({
              field,
              projectValue: String(projValue),
              documentValue: String(docValue),
              message: rules.alertMessage(projValue, docValue, field)
            });
          }
        } else {
          // Fallback to exact match for non-numeric fields even if strategy is 'range'
          const projStr = String(projValue).trim();
          const docStr = String(docValue).trim();
          if (projStr.toLowerCase() !== docStr.toLowerCase()) {
            discrepancies.push({
              field,
              projectValue: projStr,
              documentValue: docStr,
              message: rules.alertMessage(projValue, docValue, field)
            });
          }
        }
      }
    }

    return discrepancies;
  };

  return { checkDiscrepancies };
};
