import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import {
  buildGlobalResearchGraphPreview,
  buildResearchGraphForTopic,
  findRelatedTopicsByCatalog,
} from "@/lib/research/graph/research-graph-builder";
import type { ResearchGraph } from "@/lib/research/graph/research-graph-types";

/** Get a research graph for a topic ID. */
export function getResearchGraphForTopic(topicId: string): ResearchGraph | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildResearchGraphForTopic(topic);
}

/** Get a research graph for a topic object. */
export function getResearchGraphForTopicObject(topic: ResearchTopic): ResearchGraph {
  return buildResearchGraphForTopic(topic);
}

/** Get the global research graph preview for the home page. */
export function getGlobalResearchGraphPreview(starterTopicId?: string): ResearchGraph {
  return buildGlobalResearchGraphPreview(starterTopicId);
}

/** List related topics for graph navigation. */
export function getRelatedTopicsForGraph(topic: ResearchTopic): readonly ResearchTopic[] {
  return findRelatedTopicsByCatalog(topic);
}

/** Find a node in a graph by ID. */
export function findGraphNode(graph: ResearchGraph, nodeId: string) {
  return graph.nodes.find((node) => node.nodeId === nodeId);
}

/** Group nodes by type for layout. */
export function groupGraphNodesByType(graph: ResearchGraph) {
  return {
    topics: graph.nodes.filter((node) => node.nodeType === "research_topic"),
    domains: graph.nodes.filter((node) => node.nodeType === "domain"),
    methods: graph.nodes.filter((node) => node.nodeType === "method"),
    evidenceTypes: graph.nodes.filter((node) => node.nodeType === "evidence_type"),
    futureObjects: graph.nodes.filter((node) => node.nodeType === "future_object"),
  };
}

/** Get edges from a focus node. */
export function getEdgesFromNode(graph: ResearchGraph, nodeId: string) {
  return graph.edges.filter((edge) => edge.sourceNodeId === nodeId);
}
