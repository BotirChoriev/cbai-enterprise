import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_DOMAINS,
  RESEARCH_TOPICS,
} from "@/lib/research/research-topics";
import { buildCrossTopicDiscovery } from "@/lib/research/discovery/discovery-builder";
import type { DiscoveryRelationshipReason } from "@/lib/research/discovery/discovery-types";
import type {
  ResearchConnectionType,
  ResearchNetwork,
  ResearchNetworkConnection,
  ResearchNetworkNode,
  ResearchNetworkNodeStatus,
} from "@/lib/research/network/network-types";
import {
  RESEARCH_NETWORK_ID,
  RESEARCH_NETWORK_MODEL_VERSION,
  RESEARCH_NETWORK_VIEWBOX,
} from "@/lib/research/network/network-types";

function nodeIdFor(topicId: string): string {
  return `network-node:${topicId}`;
}

function connectionIdFor(sourceTopicId: string, targetTopicId: string): string {
  const [left, right] = [sourceTopicId, targetTopicId].sort();
  return `connection:${left}:${right}`;
}

function mapTopicStatus(topic: ResearchTopic): ResearchNetworkNodeStatus {
  switch (topic.status) {
    case "catalog_available":
      return "catalog_available";
    case "workspace_not_available":
      return "future_workspace";
    case "evidence_not_connected":
      return "not_connected_yet";
  }
}

function mapDiscoveryReasonToConnectionType(
  reason: DiscoveryRelationshipReason,
): ResearchConnectionType | undefined {
  switch (reason) {
    case "same_domain":
      return "shared_domain";
    case "shared_method":
      return "shared_method";
    case "shared_evidence_type":
      return "shared_evidence";
    case "shared_future_object":
      return "future_workspace";
  }
}

function computeNodePositions(topics: readonly ResearchTopic[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const { width, height } = RESEARCH_NETWORK_VIEWBOX;
  const centerX = width / 2;
  const centerY = height / 2;
  const clusterRadius = Math.min(width, height) * 0.32;

  const topicsByDomain = new Map<string, ResearchTopic[]>();
  for (const topic of topics) {
    const group = topicsByDomain.get(topic.domainId) ?? [];
    group.push(topic);
    topicsByDomain.set(topic.domainId, group);
  }

  RESEARCH_DOMAINS.forEach((domain, domainIndex) => {
    const domainTopics = topicsByDomain.get(domain.domainId) ?? [];
    if (domainTopics.length === 0) {
      return;
    }

    const domainAngle = (domainIndex / RESEARCH_DOMAINS.length) * Math.PI * 2 - Math.PI / 2;
    const clusterX = centerX + Math.cos(domainAngle) * clusterRadius;
    const clusterY = centerY + Math.sin(domainAngle) * clusterRadius;
    const localRadius = 28 + domainTopics.length * 4;

    domainTopics.forEach((topic, topicIndex) => {
      const localAngle = (topicIndex / domainTopics.length) * Math.PI * 2;
      positions.set(topic.topicId, {
        x: clusterX + Math.cos(localAngle) * localRadius,
        y: clusterY + Math.sin(localAngle) * localRadius,
      });
    });
  });

  return positions;
}

function buildNetworkNode(
  topic: ResearchTopic,
  position: { x: number; y: number },
  relatedTopics: readonly string[],
): ResearchNetworkNode {
  return {
    nodeId: nodeIdFor(topic.topicId),
    topicId: topic.topicId,
    topicName: topic.topicName,
    domain: topic.domain,
    domainId: topic.domainId,
    relatedTopics,
    sharedMethods: topic.relatedMethods,
    sharedEvidence: topic.relatedEvidenceTypes,
    status: mapTopicStatus(topic),
    x: position.x,
    y: position.y,
  };
}

function buildNetworkConnections(topics: readonly ResearchTopic[]): ResearchNetworkConnection[] {
  const connectionMap = new Map<string, ResearchNetworkConnection>();

  for (const source of topics) {
    for (const target of topics) {
      if (source.topicId >= target.topicId) {
        continue;
      }

      const discovery = buildCrossTopicDiscovery(source, target);
      if (!discovery) {
        continue;
      }

      const connectionTypes = discovery.relationshipReasons
        .map(mapDiscoveryReasonToConnectionType)
        .filter((type): type is ResearchConnectionType => type !== undefined);

      if (connectionTypes.length === 0) {
        continue;
      }

      const id = connectionIdFor(source.topicId, target.topicId);
      connectionMap.set(id, {
        connectionId: id,
        sourceTopicId: source.topicId,
        targetTopicId: target.topicId,
        connectionTypes,
        status: "catalog_available",
      });
    }
  }

  return [...connectionMap.values()].sort((left, right) =>
    left.connectionId.localeCompare(right.connectionId),
  );
}

/** Build the global research network from catalog topics. */
export function buildGlobalResearchNetwork(): ResearchNetwork {
  const positions = computeNodePositions(RESEARCH_TOPICS);
  const connections = buildNetworkConnections(RESEARCH_TOPICS);

  const relatedByTopic = new Map<string, string[]>();
  for (const connection of connections) {
    const sourceRelated = relatedByTopic.get(connection.sourceTopicId) ?? [];
    sourceRelated.push(connection.targetTopicId);
    relatedByTopic.set(connection.sourceTopicId, sourceRelated);

    const targetRelated = relatedByTopic.get(connection.targetTopicId) ?? [];
    targetRelated.push(connection.sourceTopicId);
    relatedByTopic.set(connection.targetTopicId, targetRelated);
  }

  const nodes = RESEARCH_TOPICS.map((topic) => {
    const position = positions.get(topic.topicId) ?? {
      x: RESEARCH_NETWORK_VIEWBOX.width / 2,
      y: RESEARCH_NETWORK_VIEWBOX.height / 2,
    };
    return buildNetworkNode(topic, position, relatedByTopic.get(topic.topicId) ?? []);
  });

  return {
    networkId: RESEARCH_NETWORK_ID,
    nodes,
    connections,
    topicCount: nodes.length,
    connectionCount: connections.length,
    humanReviewRequired: true,
    version: RESEARCH_NETWORK_MODEL_VERSION,
  };
}

/** Find a network node by topic ID. */
export function findNetworkNodeByTopicId(
  network: ResearchNetwork,
  topicId: string,
): ResearchNetworkNode | undefined {
  return network.nodes.find((node) => node.topicId === topicId);
}

/** List connections for a topic. */
export function listNetworkConnectionsForTopic(
  network: ResearchNetwork,
  topicId: string,
): readonly ResearchNetworkConnection[] {
  return network.connections.filter(
    (connection) =>
      connection.sourceTopicId === topicId || connection.targetTopicId === topicId,
  );
}
