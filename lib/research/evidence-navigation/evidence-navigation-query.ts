import { buildEvidenceNavigationPathForTopic } from "@/lib/research/evidence-navigation/evidence-navigation-builder";
import type {
  EvidenceNavigationEdge,
  EvidenceNavigationNode,
  EvidenceNavigationPath,
} from "@/lib/research/evidence-navigation/evidence-navigation-model";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type EvidenceNavigationNextStep = {
  edge: EvidenceNavigationEdge;
  node: EvidenceNavigationNode;
};

/** Build catalog navigation paths for a topic ID. */
export function buildEvidenceNavigationForTopic(
  topicId: string,
): EvidenceNavigationPath | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildEvidenceNavigationPathForTopic(topic);
}

/** Find a navigation node within a path. */
export function findNavigationNode(
  path: EvidenceNavigationPath,
  nodeId: string,
): EvidenceNavigationNode | undefined {
  return path.nodes.find((node) => node.nodeId === nodeId);
}

/** List all navigation edges in a path. */
export function listNavigationEdges(
  path: EvidenceNavigationPath,
): readonly EvidenceNavigationEdge[] {
  return path.edges;
}

/** List outgoing navigation steps from a node. */
export function listNavigationNextSteps(
  path: EvidenceNavigationPath,
  nodeId: string,
): readonly EvidenceNavigationNextStep[] {
  const nodeById = new Map(path.nodes.map((node) => [node.nodeId, node]));

  return path.edges
    .filter((edge) => edge.sourceNodeId === nodeId)
    .flatMap((edge) => {
      const node = nodeById.get(edge.targetNodeId);
      if (!node) {
        return [];
      }
      return [{ edge, node }];
    });
}
