import type { Entity } from "@/lib/entity/entity.types";
import type { GraphEdgeType } from "@/lib/graph/graph.types";

/** Pipeline stage identifiers — ordered execution flow */
export type ReasoningStageId =
  | "question"
  | "search"
  | "knowledge-graph"
  | "evidence"
  | "reasoning"
  | "decision"
  | "confidence"
  | "final-answer";

export type ReasoningStageStatus = "pending" | "active" | "complete";

export type ReasoningStage = {
  id: ReasoningStageId;
  label: string;
  description: string;
  status: ReasoningStageStatus;
  output?: string;
};

export type EvidenceSource = "search" | "knowledge-graph" | "entity-profile";

export type EvidenceItem = {
  id: string;
  entity: Entity;
  source: EvidenceSource;
  relevance: number;
  excerpt: string;
  relationshipLabel?: string;
};

export type DecisionOutcome = "selected" | "rejected" | "neutral";

export type DecisionNode = {
  id: string;
  label: string;
  description: string;
  outcome?: DecisionOutcome;
  children?: DecisionNode[];
};

export type ConfidenceFactor = {
  id: string;
  label: string;
  weight: number;
  score: number;
  detail: string;
};

export type GraphConnectionRef = {
  fromEntity: string;
  toEntity: string;
  edgeType: GraphEdgeType;
  label: string;
};

export type ReasoningSummary = {
  headline: string;
  keyFindings: string[];
  caveats: string[];
  recommendedActions: string[];
};

export type ReasoningResult = {
  question: string;
  stages: ReasoningStage[];
  evidence: EvidenceItem[];
  decisionTree: DecisionNode;
  confidence: number;
  confidenceFactors: ConfidenceFactor[];
  summary: ReasoningSummary;
  finalAnswer: string;
  sourceEntities: Entity[];
  graphConnections: GraphConnectionRef[];
  searchResultCount: number;
  graphNodeCount: number;
};

export type ReasoningRunStatus = "idle" | "running" | "complete";

export type ReasoningRun = {
  status: ReasoningRunStatus;
  question: string;
  activeStageIndex: number;
  result: ReasoningResult | null;
};

/** Stage order for pipeline visualization */
export const REASONING_STAGE_ORDER: ReasoningStageId[] = [
  "question",
  "search",
  "knowledge-graph",
  "evidence",
  "reasoning",
  "decision",
  "confidence",
  "final-answer",
];
