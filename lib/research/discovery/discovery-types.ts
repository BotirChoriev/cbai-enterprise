export const DISCOVERY_RELATIONSHIP_REASONS = [
  "same_domain",
  "shared_method",
  "shared_evidence_type",
  "shared_future_object",
] as const;

export type DiscoveryRelationshipReason = (typeof DISCOVERY_RELATIONSHIP_REASONS)[number];

export type DiscoveryStatus = "catalog_connection" | "not_scientific_proof" | "future_workspace";

export type CrossTopicDiscovery = {
  discoveryId: string;
  sourceTopicId: string;
  relatedTopicId: string;
  relationshipReasons: readonly DiscoveryRelationshipReason[];
  sharedMethods: readonly string[];
  sharedEvidenceTypes: readonly string[];
  sharedDomain: string | null;
  futureObjects: readonly string[];
  status: DiscoveryStatus;
  humanReviewRequired: boolean;
  version: string;
};

export const DISCOVERY_MODEL_VERSION = "1.0.0";

export const DISCOVERY_RELATIONSHIP_REASON_LABELS: Record<DiscoveryRelationshipReason, string> = {
  same_domain: "Same domain",
  shared_method: "Shared method",
  shared_evidence_type: "Shared evidence type",
  shared_future_object: "Shared future object",
};

export const DISCOVERY_STATUS_LABELS: Record<DiscoveryStatus, string> = {
  catalog_connection: "Catalog connection",
  not_scientific_proof: "Not scientific proof",
  future_workspace: "Future workspace",
};

export const DISCOVERY_CATALOG_NOTICE =
  "These connections come from catalog metadata. They are not scientific proof.";

export const DISCOVERY_HUMAN_REVIEW_NOTICE =
  "Human review is required before any catalog connection supports a research decision.";

export type CrossTopicDiscoveryContext = {
  sourceTopicId: string;
  discoveries: readonly CrossTopicDiscovery[];
};
