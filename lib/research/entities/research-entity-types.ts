export const RESEARCH_ENTITY_TYPES = [
  "research_topic",
  "organism",
  "disease",
  "technology",
  "method",
  "publication",
  "dataset",
  "patent",
  "laboratory",
  "university",
  "researcher",
  "experiment",
  "open_question",
  "negative_result",
] as const;

export type ResearchEntityType = (typeof RESEARCH_ENTITY_TYPES)[number];

export type ResearchEntityEvidenceStatus =
  | "catalog_available"
  | "evidence_not_connected"
  | "source_not_connected";

export type ResearchEntitySourceStatus =
  | "catalog_only"
  | "official_source_not_connected"
  | "future_source_required";

export type ResearchEntityWorkspaceStatus = "not_available_yet" | "future_workspace";

export type ResearchEntity = {
  entityId: string;
  entityType: ResearchEntityType;
  displayName: string;
  description: string;
  relatedTopicIds: readonly string[];
  relatedEntityIds: readonly string[];
  evidenceStatus: ResearchEntityEvidenceStatus;
  sourceStatus: ResearchEntitySourceStatus;
  workspaceStatus: ResearchEntityWorkspaceStatus;
  humanReviewRequired: boolean;
  version: string;
};

export type ResearchEntityTypeDefinition = {
  entityType: ResearchEntityType;
  displayName: string;
  description: string;
  futureRole: string;
};

export const RESEARCH_ENTITY_EVIDENCE_STATUS_LABELS: Record<
  ResearchEntityEvidenceStatus,
  string
> = {
  catalog_available: "Catalog available",
  evidence_not_connected: "Evidence not connected",
  source_not_connected: "Source not connected",
};

export const RESEARCH_ENTITY_SOURCE_STATUS_LABELS: Record<ResearchEntitySourceStatus, string> = {
  catalog_only: "Catalog only",
  official_source_not_connected: "Official source not connected",
  future_source_required: "Future source required",
};

export const RESEARCH_ENTITY_WORKSPACE_STATUS_LABELS: Record<
  ResearchEntityWorkspaceStatus,
  string
> = {
  not_available_yet: "Not available yet",
  future_workspace: "Future workspace",
};

export const RESEARCH_ENTITY_TYPE_DEFINITIONS: Record<
  ResearchEntityType,
  ResearchEntityTypeDefinition
> = {
  research_topic: {
    entityType: "research_topic",
    displayName: "Research topic",
    description: "A structured research topic from the catalog.",
    futureRole: "Anchor object for related research objects in a future workspace.",
  },
  organism: {
    entityType: "organism",
    displayName: "Organism",
    description: "A biological organism referenced in research.",
    futureRole: "Link experiments, datasets, and publications when sources connect.",
  },
  disease: {
    entityType: "disease",
    displayName: "Disease",
    description: "A disease or condition studied in research.",
    futureRole: "Connect clinical evidence and open questions when sources connect.",
  },
  technology: {
    entityType: "technology",
    displayName: "Technology",
    description: "A technology area or platform under study.",
    futureRole: "Relate methods, patents, and experiments in a future workspace.",
  },
  method: {
    entityType: "method",
    displayName: "Method",
    description: "A research method or protocol reference.",
    futureRole: "Connect to experiments and datasets when official sources are linked.",
  },
  publication: {
    entityType: "publication",
    displayName: "Publication",
    description: "A peer-reviewed or official publication reference.",
    futureRole: "Hold citation metadata when publication feeds connect.",
  },
  dataset: {
    entityType: "dataset",
    displayName: "Dataset",
    description: "A structured dataset reference.",
    futureRole: "Link to experiments and evidence when data sources connect.",
  },
  patent: {
    entityType: "patent",
    displayName: "Patent",
    description: "An intellectual property or patent reference.",
    futureRole: "Connect to technologies and methods when patent sources link.",
  },
  laboratory: {
    entityType: "laboratory",
    displayName: "Laboratory",
    description: "A laboratory or facility reference.",
    futureRole: "Relate experiments and researchers when institutional sources connect.",
  },
  university: {
    entityType: "university",
    displayName: "University",
    description: "An academic institution reference.",
    futureRole: "Connect researchers and publications when institutional data links.",
  },
  researcher: {
    entityType: "researcher",
    displayName: "Researcher",
    description: "A researcher profile reference.",
    futureRole: "Relate publications and laboratories when profile sources connect.",
  },
  experiment: {
    entityType: "experiment",
    displayName: "Experiment",
    description: "An experimental study or trial reference.",
    futureRole: "Link methods, datasets, and negative results when study records connect.",
  },
  open_question: {
    entityType: "open_question",
    displayName: "Open question",
    description: "An unresolved research question.",
    futureRole: "Track evidence gaps and future study needs in a workspace.",
  },
  negative_result: {
    entityType: "negative_result",
    displayName: "Negative result",
    description: "A null or non-replicating finding reference.",
    futureRole: "Document evidence gaps without overstating conclusions.",
  },
};

export const RESEARCH_ENTITY_MODEL_VERSION = "1.0.0";
