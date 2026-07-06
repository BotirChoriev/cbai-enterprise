/**
 * CBAI Evidence Pipeline Architecture — flow helpers.
 * Describes evidence movement through stages — no execution.
 */

import {
  getOrderedPipelineStages,
  getPipelineStageById,
} from "@/lib/evidence-pipeline/pipeline-stage";
import { OFFICIAL_EVIDENCE_PIPELINE_ID } from "@/lib/evidence-pipeline/pipeline-builder";
import type {
  PipelineFlowPosition,
  PipelineFlowTrace,
  PipelineId,
  PipelineStageId,
} from "@/lib/evidence-pipeline/pipeline-types";

/** Get the next stage in the canonical pipeline order, if any. */
export function getNextPipelineStage(
  currentStageId: PipelineStageId,
): PipelineStageId | null {
  const stages = getOrderedPipelineStages();
  const index = stages.findIndex((stage) => stage.id === currentStageId);
  if (index === -1 || index >= stages.length - 1) return null;
  return stages[index + 1].id;
}

/** Get the previous stage in the canonical pipeline order, if any. */
export function getPreviousPipelineStage(
  currentStageId: PipelineStageId,
): PipelineStageId | null {
  const stages = getOrderedPipelineStages();
  const index = stages.findIndex((stage) => stage.id === currentStageId);
  if (index <= 0) return null;
  return stages[index - 1].id;
}

/** Describe a single flow position for a pipeline stage. */
export function describePipelineFlowPosition(
  pipelineId: PipelineId,
  stageId: PipelineStageId,
): PipelineFlowPosition | null {
  const stage = getPipelineStageById(stageId);
  if (!stage) return null;

  return {
    pipelineId,
    stageId: stage.id,
    stageOrder: stage.order,
    stageLabel: stage.label,
    pendingValidationRules: stage.validationRuleIds,
    pendingNormalizers: stage.normalizerKinds.map((kind) => kind),
  };
}

/** Build a declarative flow trace for a connector through all pipeline stages. */
export function tracePipelineFlow(
  connectorId: string,
  pipelineId: PipelineId = OFFICIAL_EVIDENCE_PIPELINE_ID,
): PipelineFlowTrace {
  const stages = getOrderedPipelineStages().map((stage) => ({
    pipelineId,
    stageId: stage.id,
    stageOrder: stage.order,
    stageLabel: stage.label,
    pendingValidationRules: stage.validationRuleIds,
    pendingNormalizers: [...stage.normalizerKinds],
  }));

  return {
    pipelineId,
    connectorId,
    stages,
    totalStages: stages.length,
    description: `Declarative evidence flow for connector "${connectorId}" through ${stages.length} pipeline stages — no execution.`,
  };
}

/** List all stage transitions as ordered pairs — documentation helper. */
export function listPipelineStageTransitions(): readonly {
  from: PipelineStageId;
  to: PipelineStageId;
  fromLabel: string;
  toLabel: string;
}[] {
  const stages = getOrderedPipelineStages();
  const transitions: {
    from: PipelineStageId;
    to: PipelineStageId;
    fromLabel: string;
    toLabel: string;
  }[] = [];

  for (let i = 0; i < stages.length - 1; i += 1) {
    transitions.push({
      from: stages[i].id,
      to: stages[i + 1].id,
      fromLabel: stages[i].label,
      toLabel: stages[i + 1].label,
    });
  }

  return transitions;
}

/** Human-readable summary of evidence movement through the pipeline. */
export function summarizePipelineFlow(pipelineId: PipelineId): string {
  const stages = getOrderedPipelineStages();
  const labels = stages.map((stage) => stage.label);
  return `${pipelineId}: ${labels.join(" → ")}`;
}
