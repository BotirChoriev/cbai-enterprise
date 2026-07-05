import {
  searchEntities,
  DEFAULT_SEARCH_FILTERS,
  type SearchResult,
} from "@/lib/global-search";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import {
  graphNodeId,
  type GraphNodeType,
  type KnowledgeGraph,
} from "@/lib/graph/graph.types";
import { EDGE_TYPE_MAP } from "@/lib/graph/graph.mock";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import type { Entity } from "@/lib/entity/entity.types";
import {
  REASONING_PIPELINE_STAGES,
  ANSWER_TEMPLATES,
  DEFAULT_ANSWER_TEMPLATE,
  type AnswerTemplate,
} from "@/lib/reasoning/reasoning.mock";
import type {
  ReasoningResult,
  ReasoningStage,
  ReasoningStageId,
  EvidenceItem,
  DecisionNode,
  ConfidenceFactor,
  ReasoningSummary,
  GraphConnectionRef,
} from "@/lib/reasoning/reasoning.types";
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function entityNodeId(entity: Entity): string {
  return graphNodeId(entity.type as GraphNodeType, entity.id);
}

function resolveGraphContext(
  entities: Entity[],
  graph: KnowledgeGraph,
): { connections: GraphConnectionRef[]; graphNodeCount: number } {
  const seedIds = new Set(entities.map(entityNodeId));
  const connections: GraphConnectionRef[] = [];
  const touchedNodes = new Set<string>();

  for (const edge of graph.edges) {
    if (seedIds.has(edge.source) || seedIds.has(edge.target)) {
      touchedNodes.add(edge.source);
      touchedNodes.add(edge.target);

      const sourceNode = graph.nodes.find((n) => n.id === edge.source);
      const targetNode = graph.nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        connections.push({
          fromEntity: sourceNode.label,
          toEntity: targetNode.label,
          edgeType: edge.type,
          label: EDGE_TYPE_MAP[edge.type].label,
        });
      }
    }
  }

  return {
    connections: connections.slice(0, 12),
    graphNodeCount: touchedNodes.size,
  };
}

