/**
 * Typed, directional ontology relationships — queryable semantic edges.
 */

export const ONTOLOGY_RELATIONSHIP_KINDS = [
  "contains",
  "supported_by",
  "contradicted_by",
  "derived_from",
  "concerns",
  "located_in",
  "produced_by",
  "reviewed_by",
  "depends_on",
  "part_of",
  "references",
  "applies_to",
  "assigned_to",
  "related_to",
] as const;

export type OntologyRelationshipKind = (typeof ONTOLOGY_RELATIONSHIP_KINDS)[number];

/** Semantic label for each relationship kind — used in query/display. */
export const RELATIONSHIP_SEMANTICS: Readonly<
  Record<
    OntologyRelationshipKind,
    { readonly label: string; readonly directional: boolean; readonly inverse?: OntologyRelationshipKind }
  >
> = {
  contains: { label: "CONTAINS", directional: true, inverse: "part_of" },
  supported_by: { label: "SUPPORTED_BY", directional: true },
  contradicted_by: { label: "CONTRADICTED_BY", directional: true },
  derived_from: { label: "DERIVED_FROM", directional: true },
  concerns: { label: "CONCERNS", directional: true },
  located_in: { label: "LOCATED_IN", directional: true },
  produced_by: { label: "PRODUCED_BY", directional: true },
  reviewed_by: { label: "REVIEWED_BY", directional: true },
  depends_on: { label: "DEPENDS_ON", directional: true },
  part_of: { label: "PART_OF", directional: true, inverse: "contains" },
  references: { label: "REFERENCES", directional: true },
  applies_to: { label: "APPLIES_TO", directional: true },
  assigned_to: { label: "ASSIGNED_TO", directional: true },
  related_to: { label: "RELATED_TO", directional: false },
};

/** Canonical relationship examples from mission spec. */
export const CANONICAL_RELATIONSHIP_EXAMPLES: readonly {
  readonly from: string;
  readonly kind: OntologyRelationshipKind;
  readonly to: string;
}[] = [
  { from: "project", kind: "contains", to: "task" },
  { from: "claim", kind: "supported_by", to: "evidence" },
  { from: "claim", kind: "contradicted_by", to: "evidence" },
  { from: "evidence", kind: "derived_from", to: "source" },
  { from: "project", kind: "concerns", to: "country" },
  { from: "university", kind: "located_in", to: "country" },
  { from: "report", kind: "produced_by", to: "mission" },
  { from: "decision", kind: "reviewed_by", to: "person" },
  { from: "work_plan", kind: "depends_on", to: "task" },
  { from: "translation_session", kind: "part_of", to: "meeting" },
];

export type OntologyRelationship = {
  readonly id: string;
  readonly kind: OntologyRelationshipKind;
  readonly fromId: string;
  readonly toId: string;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

const REL_KIND_SET = new Set<string>(ONTOLOGY_RELATIONSHIP_KINDS);

export function isOntologyRelationshipKind(value: unknown): value is OntologyRelationshipKind {
  return typeof value === "string" && REL_KIND_SET.has(value);
}

/** Allowed relationship pairs — fromKind → toKind for each relationship kind. */
export const ALLOWED_RELATIONSHIP_PAIRS: Readonly<
  Partial<Record<OntologyRelationshipKind, readonly { from: string; to: string }[]>>
> = {
  contains: [
    { from: "project", to: "task" },
    { from: "project", to: "work_plan" },
    { from: "work_plan", to: "task" },
    { from: "mission", to: "work_plan" },
  ],
  supported_by: [{ from: "claim", to: "evidence" }],
  contradicted_by: [{ from: "claim", to: "evidence" }],
  derived_from: [
    { from: "evidence", to: "source" },
    { from: "evidence", to: "dataset" },
  ],
  concerns: [
    { from: "project", to: "country" },
    { from: "mission", to: "country" },
    { from: "research_question", to: "country" },
  ],
  located_in: [
    { from: "university", to: "country" },
    { from: "company", to: "country" },
    { from: "region", to: "country" },
  ],
  produced_by: [
    { from: "report", to: "mission" },
    { from: "report", to: "project" },
  ],
  reviewed_by: [
    { from: "decision", to: "person" },
    { from: "review", to: "person" },
    { from: "report", to: "person" },
  ],
  depends_on: [
    { from: "work_plan", to: "task" },
    { from: "task", to: "task" },
  ],
  part_of: [{ from: "translation_session", to: "meeting" }],
  applies_to: [
    { from: "policy", to: "report" },
    { from: "standard", to: "evidence" },
  ],
};

export function isRelationshipAllowed(
  kind: OntologyRelationshipKind,
  fromKind: string,
  toKind: string,
): boolean {
  const pairs = ALLOWED_RELATIONSHIP_PAIRS[kind];
  if (!pairs) return kind === "references" || kind === "related_to" || kind === "assigned_to";
  return pairs.some((p) => p.from === fromKind && p.to === toKind);
}
