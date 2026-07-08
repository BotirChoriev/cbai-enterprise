export const LANDSCAPE_OBJECT_STATUSES = [
  "catalog_available",
  "not_connected_yet",
  "future_workspace",
] as const;

export type LandscapeObjectStatus = (typeof LANDSCAPE_OBJECT_STATUSES)[number];

export const LANDSCAPE_RING_IDS = ["center", "first", "second", "third"] as const;

export type LandscapeRingId = (typeof LANDSCAPE_RING_IDS)[number];

export type LandscapeCenterTopic = {
  topicId: string;
  topicName: string;
  domain: string;
  description: string;
  status: LandscapeObjectStatus;
};

export type LandscapeObject = {
  objectId: string;
  label: string;
  ring: LandscapeRingId;
  status: LandscapeObjectStatus;
  description?: string;
  href?: string;
  topicId?: string;
};

export type ResearchLandscape = {
  landscapeId: string;
  topicId: string;
  centerTopic: LandscapeCenterTopic;
  domains: readonly LandscapeObject[];
  methods: readonly LandscapeObject[];
  evidenceTypes: readonly LandscapeObject[];
  futureObjects: readonly LandscapeObject[];
  relatedTopics: readonly LandscapeObject[];
  knowledgeGaps: readonly LandscapeObject[];
  modules: readonly LandscapeObject[];
  humanReviewRequired: boolean;
  status: LandscapeObjectStatus;
  version: string;
};

export const LANDSCAPE_MODEL_VERSION = "1.0.0";

export const LANDSCAPE_STATUS_LABELS: Record<LandscapeObjectStatus, string> = {
  catalog_available: "Catalog available",
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const LANDSCAPE_HONEST_NOTICE =
  "This landscape is built from catalog connections only. It does not represent scientific proof.";

export const LANDSCAPE_HUMAN_REVIEW_NOTICE =
  "Human scientific review is required before any landscape connection supports a decision.";

export const LANDSCAPE_RING_LABELS: Record<LandscapeRingId, string> = {
  center: "Research topic",
  first: "Evidence areas",
  second: "Related research objects",
  third: "Future workspace",
};

export const LANDSCAPE_RELATED_TOPIC_LIMIT = 6;

export const LANDSCAPE_KNOWLEDGE_GAP_LIMIT = 5;

export const LANDSCAPE_FUTURE_OBJECT_LIMIT = 8;
