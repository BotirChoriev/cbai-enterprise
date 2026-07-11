import type { Confidence } from "@/lib/foundation/confidence";
import { CONFIDENCE_LABELS } from "@/lib/foundation/confidence";

// Universal relationship vocabulary — domain-agnostic, shared by every ecosystem. Extensible:
// add new values here as real ecosystems need them; nothing about the Relationship shape in
// foundation-model.ts depends on this being a closed set beyond normal TypeScript union rules.
export const RELATIONSHIP_TYPES = [
  "supports",
  "contradicts",
  "depends_on",
  "collaborates_with",
  "funded_by",
  "regulated_by",
  "creates",
  "uses",
  "improves",
  "replaces",
  "extends",
  "references",
  "affects",
  "measures",
  "belongs_to",
  "related_to",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  supports: "Supports",
  contradicts: "Contradicts",
  depends_on: "Depends on",
  collaborates_with: "Collaborates with",
  funded_by: "Funded by",
  regulated_by: "Regulated by",
  creates: "Creates",
  uses: "Uses",
  improves: "Improves",
  replaces: "Replaces",
  extends: "Extends",
  references: "References",
  affects: "Affects",
  measures: "Measures",
  belongs_to: "Belongs to",
  related_to: "Related to",
};

export type RelationshipDirection = "directed" | "bidirectional";

export const RELATIONSHIP_DIRECTION_LABELS: Record<RelationshipDirection, string> = {
  directed: "Directed",
  bidirectional: "Bidirectional",
};

// Categorical, never numeric — this platform never assigns a fabricated magnitude to a
// relationship. "unknown" is the honest default until real evidence justifies otherwise.
export type RelationshipStrength = "weak" | "moderate" | "strong" | "unknown";

export const RELATIONSHIP_STRENGTH_LABELS: Record<RelationshipStrength, string> = {
  weak: "Weak",
  moderate: "Moderate",
  strong: "Strong",
  unknown: "Unknown",
};

// Aliased to the shared Confidence type (lib/foundation/confidence.ts) — Evidence uses the
// exact same vocabulary, so this is one definition, not two. Kept as a named export for
// existing consumers (zero breaking change).
export type RelationshipConfidence = Confidence;

export const RELATIONSHIP_CONFIDENCE_LABELS: Record<RelationshipConfidence, string> =
  CONFIDENCE_LABELS;

export type RelationshipStatus = "active" | "historical" | "proposed" | "retracted";

export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  active: "Active",
  historical: "Historical",
  proposed: "Proposed",
  retracted: "Retracted",
};
