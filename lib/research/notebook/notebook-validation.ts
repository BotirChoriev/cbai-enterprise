import {
  NOTEBOOK_STATUS_LABELS,
  NOTEBOOK_SUMMARY_SECTION_IDS,
  type NotebookStatus,
  type ResearchNotebook,
} from "@/lib/research/notebook/notebook-types";

export type ResearchNotebookValidationIssue = {
  code:
    | "missing_topic_id"
    | "missing_summary_sections"
    | "invalid_status"
    | "empty_evidence_focus"
    | "missing_human_review_flag";
  message: string;
  notebookId?: string;
};

export type ResearchNotebookValidationReport = {
  valid: boolean;
  issues: ResearchNotebookValidationIssue[];
};

const REQUIRED_SECTIONS = new Set<string>(NOTEBOOK_SUMMARY_SECTION_IDS);

/** Validate a research notebook snapshot. */
export function validateResearchNotebook(
  notebook: ResearchNotebook,
): ResearchNotebookValidationReport {
  const issues: ResearchNotebookValidationIssue[] = [];

  if (!notebook.topicId.trim()) {
    issues.push({
      code: "missing_topic_id",
      message: "Notebook is missing topicId.",
      notebookId: notebook.notebookId,
    });
  }

  if (!(notebook.status in NOTEBOOK_STATUS_LABELS)) {
    issues.push({
      code: "invalid_status",
      message: `Invalid notebook status "${notebook.status}".`,
      notebookId: notebook.notebookId,
    });
  }

  if (notebook.summarySections.length === 0) {
    issues.push({
      code: "missing_summary_sections",
      message: "Notebook has no summary sections.",
      notebookId: notebook.notebookId,
    });
  }

  for (const sectionId of REQUIRED_SECTIONS) {
    if (!notebook.summarySections.some((section) => section.sectionId === sectionId)) {
      issues.push({
        code: "missing_summary_sections",
        message: `Missing required summary section "${sectionId}".`,
        notebookId: notebook.notebookId,
      });
    }
  }

  if (notebook.evidenceFocus.length === 0) {
    issues.push({
      code: "empty_evidence_focus",
      message: "Notebook evidenceFocus is empty.",
      notebookId: notebook.notebookId,
    });
  }

  if (!notebook.humanReviewRequired) {
    issues.push({
      code: "missing_human_review_flag",
      message: "Notebook must require human review.",
      notebookId: notebook.notebookId,
    });
  }

  return { valid: issues.length === 0, issues };
}

export function isValidNotebookStatus(value: string): value is NotebookStatus {
  return value in NOTEBOOK_STATUS_LABELS;
}
