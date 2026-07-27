/**
 * Canonical Domain & Country Intelligence entity kinds and typed relationships.
 *
 * Unifies academic hierarchy + country intelligence under one typed model.
 * Does NOT invent records — kinds and edges are the vocabulary; instances come
 * only from real registries, user confirmation, or honest unavailable adapters.
 */

/** Academic + country intelligence entity kinds (closed vocabulary). */
export const DOMAIN_ENTITY_KINDS = [
  "country",
  "institution",
  "university",
  "faculty",
  "department",
  "program",
  "discipline",
  "subfield",
  "researcher",
  "research_group",
  "research_project",
  "publication",
  "dataset",
  "experiment",
  "method",
  "instrument",
  "finding",
  "outcome",
  "impact",
  "evidence_record",
  "source",
  "company",
  "ministry",
  "law_or_standard",
  "indicator",
  "research_question",
  "hypothesis",
  "mathematical_model",
  "material",
  "sample_population",
  "geographic_scope",
  "time_period",
  "funding_organization",
  "collaborator",
  "contradiction",
  "knowledge_gap",
  "official_plan",
  "scenario",
  "operational_object",
] as const;

export type DomainEntityKind = (typeof DOMAIN_ENTITY_KINDS)[number];

/** Explicit typed relationship kinds for the Domain Intelligence Graph. */
export const DOMAIN_RELATIONSHIP_KINDS = [
  "RESEARCHED_BY",
  "AFFILIATED_WITH",
  "CONDUCTED_AT",
  "PUBLISHED_IN",
  "USES_METHOD",
  "USES_DATASET",
  "USES_INSTRUMENT",
  "SUPPORTS",
  "CONTRADICTS",
  "EXTENDS",
  "REPLICATES",
  "FUNDED_BY",
  "APPLIES_TO_COUNTRY",
  "MEASURES_INDICATOR",
  "INFLUENCES",
  "DEPENDS_ON",
  "PRODUCED_FINDING",
  "LOCATED_IN",
  "PART_OF",
  "CONTAINS",
  "COLLABORATES_WITH",
  "REGULATED_BY",
  "ISSUED_BY",
  "TARGETS",
  "LINKS_WORK",
] as const;

export type DomainRelationshipKind = (typeof DOMAIN_RELATIONSHIP_KINDS)[number];

export const DOMAIN_RELATIONSHIP_DIRECTION: Readonly<
  Record<DomainRelationshipKind, "directed" | "bidirectional">
> = {
  RESEARCHED_BY: "directed",
  AFFILIATED_WITH: "directed",
  CONDUCTED_AT: "directed",
  PUBLISHED_IN: "directed",
  USES_METHOD: "directed",
  USES_DATASET: "directed",
  USES_INSTRUMENT: "directed",
  SUPPORTS: "directed",
  CONTRADICTS: "directed",
  EXTENDS: "directed",
  REPLICATES: "directed",
  FUNDED_BY: "directed",
  APPLIES_TO_COUNTRY: "directed",
  MEASURES_INDICATOR: "directed",
  INFLUENCES: "directed",
  DEPENDS_ON: "directed",
  PRODUCED_FINDING: "directed",
  LOCATED_IN: "directed",
  PART_OF: "directed",
  CONTAINS: "directed",
  COLLABORATES_WITH: "bidirectional",
  REGULATED_BY: "directed",
  ISSUED_BY: "directed",
  TARGETS: "directed",
  LINKS_WORK: "directed",
};

/** Academic hierarchy levels (Country → … → Source). */
export const ACADEMIC_HIERARCHY: readonly DomainEntityKind[] = [
  "country",
  "institution",
  "university",
  "faculty",
  "department",
  "program",
  "discipline",
  "researcher",
  "research_group",
  "research_project",
  "publication",
  "dataset",
  "experiment",
  "method",
  "instrument",
  "finding",
  "outcome",
  "impact",
  "evidence_record",
  "source",
] as const;

const KIND_SET = new Set<string>(DOMAIN_ENTITY_KINDS);
const REL_SET = new Set<string>(DOMAIN_RELATIONSHIP_KINDS);

