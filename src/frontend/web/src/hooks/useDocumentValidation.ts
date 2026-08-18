import { useProject } from "../features/projects/api/useProjects";
import { VALIDATION_RULES, DocumentType } from "../lib/validation-rules";
import { Discrepancy } from "../features/validations/hooks/useDiscrepancyCheck";

export const useDocumentValidation = (projectId?: string) => {
  const { data: project } = useProject(projectId || "");

  const validateDocument = (
    documentType: DocumentType,
    documentData: Record<string, any>
  ): Discrepancy[] => {
    if (!project) return [];

    const rules = VALIDATION_RULES[documentType];
    if (!rules) return [];

    const discrepancies: Discrepancy[] = [];

    for (const field of rules.fieldsToValidate) {
      const projValue = (project as Record<string, any>)[field];
      const docValue = documentData[field];

      if (projValue === undefined || projValue === null || projValue === "" ||
          docValue === undefined || docValue === null || docValue === "") {
        continue; // Skip if either is missing, following the loose comparison pattern
      }

      if (rules.matchStrategy === 'exact') {
        if (String(projValue).trim() !== String(docValue).trim()) {
          discrepancies.push({
            field,
            projectValue: String(projValue),
            documentValue: String(docValue),
          });
        }
      } else if (rules.matchStrategy === 'range') {
        // Assume numbers
        const pNum = parseFloat(String(projValue));
        const dNum = parseFloat(String(docValue));

        if (!isNaN(pNum) && !isNaN(dNum)) {
          const diff = Math.abs(pNum - dNum) / pNum;
          if (diff > (rules.tolerance || 0)) {
            discrepancies.push({
              field,
              projectValue: String(projValue),
              documentValue: String(docValue),
            });
          }
        }
      }
    }

    return discrepancies;
  };

  return { validateDocument };
};
