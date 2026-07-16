/**
 * Mission-aware graph filtering — real registries and project links only.
 */

import type { KnowledgeGraph, GraphNode, GraphEdge } from "@/lib/graph/graph.types";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjectEntities, loadProjectEvidence, loadProjectQuestions } from "@/lib/project/project-store";
import { graphNodeId } from "@/lib/graph/graph.types";

export type GraphMissionFocusMode = "mission" | "evidence" | "all";

export type GraphMissionAnalysis = {
  readonly mode: GraphMissionFocusMode;
  readonly focusedNodeIds: ReadonlySet<string>;
  readonly connectedEntities: readonly GraphNode[];
  readonly supportingEvidenceCount: number;
  readonly missingEvidenceLabels: readonly string[];
  readonly unresolvedQuestions: readonly string[];
  readonly impactConcern: string | null;
  readonly limitation: string;
};

function entityToNodeId(kind: string, id: string): string | null {
  if (kind === "country") return graphNodeId("country", id);
  if (kind === "company") return graphNodeId("company", id);
  if (kind === "university") return graphNodeId("university", id);
  return null;
}

export function analyzeGraphForMission(
  graph: KnowledgeGraph,
  mission: Mission | null,
  mode: GraphMissionFocusMode = "mission",
): GraphMissionAnalysis {
  if (!mission?.projectId) {
    return {
      mode,
      focusedNodeIds: new Set(),
      connectedEntities: [],
      supportingEvidenceCount: 0,
      missingEvidenceLabels: mission?.evidenceMissing ? [mission.evidenceMissing] : [],
      unresolvedQuestions: [],
      impactConcern: null,
      limitation: "Link a project to this mission to focus the intelligence network.",
    };
  }

  const entities = loadProjectEntities(mission.projectId);
  const evidence = loadProjectEvidence(mission.projectId);
  const questions = loadProjectQuestions(mission.projectId).filter((q) => !q.resolved);

  const focusedNodeIds = new Set<string>();
  for (const entity of entities) {
    const nodeId = entityToNodeId(entity.kind, entity.id);
    if (nodeId) focusedNodeIds.add(nodeId);
  }

  if (mode === "all" || focusedNodeIds.size === 0) {
    return {
      mode: "all",
      focusedNodeIds,
      connectedEntities: graph.nodes.filter((n) => focusedNodeIds.has(n.id)),
      supportingEvidenceCount: evidence.length,
      missingEvidenceLabels: mission.evidenceMissing ? [mission.evidenceMissing] : [],
      unresolvedQuestions: questions.map((q) => q.question),
      impactConcern: mission.whoCouldBeHarmed || null,
      limitation: focusedNodeIds.size === 0 ? "No catalog entities linked — link entities on the project." : "",
    };
  }

  const connectedNodeIds = new Set(focusedNodeIds);
  for (const edge of graph.edges) {
    if (focusedNodeIds.has(edge.source)) connectedNodeIds.add(edge.target);
    if (focusedNodeIds.has(edge.target)) connectedNodeIds.add(edge.source);
  }

  const connectedEntities = graph.nodes.filter((n) => connectedNodeIds.has(n.id));

  return {
    mode,
    focusedNodeIds: connectedNodeIds,
    connectedEntities,
    supportingEvidenceCount: evidence.length,
    missingEvidenceLabels: mission.evidenceMissing ? [mission.evidenceMissing] : [],
    unresolvedQuestions: questions.map((q) => q.question),
    impactConcern: mission.whoCouldBeHarmed || null,
    limitation:
      evidence.length === 0
        ? "No evidence references linked — graph shows entity relationships only."
        : "Edge evidence status reflects registry metadata — live verification not connected.",
  };
}

export function filterGraphByMissionFocus(
  graph: KnowledgeGraph,
  analysis: GraphMissionAnalysis,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (analysis.mode === "all" || analysis.focusedNodeIds.size === 0) {
    return { nodes: graph.nodes, edges: graph.edges };
  }
  const nodes = graph.nodes.filter((n) => analysis.focusedNodeIds.has(n.id));
  const nodeSet = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target));
  return { nodes, edges };
}
