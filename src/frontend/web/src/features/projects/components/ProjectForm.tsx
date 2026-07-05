import React from "react";
import { useProjectForm, ProjectFormProps } from "../hooks/useProjectForm";
import { ProjectFormLayout } from "./ProjectFormLayout";

export { type ProjectFormProps };

export const ProjectForm: React.FC<ProjectFormProps> = (props) => {
  const {
    basicFields,
    detailsFields,
    documentSection,
    ...layoutProps
  } = useProjectForm(props);

  return (
    <ProjectFormLayout
      {...layoutProps}
      basicFields={basicFields}
      detailsFields={detailsFields}
      documentSection={documentSection}
    />
  );
};
