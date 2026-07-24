/**
 * Ontology schema registry — required fields per object kind.
 */

import type { OntologyObjectKind } from "@/lib/ontology/object-kinds";
import type { OntologyRelationshipKind } from "@/lib/ontology/relationship-kinds";

export type OntologyKindSchema = {
  readonly kind: OntologyObjectKind;
  readonly requiredMetadata: readonly string[];
  readonly allowedRelationships: readonly OntologyRelationshipKind[];
  readonly readOnly: boolean;
};

const BASE_REL: readonly OntologyRelationshipKind[] = ["references", "related_to"];

export const ONTOLOGY_SCHEMA_REGISTRY: Readonly<Record<OntologyObjectKind, OntologyKindSchema>> = {
  person: { kind: "person", requiredMetadata: [], allowedRelationships: [...BASE_REL, "reviewed_by", "assigned_to"], readOnly: false },
  organization: { kind: "organization", requiredMetadata: [], allowedRelationships: [...BASE_REL, "located_in"], readOnly: false },
  country: { kind: "country", requiredMetadata: ["countryCode"], allowedRelationships: [...BASE_REL, "concerns"], readOnly: true },
  region: { kind: "region", requiredMetadata: [], allowedRelationships: [...BASE_REL, "located_in"], readOnly: true },
  company: { kind: "company", requiredMetadata: ["sector"], allowedRelationships: [...BASE_REL, "located_in", "concerns"], readOnly: true },
  university: { kind: "university", requiredMetadata: [], allowedRelationships: [...BASE_REL, "located_in"], readOnly: true },
  research_topic: { kind: "research_topic", requiredMetadata: ["domain"], allowedRelationships: [...BASE_REL, "concerns"], readOnly: true },
  research_question: { kind: "research_question", requiredMetadata: [], allowedRelationships: [...BASE_REL, "concerns", "supported_by"], readOnly: false },
  hypothesis: { kind: "hypothesis", requiredMetadata: [], allowedRelationships: [...BASE_REL, "supported_by", "contradicted_by"], readOnly: false },
  claim: { kind: "claim", requiredMetadata: [], allowedRelationships: [...BASE_REL, "supported_by", "contradicted_by", "derived_from"], readOnly: false },
  evidence: { kind: "evidence", requiredMetadata: ["evidenceState"], allowedRelationships: [...BASE_REL, "derived_from", "supported_by", "contradicted_by"], readOnly: false },
  source: { kind: "source", requiredMetadata: [], allowedRelationships: [...BASE_REL, "derived_from"], readOnly: true },
  dataset: { kind: "dataset", requiredMetadata: [], allowedRelationships: [...BASE_REL, "derived_from"], readOnly: true },
  indicator: { kind: "indicator", requiredMetadata: ["indicatorId"], allowedRelationships: [...BASE_REL, "concerns", "applies_to"], readOnly: true },
  project: { kind: "project", requiredMetadata: ["projectType"], allowedRelationships: [...BASE_REL, "contains", "concerns", "produced_by"], readOnly: false },
  mission: { kind: "mission", requiredMetadata: [], allowedRelationships: [...BASE_REL, "contains", "concerns", "produced_by"], readOnly: false },
  work_plan: { kind: "work_plan", requiredMetadata: [], allowedRelationships: [...BASE_REL, "contains", "depends_on", "part_of"], readOnly: false },
  task: { kind: "task", requiredMetadata: [], allowedRelationships: [...BASE_REL, "depends_on", "assigned_to", "part_of"], readOnly: false },
  decision: { kind: "decision", requiredMetadata: [], allowedRelationships: [...BASE_REL, "reviewed_by", "applies_to"], readOnly: false },
  review: { kind: "review", requiredMetadata: [], allowedRelationships: [...BASE_REL, "reviewed_by", "applies_to"], readOnly: false },
  report: { kind: "report", requiredMetadata: ["reportType"], allowedRelationships: [...BASE_REL, "produced_by", "applies_to"], readOnly: false },
  risk: { kind: "risk", requiredMetadata: ["severity"], allowedRelationships: [...BASE_REL, "applies_to"], readOnly: false },
  limitation: { kind: "limitation", requiredMetadata: [], allowedRelationships: [...BASE_REL, "applies_to"], readOnly: false },
  policy: { kind: "policy", requiredMetadata: ["policyCategory"], allowedRelationships: [...BASE_REL, "applies_to"], readOnly: true },
  standard: { kind: "standard", requiredMetadata: [], allowedRelationships: [...BASE_REL, "applies_to"], readOnly: true },
  meeting: { kind: "meeting", requiredMetadata: [], allowedRelationships: [...BASE_REL, "contains", "part_of"], readOnly: false },
  translation_session: { kind: "translation_session", requiredMetadata: ["sourceLocale", "targetLocale"], allowedRelationships: [...BASE_REL, "part_of"], readOnly: false },
};

export function getKindSchema(kind: OntologyObjectKind): OntologyKindSchema {
  return ONTOLOGY_SCHEMA_REGISTRY[kind];
}
