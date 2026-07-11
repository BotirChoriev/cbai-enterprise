import type { Evidence, Relationship } from "@/lib/foundation/foundation-model";
import type {
  IntelligencePipelineFoundation,
  IntelligencePipelineInput,
  IntelligencePipelineProviders,
} from "@/lib/orchestration/pipeline-types";
import type {
  IntelligencePipelineStageTrace,
  IntelligenceResult,
} from "@/lib/foundation/orchestration-types";
import { buildReasoningResult } from "@/lib/reasoning/reasoning-engine";
import { createWorkflow } from "@/lib/workflow/workflow-builder";

/**
 * The universal Intelligence Orchestration Layer. Contains zero domain logic, zero React, zero
 * UI, zero fake data — it only sequences the five real stages (Foundation, Evidence Discovery,
 * Relationship Resolution, Reasoning, Workflow) and composes their real output into one
 * IntelligenceResult. Reasoning and Workflow are consumed directly from lib/reasoning/ and
 * lib/workflow/ (never re-derived); Foundation resolution, Evidence Discovery, and Relationship
 * Resolution are domain-specific and always supplied by the caller's IntelligencePipelineProviders
 * — this file never knows what a "research topic" or a "government policy" is.
 */

function buildPipelineTrace(
  evidence: readonly Evidence[],
  relationships: readonly Relationship[],
): readonly IntelligencePipelineStageTrace[] {
  return [
    { stage: "foundation", ran: true, outputCount: 1 },
    { stage: "evidence_discovery", ran: true, outputCount: evidence.length },
    { stage: "relationship_resolution", ran: true, outputCount: relationships.length },
    { stage: "reasoning", ran: true, outputCount: 1 },
    { stage: "workflow", ran: true, outputCount: 1 },
  ];
}

/**
 * Run the full Question → Foundation → Evidence Discovery → Relationship Resolution →
 * Reasoning → Workflow pipeline for one subject. Returns undefined, honestly, when Foundation
 * resolution fails — there is no subject to discover evidence, resolve relationships, reason,
 * or build a workflow for, so nothing later in the pipeline can honestly run.
 */
export function runIntelligencePipeline(
  providers: IntelligencePipelineProviders,
  input: IntelligencePipelineInput,
): IntelligenceResult | undefined {
  const resolved = providers.resolveFoundation(input);
  if (!resolved) {
    return undefined;
  }

  const foundation: IntelligencePipelineFoundation = {
    subject: resolved.subject,
    question: input.question,
    mission: resolved.mission,
  };

  const evidence = providers.discoverEvidence(foundation);
  const relationships = providers.resolveRelationships(foundation, evidence);

  const reason = providers.reason ?? buildReasoningResult;
  const reasoning = reason({
    subjectId: foundation.subject.subjectId,
    question: foundation.question,
    mission: foundation.mission,
    evidence,
    relationships,
  });

  const buildWorkflowStage = providers.buildWorkflow ?? createWorkflow;
  const workflow = buildWorkflowStage({
    workflowId: `workflow:${foundation.subject.subjectId}`,
    subjectId: foundation.subject.subjectId,
    question: foundation.question,
    mission: foundation.mission,
    evidence,
    relationships,
    reasoning,
  });

  return {
    subject: foundation.subject,
    question: foundation.question,
    mission: foundation.mission,
    evidence,
    relationships,
    reasoning,
    workflow,
    pipelineTrace: buildPipelineTrace(evidence, relationships),
    extensions: {},
  };
}
