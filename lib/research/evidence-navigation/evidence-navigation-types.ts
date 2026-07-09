export const EVIDENCE_NAVIGATION_OBJECT_KINDS = [
  "research_topic",
  "method",
  "evidence_type",
  "publication",
  "experiment",
  "dataset",
  "laboratory",
  "researcher",
  "open_question",
  "negative_result",
  "patent",
  "workspace",
] as const;

export type EvidenceNavigationObjectKind = (typeof EVIDENCE_NAVIGATION_OBJECT_KINDS)[number];

export const EVIDENCE_NAVIGATION_RELATIONSHIP_TYPES = [
  "starts_from",
  "uses_method",
  "requires_evidence",
  "connects_to_gap",
  "connects_to_question",
  "connects_to_negative_result",
  "future_supports",
  "opens_workspace",
] as const;

export type EvidenceNavigationRelationshipType =
  (typeof EVIDENCE_NAVIGATION_RELATIONSHIP_TYPES)[number];

export const EVIDENCE_NAVIGATION_STATUSES = [
  "available_catalog",
  "not_connected_yet",
  "future_workspace",
  "human_review_required",
] as const;

export type EvidenceNavigationStatus = (typeof EVIDENCE_NAVIGATION_STATUSES)[number];

export const EVIDENCE_NAVIGATION_MODEL_VERSION = "1.0.0";
