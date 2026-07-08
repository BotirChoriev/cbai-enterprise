import type {
  ResearchNetwork,
  ResearchNetworkConnection,
  ResearchNetworkNode,
} from "@/lib/research/network/network-types";
import {
  buildGlobalResearchNetwork,
  findNetworkNodeByTopicId,
  listNetworkConnectionsForTopic,
} from "@/lib/research/network/network-builder";

/** Get the global research network snapshot. */
export function getGlobalResearchNetwork(): ResearchNetwork {
  return buildGlobalResearchNetwork();
}

export { findNetworkNodeByTopicId, listNetworkConnectionsForTopic };

/** Find a connection between two topics. */
export function findNetworkConnection(
  network: ResearchNetwork,
  sourceTopicId: string,
  targetTopicId: string,
): ResearchNetworkConnection | undefined {
  const [left, right] = [sourceTopicId, targetTopicId].sort();
  return network.connections.find(
    (connection) =>
      connection.sourceTopicId === left && connection.targetTopicId === right,
  );
}

/** List all network nodes. */
export function listResearchNetworkNodes(network: ResearchNetwork): readonly ResearchNetworkNode[] {
  return network.nodes;
}
