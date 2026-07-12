/**
 * Project Engine — the primary working object of CBAI (Project Engine Activation mission).
 *
 * A Project is a thin composition layer over already-real engines: it holds a title/type/
 * description and a real, local list of links into Evidence, Notes, Tasks, Open Questions, and
 * related Entities (Country/Company/University/Research). No new architecture is introduced for
 * any of those — Project only adds the container and the linking, reusing the Universal Entity
 * Engine, Relationship Engine, Report Engine, and Workspace (pin) architecture throughout.
 */

import type { ContextEntityRef } from "@/lib/context/context-types";

/**
 * Configuration, not hardcoded workflow — every Project Type is purely descriptive metadata.
 * No code anywhere branches on a specific ProjectType id; the same Project shape and the same
 * UI serve every type.
 */
export type ProjectTypeId =
  | "research_project"
  | "country_analysis"
  | "company_analysis"
  | "university_study"
  | "policy_analysis"
  | "investment_analysis"
  | "technology_assessment"
  | "evidence_review";

export type ProjectTypeConfig = {
  id: ProjectTypeId;
  label: string;
  description: string;
};

export const PROJECT_TYPES: readonly ProjectTypeConfig[] = [
  { id: "research_project", label: "Research Project", description: "General research investigation across topics and evidence." },
  { id: "country_analysis", label: "Country Analysis", description: "Structured analysis centered on one or more countries." },
  { id: "company_analysis", label: "Company Analysis", description: "Structured analysis centered on one or more companies." },
  { id: "university_study", label: "University Study", description: "Structured analysis centered on one or more universities." },
  { id: "policy_analysis", label: "Policy Analysis", description: "Analysis of policy questions using connected evidence." },
  { id: "investment_analysis", label: "Investment Analysis", description: "Analysis supporting an investment question — no scores or recommendations fabricated." },
  { id: "technology_assessment", label: "Technology Assessment", description: "Assessment of a technology or research domain." },
  { id: "evidence_review", label: "Evidence Review", description: "Focused review of a specific evidence set." },
] as const;

export function getProjectTypeLabel(id: ProjectTypeId): string {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

/**
 * Only "private" is a real, working capability — this platform has no account or sharing system.
 * "team"/"public" are declared honestly as Planned, never offered as if they work.
 */
export type ProjectVisibility = "private" | "team" | "public";

export const PROJECT_VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  private: "Private (this device only)",
  team: "Team (Planned — requires accounts, not available yet)",
  public: "Public (Planned — requires accounts, not available yet)",
};

export type Project = {
  id: string;
  title: string;
  type: ProjectTypeId;
  description: string;
  primaryEntity?: ContextEntityRef;
  tags: string[];
  visibility: ProjectVisibility;
  status: ProjectStatus;
  researchQuestion?: string;
  objectives?: string;
  /** Real timestamp of the last time the user generated this project's report — never assumed, only ever set by a real click. */
  reportGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * A note references Evidence and/or an Entity by real id — and is automatically included in the
 * Project Report (buildEntityReport("project", id)'s notes field), which is how it "references a
 * Report": there is no separate persisted report id to link against, since reports are compiled
 * on demand rather than stored.
 */
export type ProjectNote = {
  noteId: string;
  projectId: string;
  body: string;
  createdAt: string;
  linkedEvidenceId?: string;
  linkedEvidenceLabel?: string;
  linkedEntityId?: string;
  linkedEntityName?: string;
  linkedEntityType?: string;
};

export type ProjectTaskStatus = "todo" | "in_progress" | "done";

export const PROJECT_TASK_STATUS_LABELS: Record<ProjectTaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export type ProjectTask = {
  taskId: string;
  projectId: string;
  title: string;
  status: ProjectTaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectQuestion = {
  questionId: string;
  projectId: string;
  question: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
};

/** A real, user-authored evidence reference — never an automatically fabricated evidence item. */
export type ProjectEvidenceReference = {
  evidenceRefId: string;
  projectId: string;
  title: string;
  sourceUrl?: string;
  linkedEntityId?: string;
  linkedEntityName?: string;
  createdAt: string;
};
