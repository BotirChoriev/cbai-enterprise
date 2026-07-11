// Universal Intelligence Orchestration shapes. IntelligenceResult is the audit record of one
// Question → Foundation → Evidence Discovery → Relationship Resolution → Reasoning → Workflow
// pipeline run — lib/orchestration/pipeline-engine.ts is the only place that constructs one.
// Distinct from IntelligenceFoundationView (EPIC-02's broader "current state of a subject" view,
// which also carries Analysis/Recommendation/Knowledge/Timeline): IntelligenceResult is not
// nested inside IntelligenceFoundationView, to avoid embedding one composed view inside another
// — they are two independently useful outputs over the same underlying domain data.

import type {
  Evidence,
  Mission,
  Question,
  Relationship,
  Subject,
} from "@/lib/foundation/foundation-model";
import type { ReasoningResult } from "@/lib/foundation/reasoning-types";
import type { Workflow } from "@/lib/foundation/workflow-types";

/** The pipeline's five real stages, in canonical order. "Question" is the input, not a stage. */
export const INTELLIGENCE_PIPELINE_STAGES = [
  "foundation",
  "evidence_discovery",
  "relationship_resolution",
  "reasoning",
  "workflow",
] as const;

export type IntelligencePipelineStage = (typeof INTELLIGENCE_PIPELINE_STAGES)[number];

export const INTELLIGENCE_PIPELINE_STAGE_LABELS: Record<IntelligencePipelineStage, string> = {
  foundation: "Foundation",
  evidence_discovery: "Evidence Discovery",
  relationship_resolution: "Relationship Resolution",
  reasoning: "Reasoning",
  workflow: "Workflow",
};

/**
 * One stage's real, honest execution record. `outputCount` is always a real count of records
 * that stage produced — never a fabricated completeness percentage or quality score.
 */
export interface IntelligencePipelineStageTrace {
  stage: IntelligencePipelineStage;
  ran: boolean;
  outputCount: number;
  note?: string;
}

/**
 * Extension points named by the mission for future Epics. Every field is `unknown | undefined`
 * — declaring the slot here lets lib/orchestration/ compose a real value in later without
 * another shape change, but nothing here is ever populated with a placeholder or fake object.
 */
export interface IntelligenceExtensionPoints {
  executiveBriefing?: unknown;
  voiceIntelligence?: unknown;
  knowledgeCollaboration?: unknown;
  missionMonitoring?: unknown;
  analytics?: unknown;
  agentInsights?: unknown;
}

/**
 * The output of one orchestration pipeline run — preserves Evidence, Relationship, Reasoning,
 * and Workflow traceability by carrying the real records each stage produced, plus a
 * stage-by-stage execution trace (`pipelineTrace`) so the whole run is auditable end to end.
 */
export interface IntelligenceResult {
  subject: Subject;
  question: Question;
  mission?: Mission;
  evidence: readonly Evidence[];
  relationships: readonly Relationship[];
  reasoning?: ReasoningResult;
  workflow?: Workflow;
  pipelineTrace: readonly IntelligencePipelineStageTrace[];
  extensions: IntelligenceExtensionPoints;
}