function buildEvidence(
  searchResults: SearchResult[],
  graph: KnowledgeGraph,
  connections: GraphConnectionRef[],
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  const seen = new Set<string>();

  for (const result of searchResults.slice(0, 5)) {
    const key = `search-${result.entity.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const topReason = result.matchReasons[0];
    evidence.push({
      id: key,
      entity: result.entity,
      source: "search",
      relevance: Math.min(100, result.relevanceScore),
      excerpt: topReason
        ? `${topReason.field}: ${topReason.snippet}`
        : truncate(result.entity.overview, 120),
    });

    evidence.push({
      id: `profile-${result.entity.id}`,
      entity: result.entity,
      source: "entity-profile",
      relevance: Math.round(result.entity.scores.aiScore * 0.9),
      excerpt: truncate(result.entity.aiSummary, 140),
    });
  }

  for (const conn of connections.slice(0, 4)) {
    const fromNode = graph.nodes.find((n) => n.label === conn.fromEntity);
    const entity =
      fromNode?.entity ??
      graph.nodes.find((n) => n.label === conn.toEntity)?.entity;
    if (!entity) continue;

    const key = `graph-${conn.fromEntity}-${conn.toEntity}-${conn.edgeType}`;
    if (seen.has(key)) continue;
    seen.add(key);

    evidence.push({
      id: key,
      entity,
      source: "knowledge-graph",
      relevance: 75,
      excerpt: `${conn.fromEntity} → ${conn.toEntity} via ${conn.label} relationship`,
      relationshipLabel: conn.label,
    });
  }

  return evidence.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
}

function classifyQuery(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("compare") || q.includes("versus") || q.includes(" vs ")) {
    return "comparative";
  }
  if (
    q.includes("partner") ||
    q.includes("research") ||
    q.includes("collaborat")
  ) {
    return "partnership";
  }
  if (q.includes("competitor") || q.includes("rival")) {
    return "competitive";
  }
  if (
    q.includes("country") ||
    q.includes("investment") ||
    q.includes("economy")
  ) {
    return "investment";
  }
  if (
    q.includes("university") ||
    q.includes("universities") ||
    q.includes("academic")
  ) {
    return "academic";
  }
  return "general";
}

function pickAnswerTemplate(question: string): AnswerTemplate {
  const q = question.toLowerCase();
  for (const template of ANSWER_TEMPLATES) {
    if (template.keywords.some((kw) => q.includes(kw))) {
      return template;
    }
  }
  return DEFAULT_ANSWER_TEMPLATE;
}

function buildDecisionTree(
  question: string,
  queryClass: string,
  topEntities: Entity[],
  evidenceCount: number,
): DecisionNode {
  const primary = topEntities[0];
  const secondary = topEntities[1];

  return {
    id: "root",
    label: "Query Classification",
    description: `Classified as "${queryClass}" analysis`,
    outcome: "selected",
    children: [
      {
        id: "entity-focus",
        label: "Entity Focus",
        description: primary
          ? `Primary focus: ${primary.name} (${getEntityTypeLabel(primary.type)})`
          : "No primary entity identified",
        outcome: primary ? "selected" : "rejected",
        children: [
          {
            id: "evidence-gate",
            label: "Evidence Threshold",
            description: `${evidenceCount} evidence items collected (minimum: 3)`,
            outcome: evidenceCount >= 3 ? "selected" : "neutral",
            children: [
              {
                id: "graph-validation",
                label: "Graph Validation",
                description: secondary
                  ? `Cross-validated with ${secondary.name} via knowledge graph`
                  : "Single-entity graph path validated",
                outcome: "selected",
                children: [
                  {
                    id: "final-decision",
                    label: "Final Decision",
                    description: primary
                      ? `Recommend ${primary.name} as primary answer for: "${truncate(question, 60)}"`
                      : "Insufficient data for confident recommendation",
                    outcome: primary ? "selected" : "rejected",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function computeConfidence(
  searchResults: SearchResult[],
  evidence: EvidenceItem[],
  connections: GraphConnectionRef[],
): { confidence: number; factors: ConfidenceFactor[] } {
  const evidenceScore = Math.min(100, evidence.length * 12);
  const avgRelevance =
    evidence.length > 0
      ? evidence.reduce((s, e) => s + e.relevance, 0) / evidence.length
      : 0;
  const graphScore = Math.min(100, connections.length * 15);
  const entityScore =
    searchResults.length > 0
      ? searchResults
          .slice(0, 3)
          .reduce((s, r) => s + r.entity.scores.aiScore, 0) /
        Math.min(3, searchResults.length)
      : 0;

  const factors: ConfidenceFactor[] = [
    {
      id: "evidence-volume",
      label: "Evidence Volume",
      weight: 0.25,
      score: evidenceScore,
      detail: `${evidence.length} evidence items collected from search, graph, and profiles`,
    },
    {
      id: "relevance",
      label: "Source Relevance",
      weight: 0.25,
      score: Math.round(avgRelevance),
      detail: `Average relevance score ${avgRelevance.toFixed(0)}/100 across evidence`,
    },
    {
      id: "graph-density",
      label: "Graph Connectivity",
      weight: 0.25,
      score: graphScore,
      detail: `${connections.length} relationship paths validated in knowledge graph`,
    },
    {
      id: "entity-signals",
      label: "Entity Signal Quality",
      weight: 0.25,
      score: Math.round(entityScore),
      detail: `Top entity AI readiness average ${entityScore.toFixed(0)}/100`,
    },
  ];

  const confidence = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0),
  );

  return { confidence: Math.min(98, Math.max(42, confidence)), factors };
}

function buildSummary(
  topEntities: Entity[],
  connections: GraphConnectionRef[],
  confidence: number,
  queryClass: string,
): ReasoningSummary {
  const primary = topEntities[0];
  const types = [...new Set(topEntities.map((e) => getEntityTypeLabel(e.type)))];

  const keyFindings: string[] = [];
  if (primary) {
    keyFindings.push(
      `${primary.name} ranked highest with AI score ${primary.scores.aiScore}/100`,
    );
  }
  if (topEntities.length > 1) {
    keyFindings.push(
      `${topEntities.length} entities matched across ${types.join(", ")} domains`,
    );
  }
  if (connections.length > 0) {
    keyFindings.push(
      `${connections.length} knowledge graph relationships support the conclusion`,
    );
  }
  keyFindings.push(`Query classified as ${queryClass} analysis pattern`);

  return {
    headline: primary
      ? `${primary.name} — ${confidence}% confidence recommendation`
      : `Analysis complete — ${confidence}% confidence`,
    keyFindings,
    caveats: [
      "Simulated reasoning — no live LLM or backend API invoked",
      "Confidence reflects evidence quality, not predictive certainty",
      "Graph coverage limited to Countries, Companies, and Universities",
    ],
    recommendedActions: primary
      ? [
          `Open ${primary.name} in ${getEntityTypeLabel(primary.type)} module`,
          "Explore relationships in Knowledge Graph",
          "Run comparative analysis in Global Search",
          "Export findings for executive briefing",
        ]
      : [
          "Refine query with specific entity names",
          "Broaden search in Global Search",
          "Explore Knowledge Graph manually",
        ],
  };
}

function buildFinalAnswer(
  question: string,
  topEntities: Entity[],
  template: AnswerTemplate,
): string {
  if (topEntities.length === 0) {
    return `Unable to derive a confident answer for "${question}". No matching entities were found in the CBAI intelligence index. Try refining your query with specific country, company, or university names.`;
  }

  const names =
    topEntities.length >= 2
      ? `${topEntities[0].name} and ${topEntities[1].name}`
      : topEntities[0].name;

  return `${template.intro} ${names} ${template.conclusion}`;
}

function buildStageOutputs(
  question: string,
  searchCount: number,
  graphNodeCount: number,
  evidenceCount: number,
  confidence: number,
  finalAnswer: string,
): Record<ReasoningStageId, string> {
  return {
    question: `Parsed query: "${truncate(question, 80)}"`,
    search: `Retrieved ${searchCount} entities from global search index`,
    "knowledge-graph": `Traversed ${graphNodeCount} nodes in knowledge graph`,
    evidence: `Collected ${evidenceCount} ranked evidence items`,
    reasoning: "Applied multi-factor entity signal analysis",
    decision: "Decision tree evaluated — optimal path selected",
    confidence: `Confidence score computed: ${confidence}%`,
    "final-answer": truncate(finalAnswer, 100),
  };
}

function buildStages(
  outputs: Record<ReasoningStageId, string>,
): ReasoningStage[] {
  return REASONING_PIPELINE_STAGES.map((stage) => ({
    id: stage.id,
    label: stage.label,
    description: stage.description,
    status: "complete" as const,
    output: outputs[stage.id],
  }));
}

/** Execute the full mock reasoning pipeline synchronously */
export function executeReasoning(question: string): ReasoningResult {
  const trimmed = question.trim();
  if (!trimmed) {
    return emptyReasoningResult("");
  }

  const graph = buildKnowledgeGraph();
  const searchResults = searchEntities(trimmed, DEFAULT_SEARCH_FILTERS);
  const sourceEntities = searchResults.slice(0, 5).map((r) => r.entity);

  const { connections, graphNodeCount } = resolveGraphContext(
    sourceEntities,
    graph,
  );
  const evidence = buildEvidence(searchResults, graph, connections);
  const queryClass = classifyQuery(trimmed);
  const template = pickAnswerTemplate(trimmed);
  const { confidence, factors } = computeConfidence(
    searchResults,
    evidence,
    connections,
  );
  const decisionTree = buildDecisionTree(
    trimmed,
    queryClass,
    sourceEntities,
    evidence.length,
  );
  const summary = buildSummary(
    sourceEntities,
    connections,
    confidence,
    queryClass,
  );
  const finalAnswer = buildFinalAnswer(trimmed, sourceEntities, template);

  const outputs = buildStageOutputs(
    trimmed,
    searchResults.length,
    graphNodeCount,
    evidence.length,
    confidence,
    finalAnswer,
  );

  return {
    question: trimmed,
    stages: buildStages(outputs),
    evidence,
    decisionTree,
    confidence,
    confidenceFactors: factors,
    summary,
    finalAnswer,
    sourceEntities,
    graphConnections: connections,
    searchResultCount: searchResults.length,
    graphNodeCount,
  };
}

function emptyReasoningResult(question: string): ReasoningResult {
  const outputs = buildStageOutputs(
    question,
    0,
    0,
    0,
    0,
    "No answer generated.",
  );
  return {
    question,
    stages: buildStages(outputs),
    evidence: [],
    decisionTree: {
      id: "root",
      label: "No Query",
      description: "Awaiting intelligence question",
      outcome: "neutral",
    },
    confidence: 0,
    confidenceFactors: [],
    summary: {
      headline: "Awaiting query",
      keyFindings: [],
      caveats: [],
      recommendedActions: ["Enter a question to begin reasoning"],
    },
    finalAnswer: "",
    sourceEntities: [],
    graphConnections: [],
    searchResultCount: 0,
    graphNodeCount: 0,
  };
}

/** Apply stage status for animated pipeline display */
export function getStagesWithStatus(
  result: ReasoningResult,
  activeStageIndex: number,
  isComplete: boolean,
): ReasoningStage[] {
  return result.stages.map((stage, index) => {
    let status: ReasoningStage["status"] = "pending";
    if (isComplete || index < activeStageIndex) {
      status = "complete";
    } else if (index === activeStageIndex) {
      status = "active";
    }
    return { ...stage, status };
  });
}
