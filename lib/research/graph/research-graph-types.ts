export const RESEARCH_GRAPH_NODE_TYPES = [
  "research_topic",
  "domain",
  "method",
  "evidence_type",
  "future_object",
] as const;

export type ResearchGraphNodeType = (typeof RESEARCH_GRAPH_NODE_TYPES)[number];

export const RESEARCH_GRAPH_RELATIONSHIP_TYPES = [
  "belongs_to_domain",
  "uses_method",
  "requires_evidence",
  "related_topic",
  "future_supports",
] as const;

export type ResearchGraphRelationshipType =
  (typeof RESEARCH_GRAPH_RELATIONSHIP_TYPES)[number];

export type ResearchGraphStatus = "catalog_available" | "not_connected_yet" | "future_workspace";

export type ResearchGraphNode = {
  nodeId: string;
  nodeType: ResearchGraphNodeType;
  label: string;
  description: string;
  href?: string;
  status: ResearchGraphStatus;
};

export type ResearchGraphEdge = {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: ResearchGraphRelationshipType;
  status: ResearchGraphStatus;
  label?: string;
};

export type ResearchGraph = {
  graphId: string;
  focusNodeId?: string;
  nodes: readonly ResearchGraphNode[];
  edges: readonly ResearchGraphEdge[];
  honestNotice: string;
};

export const RESEARCH_GRAPH_STATUS_LABELS: Record<ResearchGraphStatus, string> = {
  catalog_available: "Catalog available",
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const RESEARCH_GRAPH_NODE_TYPE_LABELS: Record<ResearchGraphNodeType, string> = {
  research_topic: "Research topic",
  domain: "Domain",
  method: "Method",
  evidence_type: "Evidence type",
  future_object: "Future research object",
};

export const RESEARCH_GRAPH_RELATIONSHIP_LABELS: Record<ResearchGraphRelationshipType, string> = {
  belongs_to_domain: "Belongs to domain",
  uses_method: "Uses method",
  requires_evidence: "Requires evidence",
  related_topic: "Related topic",
  future_supports: "Future supports",
};

export const RESEARCH_GRAPH_HONEST_NOTICE =
  "This graph uses catalog connections only. It does not prove scientific relationships.";

export const RESEARCH_GRAPH_RELATED_TOPIC_LABEL = "Related by shared catalog metadata.";

export const RESEARCH_GRAPH_VERSION = "1.0.0";
