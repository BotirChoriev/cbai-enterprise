import {
  RESEARCH_DOMAINS,
  RESEARCH_TOPIC_FUTURE_SUPPORTS,
  RESEARCH_TOPICS,
  getResearchTopicPath,
  type ResearchTopic,
  type ResearchTopicStatus,
} from "@/lib/research/research-topics";
import type {
  ResearchGraph,
  ResearchGraphEdge,
  ResearchGraphNode,
  ResearchGraphStatus,
} from "@/lib/research/graph/research-graph-types";
import {
  RESEARCH_GRAPH_HONEST_NOTICE,
  RESEARCH_GRAPH_RELATED_TOPIC_LABEL,
} from "@/lib/research/graph/research-graph-types";
import { validateResearchGraph } from "@/lib/research/graph/research-graph-validation";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function topicNodeId(topicId: string): string {
  return `topic:${topicId}`;
}

function domainNodeId(domainId: string): string {
  return `domain:${domainId}`;
}

function methodNodeId(method: string): string {
  return `method:${slugify(method)}`;
}

function evidenceNodeId(evidenceType: string): string {
  return `evidence:${slugify(evidenceType)}`;
}

function futureNodeId(label: string): string {
  return `future:${slugify(label)}`;
}

function mapTopicStatus(status: ResearchTopicStatus): ResearchGraphStatus {
  switch (status) {
    case "catalog_available":
      return "catalog_available";
    case "workspace_not_available":
      return "future_workspace";
    case "evidence_not_connected":
      return "not_connected_yet";
  }
}

function sharedMetadataReason(source: ResearchTopic, related: ResearchTopic): string {
  const sharedMethods = source.relatedMethods.filter((method) =>
    related.relatedMethods.includes(method),
  );
  const sharedEvidence = source.relatedEvidenceTypes.filter((evidence) =>
    related.relatedEvidenceTypes.includes(evidence),
  );

  if (sharedMethods.length > 0 && sharedEvidence.length > 0) {
    return `${RESEARCH_GRAPH_RELATED_TOPIC_LABEL} Shared methods and evidence types.`;
  }
  if (sharedMethods.length > 0) {
    return `${RESEARCH_GRAPH_RELATED_TOPIC_LABEL} Shared methods.`;
  }
  if (sharedEvidence.length > 0) {
    return `${RESEARCH_GRAPH_RELATED_TOPIC_LABEL} Shared evidence types.`;
  }
  if (source.domainId === related.domainId) {
    return `${RESEARCH_GRAPH_RELATED_TOPIC_LABEL} Same domain.`;
  }
  return RESEARCH_GRAPH_RELATED_TOPIC_LABEL;
}

export function findRelatedTopicsByCatalog(
  topic: ResearchTopic,
  limit = 4,
): readonly ResearchTopic[] {
  const related = RESEARCH_TOPICS.filter(
    (candidate) =>
      candidate.topicId !== topic.topicId &&
      (candidate.domainId === topic.domainId ||
        candidate.relatedMethods.some((method) => topic.relatedMethods.includes(method)) ||
        candidate.relatedEvidenceTypes.some((evidence) =>
          topic.relatedEvidenceTypes.includes(evidence),
        )),
  );

  return related.slice(0, limit);
}

function buildTopicGraphNodesAndEdges(topic: ResearchTopic): {
  nodes: ResearchGraphNode[];
  edges: ResearchGraphEdge[];
} {
  const nodes: ResearchGraphNode[] = [];
  const edges: ResearchGraphEdge[] = [];
  const focusId = topicNodeId(topic.topicId);

  nodes.push({
    nodeId: focusId,
    nodeType: "research_topic",
    label: topic.topicName,
    description: topic.description,
    href: getResearchTopicPath(topic.topicId),
    status: mapTopicStatus(topic.status),
  });

  const domain = RESEARCH_DOMAINS.find((entry) => entry.domainId === topic.domainId);
  if (domain) {
    const domainId = domainNodeId(domain.domainId);
    nodes.push({
      nodeId: domainId,
      nodeType: "domain",
      label: domain.domainName,
      description: `Research domain for ${topic.topicName}.`,
      status: "catalog_available",
    });
    edges.push({
      edgeId: `edge:${focusId}:${domainId}`,
      sourceNodeId: focusId,
      targetNodeId: domainId,
      relationshipType: "belongs_to_domain",
      status: "catalog_available",
    });
  }

  for (const method of topic.relatedMethods) {
    const methodId = methodNodeId(method);
    if (!nodes.some((node) => node.nodeId === methodId)) {
      nodes.push({
        nodeId: methodId,
        nodeType: "method",
        label: method,
        description: "Method listed in the research topic catalog.",
        status: "catalog_available",
      });
    }
    edges.push({
      edgeId: `edge:${focusId}:${methodId}:method`,
      sourceNodeId: focusId,
      targetNodeId: methodId,
      relationshipType: "uses_method",
      status: "catalog_available",
    });
  }

  for (const evidenceType of topic.relatedEvidenceTypes) {
    const evidenceId = evidenceNodeId(evidenceType);
    if (!nodes.some((node) => node.nodeId === evidenceId)) {
      nodes.push({
        nodeId: evidenceId,
        nodeType: "evidence_type",
        label: evidenceType,
        description: "Evidence type listed in the catalog — not connected yet.",
        status: "not_connected_yet",
      });
    }
    edges.push({
      edgeId: `edge:${focusId}:${evidenceId}:evidence`,
      sourceNodeId: focusId,
      targetNodeId: evidenceId,
      relationshipType: "requires_evidence",
      status: "not_connected_yet",
    });
  }

  for (const relatedTopic of findRelatedTopicsByCatalog(topic)) {
    const relatedId = topicNodeId(relatedTopic.topicId);
    if (!nodes.some((node) => node.nodeId === relatedId)) {
      nodes.push({
        nodeId: relatedId,
        nodeType: "research_topic",
        label: relatedTopic.topicName,
        description: sharedMetadataReason(topic, relatedTopic),
        href: getResearchTopicPath(relatedTopic.topicId),
        status: mapTopicStatus(relatedTopic.status),
      });
    }
    edges.push({
      edgeId: `edge:${focusId}:${relatedId}:related`,
      sourceNodeId: focusId,
      targetNodeId: relatedId,
      relationshipType: "related_topic",
      status: "catalog_available",
      label: RESEARCH_GRAPH_RELATED_TOPIC_LABEL,
    });
  }

  for (const futureLabel of RESEARCH_TOPIC_FUTURE_SUPPORTS) {
    const futureId = futureNodeId(futureLabel);
    if (!nodes.some((node) => node.nodeId === futureId)) {
      nodes.push({
        nodeId: futureId,
        nodeType: "future_object",
        label: futureLabel,
        description: "Future research object — not active today.",
        status: "future_workspace",
      });
    }
    edges.push({
      edgeId: `edge:${focusId}:${futureId}:future`,
      sourceNodeId: focusId,
      targetNodeId: futureId,
      relationshipType: "future_supports",
      status: "future_workspace",
    });
  }

  return { nodes, edges };
}

