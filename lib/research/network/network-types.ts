export const RESEARCH_CONNECTION_TYPES = [
  "shared_domain",
  "shared_method",
  "shared_evidence",
  "future_workspace",
] as const;

export type ResearchConnectionType = (typeof RESEARCH_CONNECTION_TYPES)[number];

export type ResearchNetworkNodeStatus =
  | "catalog_available"
  | "not_connected_yet"
  | "future_workspace";

export type ResearchNetworkNode = {
  nodeId: string;
  topicId: string;
  topicName: string;
  domain: string;
  domainId: string;
  relatedTopics: readonly string[];
  sharedMethods: readonly string[];
  sharedEvidence: readonly string[];
  status: ResearchNetworkNodeStatus;
  x: number;
  y: number;
};

export type ResearchNetworkConnection = {
  connectionId: string;
  sourceTopicId: string;
  targetTopicId: string;
  connectionTypes: readonly ResearchConnectionType[];
  status: ResearchNetworkNodeStatus;
};

export type ResearchNetwork = {
  networkId: string;
  nodes: readonly ResearchNetworkNode[];
  connections: readonly ResearchNetworkConnection[];
  topicCount: number;
  connectionCount: number;
  humanReviewRequired: boolean;
  version: string;
};

export const RESEARCH_NETWORK_MODEL_VERSION = "1.0.0";

export const RESEARCH_NETWORK_ID = "global-research-network";

export const RESEARCH_CONNECTION_TYPE_LABELS: Record<ResearchConnectionType, string> = {
  shared_domain: "Shared domain",
  shared_method: "Shared method",
  shared_evidence: "Shared evidence",
  future_workspace: "Future workspace",
};

export const RESEARCH_NETWORK_STATUS_LABELS: Record<ResearchNetworkNodeStatus, string> = {
  catalog_available: "Catalog available",
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const RESEARCH_NETWORK_HONEST_NOTICE =
  "This network is built from catalog relationships only. It does not represent scientific proof.";

export const RESEARCH_NETWORK_HUMAN_REVIEW_NOTICE =
  "Human review is required before any catalog connection supports a research decision.";

export const RESEARCH_NETWORK_VIEWBOX = {
  width: 1000,
  height: 720,
} as const;
