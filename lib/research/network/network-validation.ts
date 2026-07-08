import {
  RESEARCH_CONNECTION_TYPES,
  RESEARCH_NETWORK_STATUS_LABELS,
  type ResearchConnectionType,
  type ResearchNetwork,
  type ResearchNetworkNodeStatus,
} from "@/lib/research/network/network-types";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type ResearchNetworkValidationIssue = {
  code:
    | "duplicate_node_id"
    | "duplicate_connection_id"
    | "unknown_topic"
    | "invalid_connection_type"
    | "invalid_status"
    | "self_connection"
    | "missing_position"
    | "connection_topic_missing";
  message: string;
  nodeId?: string;
  connectionId?: string;
};

export type ResearchNetworkValidationReport = {
  valid: boolean;
  issues: ResearchNetworkValidationIssue[];
};

const CONNECTION_TYPES = new Set<string>(RESEARCH_CONNECTION_TYPES);

function isValidConnectionType(value: string): value is ResearchConnectionType {
  return CONNECTION_TYPES.has(value);
}

function isValidStatus(value: string): value is ResearchNetworkNodeStatus {
  return value in RESEARCH_NETWORK_STATUS_LABELS;
}

/** Validate a research network snapshot. */
export function validateResearchNetwork(network: ResearchNetwork): ResearchNetworkValidationReport {
  const issues: ResearchNetworkValidationIssue[] = [];
  const seenNodeIds = new Set<string>();
  const seenConnectionIds = new Set<string>();

  for (const node of network.nodes) {
    if (seenNodeIds.has(node.nodeId)) {
      issues.push({
        code: "duplicate_node_id",
        message: `Duplicate nodeId "${node.nodeId}".`,
        nodeId: node.nodeId,
      });
    }
    seenNodeIds.add(node.nodeId);

    if (!getResearchTopicById(node.topicId)) {
      issues.push({
        code: "unknown_topic",
        message: `Unknown topicId "${node.topicId}".`,
        nodeId: node.nodeId,
      });
    }

    if (!isValidStatus(node.status)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid node status "${node.status}".`,
        nodeId: node.nodeId,
      });
    }

    if (Number.isNaN(node.x) || Number.isNaN(node.y)) {
      issues.push({
        code: "missing_position",
        message: `Node "${node.nodeId}" has invalid coordinates.`,
        nodeId: node.nodeId,
      });
    }
  }

  for (const connection of network.connections) {
    if (seenConnectionIds.has(connection.connectionId)) {
      issues.push({
        code: "duplicate_connection_id",
        message: `Duplicate connectionId "${connection.connectionId}".`,
        connectionId: connection.connectionId,
      });
    }
    seenConnectionIds.add(connection.connectionId);

    if (connection.sourceTopicId === connection.targetTopicId) {
      issues.push({
        code: "self_connection",
        message: `Connection "${connection.connectionId}" references the same topic.`,
        connectionId: connection.connectionId,
      });
    }

    if (
      !getResearchTopicById(connection.sourceTopicId) ||
      !getResearchTopicById(connection.targetTopicId)
    ) {
      issues.push({
        code: "connection_topic_missing",
        message: `Connection "${connection.connectionId}" references an unknown topic.`,
        connectionId: connection.connectionId,
      });
    }

    for (const type of connection.connectionTypes) {
      if (!isValidConnectionType(type)) {
        issues.push({
          code: "invalid_connection_type",
          message: `Invalid connection type "${type}" on "${connection.connectionId}".`,
          connectionId: connection.connectionId,
        });
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
