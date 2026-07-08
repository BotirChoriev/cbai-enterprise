export {
  RESEARCH_CONNECTION_TYPES,
  RESEARCH_NETWORK_MODEL_VERSION,
  RESEARCH_NETWORK_ID,
  RESEARCH_CONNECTION_TYPE_LABELS,
  RESEARCH_NETWORK_STATUS_LABELS,
  RESEARCH_NETWORK_HONEST_NOTICE,
  RESEARCH_NETWORK_HUMAN_REVIEW_NOTICE,
  RESEARCH_NETWORK_VIEWBOX,
  type ResearchConnectionType,
  type ResearchNetworkNodeStatus,
  type ResearchNetworkNode,
  type ResearchNetworkConnection,
  type ResearchNetwork,
} from "@/lib/research/network/network-types";

export {
  buildGlobalResearchNetwork,
  findNetworkNodeByTopicId,
  listNetworkConnectionsForTopic,
} from "@/lib/research/network/network-builder";

export {
  getGlobalResearchNetwork,
  findNetworkConnection,
  listResearchNetworkNodes,
} from "@/lib/research/network/network-query";

export {
  validateResearchNetwork,
  type ResearchNetworkValidationIssue,
  type ResearchNetworkValidationReport,
} from "@/lib/research/network/network-validation";
