import { useProject } from "../../projects/api/useProjects";

export interface Discrepancy {
  field: string;
  projectValue: string;
  documentValue: string;
}

export const useDiscrepancyCheck = (projectId?: string) => {
  const { data: project } = useProject(projectId || "");

  const checkDiscrepancies = (documentData: Record<string, string | number | undefined>): Discrepancy[] => {
    if (!project) return [];

    const discrepancies: Discrepancy[] = [];

    const compareField = (fieldName: string, projVal: any, docVal: any) => {
      if (projVal !== undefined && projVal !== null && projVal !== "" && docVal !== undefined && docVal !== null && docVal !== "") {
        // loose comparison to ignore type differences (like string "1500" vs number 1500)
        if (String(projVal).trim() !== String(docVal).trim()) {
          discrepancies.push({
            field: fieldName,
            projectValue: String(projVal),
            documentValue: String(docVal),
          });
        }
      }
    };

    if (documentData.matricula) compareField("Matrícula", project.matricula, documentData.matricula);
    if (documentData.designacionCatastral) compareField("Designación Catastral", project.designacionCatastral, documentData.designacionCatastral);
    if (documentData.superficieM2) compareField("Superficie M2", project.superficieM2, documentData.superficieM2);
    if (documentData.provincia) compareField("Provincia", project.ubicacionTexto, documentData.provincia);

    return discrepancies;
  };

  return { checkDiscrepancies };
};