export function isDomainEntityKind(value: unknown): value is DomainEntityKind {
  return typeof value === "string" && KIND_SET.has(value);
}

export function isDomainRelationshipKind(value: unknown): value is DomainRelationshipKind {
  return typeof value === "string" && REL_SET.has(value);
}

/** Allowed (fromKind, toKind) pairs for selected relationship kinds. Open kinds return true. */
export const DOMAIN_ALLOWED_PAIRS: Readonly<
  Partial<Record<DomainRelationshipKind, readonly { from: DomainEntityKind; to: DomainEntityKind }[]>>
> = {
  LOCATED_IN: [
    { from: "university", to: "country" },
    { from: "company", to: "country" },
    { from: "institution", to: "country" },
    { from: "ministry", to: "country" },
    { from: "research_group", to: "university" },
    { from: "department", to: "university" },
    { from: "faculty", to: "university" },
  ],
  PART_OF: [
    { from: "department", to: "faculty" },
    { from: "faculty", to: "university" },
    { from: "program", to: "department" },
    { from: "subfield", to: "discipline" },
    { from: "experiment", to: "research_project" },
    { from: "finding", to: "publication" },
  ],
  CONTAINS: [
    { from: "university", to: "faculty" },
    { from: "faculty", to: "department" },
    { from: "country", to: "university" },
    { from: "country", to: "ministry" },
  ],
  AFFILIATED_WITH: [
    { from: "researcher", to: "university" },
    { from: "researcher", to: "department" },
    { from: "researcher", to: "research_group" },
  ],
  RESEARCHED_BY: [
    { from: "research_project", to: "researcher" },
    { from: "publication", to: "researcher" },
    { from: "finding", to: "researcher" },
  ],
  CONDUCTED_AT: [
    { from: "experiment", to: "university" },
    { from: "experiment", to: "department" },
    { from: "research_project", to: "university" },
  ],
  PUBLISHED_IN: [{ from: "finding", to: "publication" }],
  USES_METHOD: [
    { from: "experiment", to: "method" },
    { from: "research_project", to: "method" },
    { from: "publication", to: "method" },
  ],
  USES_DATASET: [
    { from: "experiment", to: "dataset" },
    { from: "research_project", to: "dataset" },
    { from: "finding", to: "dataset" },
  ],
  SUPPORTS: [
    { from: "evidence_record", to: "finding" },
    { from: "finding", to: "hypothesis" },
  ],
  CONTRADICTS: [
    { from: "finding", to: "finding" },
    { from: "evidence_record", to: "finding" },
  ],
  PRODUCED_FINDING: [
    { from: "experiment", to: "finding" },
    { from: "research_project", to: "finding" },
  ],
  APPLIES_TO_COUNTRY: [
    { from: "indicator", to: "country" },
    { from: "law_or_standard", to: "country" },
    { from: "official_plan", to: "country" },
    { from: "research_project", to: "country" },
  ],
  MEASURES_INDICATOR: [{ from: "evidence_record", to: "indicator" }],
  FUNDED_BY: [
    { from: "research_project", to: "funding_organization" },
    { from: "publication", to: "funding_organization" },
  ],
  ISSUED_BY: [
    { from: "law_or_standard", to: "ministry" },
    { from: "official_plan", to: "ministry" },
  ],
  LINKS_WORK: [
    { from: "operational_object", to: "country" },
    { from: "operational_object", to: "university" },
    { from: "operational_object", to: "evidence_record" },
  ],
};

export function isDomainRelationshipAllowed(
  kind: DomainRelationshipKind,
  fromKind: DomainEntityKind,
  toKind: DomainEntityKind,
): boolean {
  const pairs = DOMAIN_ALLOWED_PAIRS[kind];
  if (!pairs) {
    return (
      kind === "EXTENDS" ||
      kind === "REPLICATES" ||
      kind === "INFLUENCES" ||
      kind === "DEPENDS_ON" ||
      kind === "COLLABORATES_WITH" ||
      kind === "REGULATED_BY" ||
      kind === "TARGETS" ||
      kind === "USES_INSTRUMENT"
    );
  }
  return pairs.some((p) => p.from === fromKind && p.to === toKind);
}
