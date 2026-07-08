export {
  DISCOVERY_RELATIONSHIP_REASONS,
  DISCOVERY_MODEL_VERSION,
  DISCOVERY_RELATIONSHIP_REASON_LABELS,
  DISCOVERY_STATUS_LABELS,
  DISCOVERY_CATALOG_NOTICE,
  DISCOVERY_HUMAN_REVIEW_NOTICE,
  type DiscoveryRelationshipReason,
  type DiscoveryStatus,
  type CrossTopicDiscovery,
  type CrossTopicDiscoveryContext,
} from "@/lib/research/discovery/discovery-types";

export {
  buildCrossTopicDiscovery,
  buildCrossTopicDiscoveriesForTopic,
} from "@/lib/research/discovery/discovery-builder";

export {
  getCrossTopicDiscoveriesForTopic,
  getCrossTopicDiscoveryContext,
  findCrossTopicDiscovery,
} from "@/lib/research/discovery/discovery-query";

export {
  validateCrossTopicDiscoveries,
  type DiscoveryValidationIssue,
  type DiscoveryValidationReport,
} from "@/lib/research/discovery/discovery-validation";
