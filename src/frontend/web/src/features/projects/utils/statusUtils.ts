import { ProjectStatus } from "../types";

export const getStatusLabel = (status: ProjectStatus, t: any): string => {
  switch (status) {
    case ProjectStatus.Draft: return t("status.draft");
    case ProjectStatus.Edited: return t("status.edited");
    case ProjectStatus.Published: return t("status.published");
    case ProjectStatus.InReview: return t("status.inReview");
    case ProjectStatus.Observed: return t("status.observed");
    case ProjectStatus.Validated: return t("status.validated");
    case ProjectStatus.Rejected: return t("status.rejected");
    default: return t("status.unknown");
  }
};
