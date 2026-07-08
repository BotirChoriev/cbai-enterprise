import {
  RESEARCH_GRAPH_NODE_TYPES,
  RESEARCH_GRAPH_RELATIONSHIP_TYPES,
  RESEARCH_GRAPH_STATUS_LABELS,
  type ResearchGraph,
  type ResearchGraphNodeType,
  type ResearchGraphRelationshipType,
  type ResearchGraphStatus,
} from "@/lib/research/graph/research-graph-types";

export type ResearchGraphValidationIssue = {
  code:
    | "duplicate_node_id"
    | "duplicate_edge_id"
    | "broken_edge_source"
    | "broken_edge_target"
    | "unknown_node_type"
    | "unknown_relationship_type"
    | "invalid_status"
    | "missing_focus_node";
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type ResearchGraphValidationReport = {
  valid: boolean;
  issues: ResearchGraphValidationIssue[];
};

const NODE_TYPES = new Set<string>(RESEARCH_GRAPH_NODE_TYPES);
const RELATIONSHIP_TYPES = new Set<string>(RESEARCH_GRAPH_RELATIONSHIP_TYPES);

function isKnownNodeType(value: string): value is ResearchGraphNodeType {
  return NODE_TYPES.has(value);
}

function isKnownRelationshipType(value: string): value is ResearchGraphRelationshipType {
  return RELATIONSHIP_TYPES.has(value);
}

function isValidStatus(value: string): value is ResearchGraphStatus {
  return value in RESEARCH_GRAPH_STATUS_LABELS;
}

/** Validate a research graph snapshot. */
export function validateResearchGraph(graph: ResearchGraph): ResearchGraphValidationReport {
  const issues: ResearchGraphValidationIssue[] = [];
  const seenNodeIds = new Set<string>();
  const seenEdgeIds = new Set<string>();
  const knownNodeIds = new Set(graph.nodes.map((node) => node.nodeId));

  for (const node of graph.nodes) {
    if (seenNodeIds.has(node.nodeId)) {
      issues.push({
        code: "duplicate_node_id",
        message: `Duplicate nodeId "${node.nodeId}".`,
        nodeId: node.nodeId,
      });
    }
    seenNodeIds.add(node.nodeId);

    if (!isKnownNodeType(node.nodeType)) {
      issues.push({
        code: "unknown_node_type",
        message: `Unknown nodeType "${node.nodeType}" on "${node.nodeId}".`,
        nodeId: node.nodeId,
      });
    }

    if (!isValidStatus(node.status)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid status "${node.status}" on node "${node.nodeId}".`,
        nodeId: node.nodeId,
      });
    }
  }

  for (const edge of graph.edges) {
    if (seenEdgeIds.has(edge.edgeId)) {
      issues.push({
        code: "duplicate_edge_id",
        message: `Duplicate edgeId "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }
    seenEdgeIds.add(edge.edgeId);

    if (!knownNodeIds.has(edge.sourceNodeId)) {
      issues.push({
        code: "broken_edge_source",
        message: `Broken sourceNodeId "${edge.sourceNodeId}" on edge "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }

    if (!knownNodeIds.has(edge.targetNodeId)) {
      issues.push({
        code: "broken_edge_target",
        message: `Broken targetNodeId "${edge.targetNodeId}" on edge "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }

    if (!isKnownRelationshipType(edge.relationshipType)) {
      issues.push({
        code: "unknown_relationship_type",
        message: `Unknown relationshipType "${edge.relationshipType}" on edge "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }

    if (!isValidStatus(edge.status)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid status "${edge.status}" on edge "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }
  }

  if (graph.focusNodeId && !knownNodeIds.has(graph.focusNodeId)) {
    issues.push({
      code: "missing_focus_node",
      message: `focusNodeId "${graph.focusNodeId}" is not in the graph.`,
      nodeId: graph.focusNodeId,
    });
  }

  return { valid: issues.length === 0, issues };
}