/** Build a focused research graph for one topic. */
export function buildResearchGraphForTopic(topic: ResearchTopic): ResearchGraph {
  const { nodes, edges } = buildTopicGraphNodesAndEdges(topic);

  const graph: ResearchGraph = {
    graphId: `graph:topic:${topic.topicId}`,
    focusNodeId: topicNodeId(topic.topicId),
    nodes,
    edges,
    honestNotice: RESEARCH_GRAPH_HONEST_NOTICE,
  };

  const validation = validateResearchGraph(graph);
  if (!validation.valid) {
    const summary = validation.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Research graph validation failed for "${topic.topicId}": ${summary}`);
  }

  return graph;
}

/** Build a compact global preview graph using a starter topic. */
export function buildGlobalResearchGraphPreview(
  starterTopicId = "microbiology",
): ResearchGraph {
  const starter =
    RESEARCH_TOPICS.find((topic) => topic.topicId === starterTopicId) ?? RESEARCH_TOPICS[0]!;
  const graph = buildResearchGraphForTopic(starter);

  const previewNodeIds = new Set<string>([
    graph.focusNodeId!,
    ...graph.nodes
      .filter((node) =>
        ["domain", "method", "evidence_type", "future_object"].includes(node.nodeType),
      )
      .slice(0, 8)
      .map((node) => node.nodeId),
    ...graph.nodes
      .filter((node) => node.nodeType === "research_topic" && node.nodeId !== graph.focusNodeId)
      .slice(0, 2)
      .map((node) => node.nodeId),
  ]);

  const nodes = graph.nodes.filter((node) => previewNodeIds.has(node.nodeId));
  const nodeIdSet = new Set(nodes.map((node) => node.nodeId));
  const edges = graph.edges.filter(
    (edge) => nodeIdSet.has(edge.sourceNodeId) && nodeIdSet.has(edge.targetNodeId),
  );

  return {
    graphId: "graph:global-preview",
    focusNodeId: graph.focusNodeId,
    nodes,
    edges,
    honestNotice: RESEARCH_GRAPH_HONEST_NOTICE,
  };
}

/** Build a domain-level summary graph. */
export function buildDomainResearchGraph(domainId: string): ResearchGraph | undefined {
  const domain = RESEARCH_DOMAINS.find((entry) => entry.domainId === domainId);
  if (!domain) {
    return undefined;
  }

  const topics = RESEARCH_TOPICS.filter((topic) => topic.domainId === domainId).slice(0, 6);
  const nodes: ResearchGraphNode[] = [
    {
      nodeId: domainNodeId(domain.domainId),
      nodeType: "domain",
      label: domain.domainName,
      description: "Research domain from the catalog.",
      status: "catalog_available",
    },
  ];
  const edges: ResearchGraphEdge[] = [];

  for (const topic of topics) {
    const id = topicNodeId(topic.topicId);
    nodes.push({
      nodeId: id,
      nodeType: "research_topic",
      label: topic.topicName,
      description: topic.description,
      href: getResearchTopicPath(topic.topicId),
      status: mapTopicStatus(topic.status),
    });
    edges.push({
      edgeId: `edge:${id}:${domainNodeId(domain.domainId)}`,
      sourceNodeId: id,
      targetNodeId: domainNodeId(domain.domainId),
      relationshipType: "belongs_to_domain",
      status: "catalog_available",
    });
  }

  return {
    graphId: `graph:domain:${domainId}`,
    focusNodeId: domainNodeId(domain.domainId),
    nodes,
    edges,
    honestNotice: RESEARCH_GRAPH_HONEST_NOTICE,
  };
}
