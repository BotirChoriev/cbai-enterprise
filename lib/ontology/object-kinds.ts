/**
 * Canonical ontology object kinds — 28 typed object types.
 */

export const ONTOLOGY_OBJECT_KINDS = [
  "person",
  "organization",
  "country",
  "region",
  "company",
  "university",
  "research_topic",
  "research_question",
  "hypothesis",
  "claim",
  "evidence",
  "source",
  "dataset",
  "indicator",
  "project",
  "mission",
  "work_plan",
  "task",
  "decision",
  "review",
  "report",
  "risk",
  "limitation",
  "policy",
  "standard",
  "meeting",
  "translation_session",
] as const;

export type OntologyObjectKind = (typeof ONTOLOGY_OBJECT_KINDS)[number];

const KIND_SET = new Set<string>(ONTOLOGY_OBJECT_KINDS);

export function isOntologyObjectKind(value: unknown): value is OntologyObjectKind {
  return typeof value === "string" && KIND_SET.has(value);
}

/** Maps legacy Operational Object types to ontology kinds. */
export const OPERATIONAL_OBJECT_KIND_MAP: Readonly<Record<string, OntologyObjectKind>> = {
  project: "project",
  mission: "mission",
  work_plan: "work_plan",
  task: "task",
  research_question: "research_question",
  evidence_request: "evidence",
  review: "review",
  decision_brief: "decision",
  meeting_action: "task",
};

/** Maps legacy Entity types to ontology kinds. */
export const ENTITY_KIND_MAP: Readonly<Record<string, OntologyObjectKind>> = {
  country: "country",
  company: "company",
  university: "university",
  research_topic: "research_topic",
  project: "project",
  person: "person",
  government: "organization",
  investor: "organization",
};

/** Human-readable labels for developer/test use — not UI copy. */
export const ONTOLOGY_KIND_LABELS: Readonly<Record<OntologyObjectKind, string>> = {
  person: "Person",
  organization: "Organization",
  country: "Country",
  region: "Region",
  company: "Company",
  university: "University",
  research_topic: "Research Topic",
  research_question: "Research Question",
  hypothesis: "Hypothesis",
  claim: "Claim",
  evidence: "Evidence",
  source: "Source",
  dataset: "Dataset",
  indicator: "Indicator",
  project: "Project",
  mission: "Mission",
  work_plan: "Work Plan",
  task: "Task",
  decision: "Decision",
  review: "Review",
  report: "Report",
  risk: "Risk",
  limitation: "Limitation",
  policy: "Policy",
  standard: "Standard",
  meeting: "Meeting",
  translation_session: "Translation Session",
};
